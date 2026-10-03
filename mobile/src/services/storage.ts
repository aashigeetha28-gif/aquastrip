import { TestRecord, AlertRecord, AlertStatus, Village } from '../types';
import { sqliteService } from './sqliteService';
import { MOCK_VILLAGES } from './mockData';

class StorageService {
  async getTests(): Promise<TestRecord[]> {
    return sqliteService.getAllTests();
  }

  async saveTest(test: TestRecord): Promise<TestRecord> {
    return sqliteService.saveTest(test);
  }

  async getAlerts(): Promise<AlertRecord[]> {
    return sqliteService.getAllAlerts();
  }

  async updateAlertStatus(
    alertId: string,
    status: AlertStatus,
    assignedToName?: string
  ): Promise<AlertRecord | null> {
    return sqliteService.updateAlertStatus(alertId, status, undefined, assignedToName);
  }

  async getVillages(): Promise<Village[]> {
    return [...MOCK_VILLAGES];
  }

  async getSyncStats(): Promise<{ pending: number; synced: number; total: number }> {
    return sqliteService.getSyncStats();
  }
}

export const storageService = new StorageService();
