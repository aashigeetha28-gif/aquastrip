export type UserRole = 'worker' | 'supervisor' | 'officer';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  village_id?: string;
  district?: string;
}

export interface Village {
  id: string;
  name: string;
  lat: number;
  lng: number;
  district: string;
  state: string;
}

export interface StripBatch {
  batch_id: string;
  expiry: string; // YYYY-MM-DD
  manufactured_date?: string;
  manufacturer?: string;
  is_valid: boolean;
}

export type FrcStatus = 'low' | 'safe' | 'high';

export interface PadClassification {
  index: number; // 1 to 6
  targetPpm: string | number; // e.g. "0.1-0.2 ppm", "0.2-0.5 ppm"
  isBlue: boolean;
  confidence: number; // 0.0 - 1.0
  hsv: {
    h: number; // 0 - 360
    s: number; // 0 - 100
    v: number; // 0 - 100
  };
  rgb: {
    r: number;
    g: number;
    b: number;
  };
}

export interface PadDetectionResult {
  bluePadCount: number; // 0 - 6
  pads: PadClassification[];
  referencePatchFound: boolean;
  normalizedConfidence: number;
  processedAt: string;
  algorithm: 'hsv_normalized_mvp' | 'tflite_mock';
}

export interface TestRecord {
  id: string;
  worker_id: string;
  worker_name?: string;
  village_id: string;
  village_name?: string;
  batch_id: string;
  batch_expiry?: string;
  blue_pad_count: number;
  frc_range: string; // '<0.1 ppm', '0.1-0.2 ppm', etc.
  frc_numeric: number;
  status: FrcStatus; // 'low' | 'safe' | 'high'
  lat: number;
  lng: number;
  location_accuracy?: number;
  photo_uri?: string;
  tested_at: string;
  synced_at: string | null;
  sync_status: 'pending' | 'synced';
  notes?: string;
  is_override?: boolean;
}

export type AlertStatus = 'open' | 'recheck_assigned' | 'rechlorinated';
export type SmsStatus = 'pending' | 'sent' | 'failed' | 'not_required' | 'fallback_sent';

export interface AlertRecord {
  id: string;
  test_id: string;
  village_id: string;
  village_name: string;
  frc_range: string;
  worker_name: string;
  status: AlertStatus;
  assigned_to: string | null;
  assigned_to_name?: string;
  sms_status: SmsStatus;
  sms_sent_via_fallback: boolean;
  sms_error?: string | null;
  notes?: string;
  created_at: string;
  updated_at?: string;
  resolved_at?: string | null;
  sync_status?: 'pending' | 'synced';
}
