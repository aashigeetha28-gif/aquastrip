import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  StripBatch,
  PadDetectionResult,
  TestRecord,
  AlertRecord,
  AlertStatus,
  Village,
} from '../types';
import { sqliteService } from '../services/sqliteService';
import { syncService, SyncResult } from '../services/syncService';
import { calculateFrc } from '../services/frcCalculator';
import { getCurrentLocation } from '../services/locationService';
import { manualOverridePads } from '../services/padDetector';
import { sendOfflineSmsFallback } from '../services/smsFallbackService';
import { notifyAlertAssigned } from '../services/notificationService';
import { MOCK_VILLAGES } from '../services/mockData';
import { useAuth } from './AuthContext';

interface TestContextType {
  scannedBatch: StripBatch | null;
  capturedPhotoUri: string | null;
  padDetection: PadDetectionResult | null;
  activeVillage: Village;
  isOverridden: boolean;
  isSaving: boolean;

  setScannedBatch: (batch: StripBatch | null) => void;
  setCapturedPhotoUri: (uri: string | null) => void;
  setPadDetection: (result: PadDetectionResult | null) => void;
  togglePadState: (padIndex: number) => void;
  setActiveVillage: (village: Village) => void;
  resetCurrentTest: () => void;
  saveCurrentTest: (notes?: string) => Promise<TestRecord>;

  // Data lists & SQLite store
  tests: TestRecord[];
  alerts: AlertRecord[];
  syncStats: { pending: number; synced: number; total: number };
  refreshData: () => Promise<void>;

  // Alert management actions
  updateAlertStatus: (alertId: string, status: AlertStatus) => Promise<void>;
  assignRecheck: (alertId: string, workerId: string, workerName: string) => Promise<void>;
  markAlertRechlorinated: (alertId: string) => Promise<void>;
  sendOfflineFallbackSmsForAlert: (alertId: string) => Promise<boolean>;
  findPendingAlertForVillage: (villageId: string) => AlertRecord | undefined;

  // Sync & network
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  triggerSync: () => Promise<SyncResult>;
  setSimulatedNetworkStatus: (online: boolean) => void;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [scannedBatch, setScannedBatch] = useState<StripBatch | null>(null);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [padDetection, setPadDetection] = useState<PadDetectionResult | null>(null);
  const [isOverridden, setIsOverridden] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeVillage, setActiveVillage] = useState<Village>(MOCK_VILLAGES[0]);

  const [tests, setTests] = useState<TestRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [syncStats, setSyncStats] = useState({ pending: 0, synced: 0, total: 0 });

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    await sqliteService.initDb();
    const [t, a, s] = await Promise.all([
      sqliteService.getAllTests(),
      sqliteService.getAllAlerts(),
      sqliteService.getSyncStats(),
    ]);
    setTests(t);
    setAlerts(a);
    setSyncStats(s);
  }, []);

  useEffect(() => {
    syncService.init();

    const unsubscribe = syncService.subscribe((status) => {
      setIsOnline(status.isOnline);
      setIsSyncing(status.isSyncing);
      setLastSyncedAt(status.lastSyncedAt);
      refreshData();
    });

    refreshData();

    return () => {
      unsubscribe();
      syncService.destroy();
    };
  }, [refreshData]);

  const togglePadState = (padIndex: number) => {
    if (!padDetection) return;

    const updatedPads = manualOverridePads(padDetection.pads, padIndex);
    const newBlueCount = updatedPads.filter((p) => p.isBlue).length;

    setPadDetection({
      ...padDetection,
      pads: updatedPads,
      bluePadCount: newBlueCount,
    });
    setIsOverridden(true);
  };

  const resetCurrentTest = () => {
    setScannedBatch(null);
    setCapturedPhotoUri(null);
    setPadDetection(null);
    setIsOverridden(false);
  };

  const saveCurrentTest = async (notes?: string): Promise<TestRecord> => {
    if (!scannedBatch) throw new Error('No valid strip batch scanned.');
    if (!padDetection) throw new Error('Pad detection not completed.');

    setIsSaving(true);
    try {
      const location = await getCurrentLocation();
      const frc = calculateFrc(padDetection.bluePadCount);

      // Client-generated unique test ID
      const uniqueTestId = `test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      const newRecord: TestRecord = {
        id: uniqueTestId,
        worker_id: currentUser.id,
        worker_name: currentUser.name,
        village_id: activeVillage.id,
        village_name: activeVillage.name,
        batch_id: scannedBatch.batch_id,
        batch_expiry: scannedBatch.expiry,
        blue_pad_count: padDetection.bluePadCount,
        frc_range: frc.frcRange,
        frc_numeric: frc.numericPpm,
        status: frc.status,
        lat: location.lat,
        lng: location.lng,
        location_accuracy: location.accuracy,
        photo_uri: capturedPhotoUri || undefined,
        tested_at: new Date().toISOString(),
        synced_at: null,
        sync_status: 'pending',
        notes: notes || undefined,
        is_override: isOverridden,
      };

      const saved = await sqliteService.saveTest(newRecord);
      await refreshData();

      // Trigger background sync if online
      if (isOnline) {
        syncService.syncPendingRecords().then(() => refreshData()).catch(console.warn);
      }

      return saved;
    } finally {
      setIsSaving(false);
    }
  };

  const updateAlertStatus = async (alertId: string, status: AlertStatus) => {
    await sqliteService.updateAlertStatus(alertId, status);
    await refreshData();
    if (isOnline) syncService.syncPendingRecords().catch(console.warn);
  };

  const assignRecheck = async (alertId: string, workerId: string, workerName: string) => {
    const updated = await sqliteService.updateAlertStatus(alertId, 'recheck_assigned', workerId, workerName);
    await refreshData();

    // Trigger local notification if assigned to current user
    if (updated && (workerId === currentUser.id || workerName === currentUser.name)) {
      notifyAlertAssigned(updated).catch(console.warn);
    }

    if (isOnline) syncService.syncPendingRecords().catch(console.warn);
  };

  const markAlertRechlorinated = async (alertId: string) => {
    await sqliteService.updateAlertStatus(alertId, 'rechlorinated');
    await refreshData();
    if (isOnline) syncService.syncPendingRecords().catch(console.warn);
  };

  const sendOfflineFallbackSmsForAlert = async (alertId: string): Promise<boolean> => {
    const alert = alerts.find((a) => a.id === alertId);
    if (!alert) return false;

    const timeFormatted = new Date(alert.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const success = await sendOfflineSmsFallback({
      village: alert.village_name,
      frcRange: alert.frc_range,
      time: timeFormatted,
      workerId: currentUser.id,
    });

    if (success) {
      await sqliteService.markAlertSmsFallbackSent(alertId);
      await refreshData();
    }
    return success;
  };

  const findPendingAlertForVillage = (villageId: string): AlertRecord | undefined => {
    return alerts.find(
      (a) => a.village_id === villageId && (a.status === 'open' || a.status === 'recheck_assigned')
    );
  };

  const triggerSync = async (): Promise<SyncResult> => {
    const res = await syncService.syncPendingRecords();
    await refreshData();
    return res;
  };

  const setSimulatedNetworkStatus = (online: boolean) => {
    syncService.setSimulatedNetworkStatus(online);
  };

  return (
    <TestContext.Provider
      value={{
        scannedBatch,
        capturedPhotoUri,
        padDetection,
        activeVillage,
        isOverridden,
        isSaving,
        setScannedBatch,
        setCapturedPhotoUri,
        setPadDetection,
        togglePadState,
        setActiveVillage,
        resetCurrentTest,
        saveCurrentTest,
        tests,
        alerts,
        syncStats,
        refreshData,
        updateAlertStatus,
        assignRecheck,
        markAlertRechlorinated,
        sendOfflineFallbackSmsForAlert,
        findPendingAlertForVillage,
        isOnline,
        isSyncing,
        lastSyncedAt,
        triggerSync,
        setSimulatedNetworkStatus,
      }}
    >
      {children}
    </TestContext.Provider>
  );
};

export function useTest(): TestContextType {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
}
