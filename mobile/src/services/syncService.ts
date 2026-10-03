import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { sqliteService } from './sqliteService';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { TestRecord, AlertRecord } from '../types';

export interface SyncResult {
  syncedCount: number;
  failedCount: number;
  isOnline: boolean;
  message: string;
}

type SyncListener = (status: {
  isSyncing: boolean;
  isOnline: boolean;
  lastSyncedAt: string | null;
  pendingCount: number;
}) => void;

class SyncService {
  private isSyncing = false;
  private isOnline = true;
  private lastSyncedAt: string | null = null;
  private listeners: Set<SyncListener> = new Set();
  private unsubscribeNetInfo: (() => void) | null = null;

  init(): void {
    NetInfo.fetch().then((state) => {
      this.isOnline = Boolean(state.isConnected);
      this.notifyListeners();
    });

    this.unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      const previouslyOffline = !this.isOnline;
      this.isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);

      this.notifyListeners();

      if (previouslyOffline && this.isOnline) {
        console.log('[SyncService] Online. Initiating auto-sync for tests & alerts...');
        this.syncPendingRecords().catch(console.warn);
      }
    });
  }

  destroy(): void {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
      this.unsubscribeNetInfo = null;
    }
    this.listeners.clear();
  }

  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    this.notifyListeners();
    return () => this.listeners.delete(listener);
  }

  private async notifyListeners(): Promise<void> {
    const stats = await sqliteService.getSyncStats();
    for (const listener of this.listeners) {
      listener({
        isSyncing: this.isSyncing,
        isOnline: this.isOnline,
        lastSyncedAt: this.lastSyncedAt,
        pendingCount: stats.pending,
      });
    }
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }

  getIsSyncing(): boolean {
    return this.isSyncing;
  }

  getLastSyncedAt(): string | null {
    return this.lastSyncedAt;
  }

  /**
   * Syncs pending tests and alerts to Supabase with idempotency and triggers Edge Function for SMS.
   */
  async syncPendingRecords(): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        syncedCount: 0,
        failedCount: 0,
        isOnline: this.isOnline,
        message: 'Sync already in progress.',
      };
    }

    this.isSyncing = true;
    this.notifyListeners();

    try {
      const pendingTests = await sqliteService.getPendingTests();
      const pendingAlerts = await sqliteService.getPendingAlerts();

      if (pendingTests.length === 0 && pendingAlerts.length === 0) {
        this.lastSyncedAt = new Date().toISOString();
        return {
          syncedCount: 0,
          failedCount: 0,
          isOnline: this.isOnline,
          message: 'All records are already synced.',
        };
      }

      let syncedCount = 0;
      let failedCount = 0;
      const nowIso = new Date().toISOString();

      if (isSupabaseConfigured) {
        // 1. Sync Tests
        for (const test of pendingTests) {
          try {
            const { error } = await supabase.from('tests').upsert(
              {
                id: test.id,
                worker_id: test.worker_id,
                worker_name: test.worker_name,
                village_id: test.village_id,
                village_name: test.village_name,
                batch_id: test.batch_id,
                batch_expiry: test.batch_expiry || null,
                blue_pad_count: test.blue_pad_count,
                frc_range: test.frc_range,
                frc_numeric: test.frc_numeric,
                status: test.status,
                lat: test.lat,
                lng: test.lng,
                location_accuracy: test.location_accuracy,
                photo_uri: test.photo_uri,
                notes: test.notes,
                is_override: test.is_override,
                tested_at: test.tested_at,
                synced_at: nowIso,
              },
              { onConflict: 'id' }
            );

            if (error) throw error;

            await sqliteService.markTestSynced(test.id, nowIso);
            syncedCount++;
          } catch (err: any) {
            console.error(`[SyncService] Failed syncing test ${test.id}:`, err);
            failedCount++;
          }
        }

        // 2. Sync Alerts and Trigger Online SMS Edge Function
        for (const alert of pendingAlerts) {
          try {
            const { error } = await supabase.from('alerts').upsert(
              {
                id: alert.id,
                test_id: alert.test_id,
                village_id: alert.village_id,
                village_name: alert.village_name,
                frc_range: alert.frc_range,
                worker_name: alert.worker_name,
                status: alert.status,
                assigned_to: alert.assigned_to,
                assigned_to_name: alert.assigned_to_name,
                sms_status: alert.sms_sent_via_fallback ? 'fallback_sent' : alert.sms_status,
                sms_sent_via_fallback: alert.sms_sent_via_fallback,
                notes: alert.notes,
                created_at: alert.created_at,
                updated_at: alert.updated_at || nowIso,
                resolved_at: alert.resolved_at,
              },
              { onConflict: 'id' }
            );

            if (error) throw error;

            // Trigger Edge Function send-low-frc-sms if alert is Low and SMS not yet dispatched
            if (!alert.sms_sent_via_fallback && alert.sms_status === 'pending') {
              try {
                await supabase.functions.invoke('send-low-frc-sms', {
                  body: { alert_id: alert.id },
                });
              } catch (smsErr) {
                console.warn('[SyncService] Edge function invoke warning:', smsErr);
              }
            }

            await sqliteService.markAlertSynced(alert.id, nowIso);
          } catch (err: any) {
            console.error(`[SyncService] Failed syncing alert ${alert.id}:`, err);
          }
        }
      } else {
        // Simulated local sync for testing
        await new Promise((resolve) => setTimeout(resolve, 500));

        for (const test of pendingTests) {
          await sqliteService.markTestSynced(test.id, nowIso);
          syncedCount++;
        }

        for (const alert of pendingAlerts) {
          await sqliteService.markAlertSynced(alert.id, nowIso);
        }
      }

      this.lastSyncedAt = nowIso;

      return {
        syncedCount,
        failedCount,
        isOnline: this.isOnline,
        message:
          failedCount === 0
            ? `Synced ${syncedCount} records with JJM Cloud.`
            : `Synced ${syncedCount} records; ${failedCount} retry queued.`,
      };
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  setSimulatedNetworkStatus(online: boolean): void {
    const wasOffline = !this.isOnline;
    this.isOnline = online;
    this.notifyListeners();

    if (wasOffline && online) {
      this.syncPendingRecords().catch(console.warn);
    }
  }
}

export const syncService = new SyncService();
