import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateFrc } from '../services/frcCalculator.ts';
import { sqliteService } from '../services/sqliteService.ts';
import { TestRecord } from '../types/index.ts';

describe('Cl-Ladder Core Test Suite', () => {
  // 1. Pad count to FRC mapping tests
  describe('Pad count to FRC range & safety mapping', () => {
    it('should map 0 pads to <0.1 ppm (Low)', () => {
      const res = calculateFrc(0);
      assert.strictEqual(res.frcRange, '<0.1 ppm');
      assert.strictEqual(res.status, 'low');
      assert.strictEqual(res.actionRequired, true);
    });

    it('should map 1 pad to 0.1-0.2 ppm (Low)', () => {
      const res = calculateFrc(1);
      assert.strictEqual(res.frcRange, '0.1-0.2 ppm');
      assert.strictEqual(res.status, 'low');
      assert.strictEqual(res.actionRequired, true);
    });

    it('should map 2 pads to 0.2-0.5 ppm (Safe)', () => {
      const res = calculateFrc(2);
      assert.strictEqual(res.frcRange, '0.2-0.5 ppm');
      assert.strictEqual(res.status, 'safe');
      assert.strictEqual(res.actionRequired, false);
    });

    it('should map 3 pads to 0.5-1.0 ppm (Safe)', () => {
      const res = calculateFrc(3);
      assert.strictEqual(res.frcRange, '0.5-1.0 ppm');
      assert.strictEqual(res.status, 'safe');
      assert.strictEqual(res.actionRequired, false);
    });

    it('should map 4 pads to 1.0-2.0 ppm (High)', () => {
      const res = calculateFrc(4);
      assert.strictEqual(res.frcRange, '1.0-2.0 ppm');
      assert.strictEqual(res.status, 'high');
    });

    it('should map 5 pads to 2.0-5.0 ppm (High)', () => {
      const res = calculateFrc(5);
      assert.strictEqual(res.frcRange, '2.0-5.0 ppm');
      assert.strictEqual(res.status, 'high');
    });

    it('should map 6 pads to >=5.0 ppm (High)', () => {
      const res = calculateFrc(6);
      assert.strictEqual(res.frcRange, '>=5.0 ppm');
      assert.strictEqual(res.status, 'high');
      assert.strictEqual(res.actionRequired, true);
    });
  });

  // 2. Low-FRC alert creation without duplicates
  describe('Low-FRC alert creation & deduplication', () => {
    it('should auto-create alert for Low-FRC test and prevent duplicate alerts on re-save', async () => {
      const uniqueTestId = `test_unit_${Date.now()}`;
      const lowTest: TestRecord = {
        id: uniqueTestId,
        worker_id: 'usr_worker_01',
        worker_name: 'Ramesh Kumar',
        village_id: 'vil_01',
        village_name: 'Khed (Gram Panchayat)',
        batch_id: 'JJM-2026-B4',
        batch_expiry: '2026-12-31',
        blue_pad_count: 1,
        frc_range: '0.1-0.2 ppm',
        frc_numeric: 0.15,
        status: 'low',
        lat: 18.8471,
        lng: 73.9118,
        tested_at: new Date().toISOString(),
        synced_at: null,
        sync_status: 'pending',
      };

      // First save
      await sqliteService.saveTest(lowTest);

      let alerts = await sqliteService.getAllAlerts();
      const createdAlerts = alerts.filter((a) => a.test_id === uniqueTestId);
      assert.strictEqual(createdAlerts.length, 1, 'Exactly one alert must be created');
      assert.strictEqual(createdAlerts[0].status, 'open');
      assert.strictEqual(createdAlerts[0].id, `alert_${uniqueTestId}`);

      // Second save (simulating sync retry or repeated insert with same client ID)
      await sqliteService.saveTest(lowTest);

      alerts = await sqliteService.getAllAlerts();
      const alertsAfterRetry = alerts.filter((a) => a.test_id === uniqueTestId);
      assert.strictEqual(alertsAfterRetry.length, 1, 'Duplicate alert must NOT be created on retry');
    });

    it('should not create an alert for a Safe test', async () => {
      const safeTestId = `test_safe_${Date.now()}`;
      const safeTest: TestRecord = {
        id: safeTestId,
        worker_id: 'usr_worker_01',
        worker_name: 'Ramesh Kumar',
        village_id: 'vil_01',
        village_name: 'Khed (Gram Panchayat)',
        batch_id: 'JJM-2026-B4',
        batch_expiry: '2026-12-31',
        blue_pad_count: 3,
        frc_range: '0.5-1.0 ppm',
        frc_numeric: 0.75,
        status: 'safe',
        lat: 18.8471,
        lng: 73.9118,
        tested_at: new Date().toISOString(),
        synced_at: null,
        sync_status: 'pending',
      };

      await sqliteService.saveTest(safeTest);

      const alerts = await sqliteService.getAllAlerts();
      const alert = alerts.find((a) => a.test_id === safeTestId);
      assert.strictEqual(alert, undefined, 'Safe test must not generate a Low-FRC alert');
    });
  });

  // 3. Sync idempotency
  describe('Sync idempotency', () => {
    it('should mark test synced idempotently without duplicate records', async () => {
      const testId = `test_sync_${Date.now()}`;
      const test: TestRecord = {
        id: testId,
        worker_id: 'usr_worker_01',
        worker_name: 'Ramesh Kumar',
        village_id: 'vil_02',
        village_name: 'Shirur (East Ward)',
        batch_id: 'JJM-2026-B4',
        blue_pad_count: 2,
        frc_range: '0.2-0.5 ppm',
        frc_numeric: 0.35,
        status: 'safe',
        lat: 18.8268,
        lng: 74.3789,
        tested_at: new Date().toISOString(),
        synced_at: null,
        sync_status: 'pending',
      };

      await sqliteService.saveTest(test);

      const syncTime1 = new Date().toISOString();
      await sqliteService.markTestSynced(testId, syncTime1);

      let allTests = await sqliteService.getAllTests();
      let matched = allTests.filter((t) => t.id === testId);
      assert.strictEqual(matched.length, 1);
      assert.strictEqual(matched[0].sync_status, 'synced');
      assert.strictEqual(matched[0].synced_at, syncTime1);

      // Repeat sync (simulating network reconnect re-acknowledgement)
      const syncTime2 = new Date(Date.now() + 1000).toISOString();
      await sqliteService.markTestSynced(testId, syncTime2);

      allTests = await sqliteService.getAllTests();
      matched = allTests.filter((t) => t.id === testId);
      assert.strictEqual(matched.length, 1, 'Total test count for ID must remain 1');
      assert.strictEqual(matched[0].sync_status, 'synced');
      assert.strictEqual(matched[0].synced_at, syncTime2);
    });
  });
});
