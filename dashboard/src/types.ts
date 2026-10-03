export type UserRole = 'worker' | 'supervisor' | 'officer';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  district?: string;
}

export type FrcStatus = 'low' | 'safe' | 'high';
export type AlertStatus = 'open' | 'recheck_assigned' | 'rechlorinated';

export interface TestRecord {
  id: string;
  worker_id: string;
  worker_name?: string;
  village_id: string;
  village_name: string;
  batch_id: string;
  blue_pad_count: number;
  frc_range: string;
  frc_numeric: number;
  status: FrcStatus;
  lat: number;
  lng: number;
  location_accuracy?: number;
  notes?: string;
  tested_at: string;
  synced_at?: string | null;
}

export interface AlertRecord {
  id: string;
  test_id: string;
  village_id: string;
  village_name: string;
  frc_range: string;
  worker_name: string;
  status: AlertStatus;
  assigned_to?: string | null;
  assigned_to_name?: string | null;
  notes?: string;
  created_at: string;
  updated_at?: string;
  resolved_at?: string | null;
}

export interface VillageStatus {
  id: string;
  name: string;
  lat: number;
  lng: number;
  latestStatus: FrcStatus;
  latestFrcRange: string;
  latestTestedAt: string;
  totalTests: number;
  safePercentage: number;
  openAlertsCount: number;
}
