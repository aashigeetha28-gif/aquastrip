import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { TestRecord, AlertRecord, AlertStatus } from '../types';
import { INITIAL_TESTS, INITIAL_ALERTS } from './mockData';

const DB_NAME = 'cl_ladder.db';

class SqliteService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  // In-memory store for web environments and fast reactive state
  private memoryTests: TestRecord[] = [...INITIAL_TESTS];
  private memoryAlerts: AlertRecord[] = [...INITIAL_ALERTS];

  async initDb(): Promise<void> {
    if (this.isInitialized) return;

    if (Platform.OS === 'web') {
      try {
        this.db = await SQLite.openDatabaseAsync(DB_NAME);
        await this.createTables();
      } catch (err) {
        console.warn('Web SQLite fallback to structured memory store:', err);
      }
      this.isInitialized = true;
      return;
    }

    try {
      this.db = await SQLite.openDatabaseAsync(DB_NAME);
      await this.createTables();
      await this.seedInitialDataIfEmpty();
      this.isInitialized = true;
    } catch (err) {
      console.error('Failed to initialize SQLite database:', err);
      this.isInitialized = true;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS tests (
        id TEXT PRIMARY KEY,
        worker_id TEXT NOT NULL,
        worker_name TEXT,
        village_id TEXT NOT NULL,
        village_name TEXT,
        batch_id TEXT NOT NULL,
        batch_expiry TEXT,
        blue_pad_count INTEGER NOT NULL,
        frc_range TEXT NOT NULL,
        frc_numeric REAL,
        status TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        location_accuracy REAL,
        photo_uri TEXT,
        notes TEXT,
        is_override INTEGER DEFAULT 0,
        tested_at TEXT NOT NULL,
        synced_at TEXT,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        retry_count INTEGER DEFAULT 0,
        last_sync_error TEXT
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        test_id TEXT NOT NULL,
        village_id TEXT NOT NULL,
        village_name TEXT,
        frc_range TEXT,
        worker_name TEXT,
        status TEXT NOT NULL,
        assigned_to TEXT,
        assigned_to_name TEXT,
        sms_status TEXT NOT NULL DEFAULT 'pending',
        sms_sent_via_fallback INTEGER DEFAULT 0,
        sms_error TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT,
        resolved_at TEXT,
        sync_status TEXT NOT NULL DEFAULT 'pending'
      );
    `);
  }

  private async seedInitialDataIfEmpty(): Promise<void> {
    if (!this.db) return;

    const countResult = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM tests;'
    );

    if (countResult && countResult.count === 0) {
      for (const t of INITIAL_TESTS) {
        await this.db.runAsync(
          `INSERT OR IGNORE INTO tests (
            id, worker_id, worker_name, village_id, village_name, batch_id, batch_expiry,
            blue_pad_count, frc_range, frc_numeric, status, lat, lng, location_accuracy,
            photo_uri, notes, is_override, tested_at, synced_at, sync_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            t.id,
            t.worker_id,
            t.worker_name || null,
            t.village_id,
            t.village_name || null,
            t.batch_id,
            t.batch_expiry || null,
            t.blue_pad_count,
            t.frc_range,
            t.frc_numeric,
            t.status,
            t.lat,
            t.lng,
            t.location_accuracy || null,
            t.photo_uri || null,
            t.notes || null,
            t.is_override ? 1 : 0,
            t.tested_at,
            t.synced_at,
            t.sync_status,
          ]
        );
      }

      for (const a of INITIAL_ALERTS) {
        await this.db.runAsync(
          `INSERT OR IGNORE INTO alerts (
            id, test_id, village_id, village_name, frc_range, worker_name, status,
            assigned_to, assigned_to_name, sms_status, sms_sent_via_fallback, notes,
            created_at, updated_at, resolved_at, sync_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            a.id,
            a.test_id,
            a.village_id,
            a.village_name,
            a.frc_range,
            a.worker_name,
            a.status,
            a.assigned_to,
            a.assigned_to_name || null,
            a.sms_status,
            a.sms_sent_via_fallback ? 1 : 0,
            a.notes || null,
            a.created_at,
            a.updated_at || null,
            a.resolved_at || null,
            a.sync_status || 'synced',
          ]
        );
      }
    }
  }

  async saveTest(test: TestRecord): Promise<TestRecord> {
    await this.initDb();

    if (this.db) {
      try {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO tests (
            id, worker_id, worker_name, village_id, village_name, batch_id, batch_expiry,
            blue_pad_count, frc_range, frc_numeric, status, lat, lng, location_accuracy,
            photo_uri, notes, is_override, tested_at, synced_at, sync_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            test.id,
            test.worker_id,
            test.worker_name || null,
            test.village_id,
            test.village_name || null,
            test.batch_id,
            test.batch_expiry || null,
            test.blue_pad_count,
            test.frc_range,
            test.frc_numeric,
            test.status,
            test.lat,
            test.lng,
            test.location_accuracy || null,
            test.photo_uri || null,
            test.notes || null,
            test.is_override ? 1 : 0,
            test.tested_at,
            test.synced_at,
            test.sync_status,
          ]
        );

        if (test.status === 'low') {
          const alertId = `alert_${test.id}`;
          await this.db.runAsync(
            `INSERT OR REPLACE INTO alerts (
              id, test_id, village_id, village_name, frc_range, worker_name, status,
              assigned_to, assigned_to_name, sms_status, sms_sent_via_fallback, notes,
              created_at, updated_at, resolved_at, sync_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
              alertId,
              test.id,
              test.village_id,
              test.village_name || 'Village Water Post',
              `${test.frc_range} (Low)`,
              test.worker_name || 'Volunteer',
              'open',
              null,
              null,
              'pending',
              0,
              `Chlorine level ${test.frc_range} is below safe limit (0.2 ppm). Immediate rechlorination required.`,
              new Date().toISOString(),
              null,
              null,
              'pending',
            ]
          );
        }
      } catch (err) {
        console.warn('SQLite write fallback:', err);
      }
    }

    // Update memory cache
    const existingIdx = this.memoryTests.findIndex((t) => t.id === test.id);
    if (existingIdx >= 0) {
      this.memoryTests[existingIdx] = test;
    } else {
      this.memoryTests.unshift(test);
    }

    if (test.status === 'low') {
      const newAlert: AlertRecord = {
        id: `alert_${test.id}`,
        test_id: test.id,
        village_id: test.village_id,
        village_name: test.village_name || 'Village Water Post',
        frc_range: `${test.frc_range} (Low)`,
        worker_name: test.worker_name || 'Volunteer',
        status: 'open',
        assigned_to: null,
        sms_status: 'pending',
        sms_sent_via_fallback: false,
        created_at: new Date().toISOString(),
        notes: `Chlorine level ${test.frc_range} is below safe limit (0.2 ppm). Immediate rechlorination required.`,
        sync_status: 'pending',
      };
      const existingAlertIdx = this.memoryAlerts.findIndex((a) => a.id === newAlert.id);
      if (existingAlertIdx >= 0) {
        this.memoryAlerts[existingAlertIdx] = newAlert;
      } else {
        this.memoryAlerts.unshift(newAlert);
      }
    }

    return test;
  }

  async getAllTests(): Promise<TestRecord[]> {
    await this.initDb();

    if (this.db) {
      try {
        const rows = await this.db.getAllAsync<any>(
          'SELECT * FROM tests ORDER BY tested_at DESC;'
        );
        if (rows && rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            worker_id: r.worker_id,
            worker_name: r.worker_name,
            village_id: r.village_id,
            village_name: r.village_name,
            batch_id: r.batch_id,
            batch_expiry: r.batch_expiry,
            blue_pad_count: r.blue_pad_count,
            frc_range: r.frc_range,
            frc_numeric: r.frc_numeric,
            status: r.status,
            lat: r.lat,
            lng: r.lng,
            location_accuracy: r.location_accuracy,
            photo_uri: r.photo_uri,
            notes: r.notes,
            is_override: Boolean(r.is_override),
            tested_at: r.tested_at,
            synced_at: r.synced_at,
            sync_status: r.sync_status,
          }));
        }
      } catch (err) {
        console.warn('SQLite read fallback to memory:', err);
      }
    }

    return [...this.memoryTests].sort(
      (a, b) => new Date(b.tested_at).getTime() - new Date(a.tested_at).getTime()
    );
  }

  async getPendingTests(): Promise<TestRecord[]> {
    const all = await this.getAllTests();
    return all.filter((t) => t.sync_status === 'pending');
  }

  async markTestSynced(testId: string, syncedAt: string): Promise<void> {
    if (this.db) {
      try {
        await this.db.runAsync(
          'UPDATE tests SET sync_status = ?, synced_at = ? WHERE id = ?;',
          ['synced', syncedAt, testId]
        );
      } catch (err) {
        console.warn('SQLite update sync failed:', err);
      }
    }

    const test = this.memoryTests.find((t) => t.id === testId);
    if (test) {
      test.sync_status = 'synced';
      test.synced_at = syncedAt;
    }
  }

  async getAllAlerts(): Promise<AlertRecord[]> {
    await this.initDb();

    if (this.db) {
      try {
        const rows = await this.db.getAllAsync<any>(
          'SELECT * FROM alerts ORDER BY created_at DESC;'
        );
        if (rows && rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            test_id: r.test_id,
            village_id: r.village_id,
            village_name: r.village_name,
            frc_range: r.frc_range,
            worker_name: r.worker_name,
            status: r.status,
            assigned_to: r.assigned_to,
            assigned_to_name: r.assigned_to_name,
            sms_status: r.sms_status,
            sms_sent_via_fallback: Boolean(r.sms_sent_via_fallback),
            sms_error: r.sms_error,
            notes: r.notes,
            created_at: r.created_at,
            updated_at: r.updated_at,
            resolved_at: r.resolved_at,
            sync_status: r.sync_status,
          }));
        }
      } catch (err) {
        console.warn('SQLite read alerts fallback to memory:', err);
      }
    }

    return [...this.memoryAlerts].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async getPendingAlerts(): Promise<AlertRecord[]> {
    const all = await this.getAllAlerts();
    return all.filter((a) => a.sync_status === 'pending');
  }

  async updateAlertStatus(
    alertId: string,
    status: AlertStatus,
    assignedToId?: string | null,
    assignedToName?: string | null
  ): Promise<AlertRecord | null> {
    const updatedAt = new Date().toISOString();
    const resolvedAt = status === 'rechlorinated' ? updatedAt : null;

    if (this.db) {
      try {
        await this.db.runAsync(
          `UPDATE alerts SET 
            status = ?, 
            updated_at = ?, 
            resolved_at = ?,
            assigned_to = COALESCE(?, assigned_to),
            assigned_to_name = COALESCE(?, assigned_to_name),
            sync_status = 'pending'
          WHERE id = ?;`,
          [status, updatedAt, resolvedAt, assignedToId || null, assignedToName || null, alertId]
        );
      } catch (err) {
        console.warn('SQLite update alert failed:', err);
      }
    }

    const alert = this.memoryAlerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = status;
      alert.updated_at = updatedAt;
      if (resolvedAt) alert.resolved_at = resolvedAt;
      if (assignedToId !== undefined) alert.assigned_to = assignedToId;
      if (assignedToName !== undefined) alert.assigned_to_name = assignedToName || undefined;
      alert.sync_status = 'pending';
      return { ...alert };
    }
    return null;
  }

  async markAlertSmsFallbackSent(alertId: string): Promise<void> {
    if (this.db) {
      try {
        await this.db.runAsync(
          `UPDATE alerts SET sms_sent_via_fallback = 1, sms_status = 'fallback_sent', sync_status = 'pending' WHERE id = ?;`,
          [alertId]
        );
      } catch (err) {
        console.warn('SQLite mark fallback sent failed:', err);
      }
    }

    const alert = this.memoryAlerts.find((a) => a.id === alertId);
    if (alert) {
      alert.sms_sent_via_fallback = true;
      alert.sms_status = 'fallback_sent';
      alert.sync_status = 'pending';
    }
  }

  async markAlertSynced(alertId: string, syncedAt: string): Promise<void> {
    if (this.db) {
      try {
        await this.db.runAsync(
          `UPDATE alerts SET sync_status = 'synced', updated_at = ? WHERE id = ?;`,
          [syncedAt, alertId]
        );
      } catch (err) {
        console.warn('SQLite mark alert synced failed:', err);
      }
    }

    const alert = this.memoryAlerts.find((a) => a.id === alertId);
    if (alert) {
      alert.sync_status = 'synced';
    }
  }

  async getSyncStats(): Promise<{ pending: number; synced: number; total: number }> {
    const tests = await this.getAllTests();
    const pending = tests.filter((t) => t.sync_status === 'pending').length;
    const synced = tests.filter((t) => t.sync_status === 'synced').length;
    return {
      pending,
      synced,
      total: tests.length,
    };
  }
}

export const sqliteService = new SqliteService();
