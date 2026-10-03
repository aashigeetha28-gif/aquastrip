import type { TestRecord, AlertRecord, VillageStatus, User } from '../types';
import { supabase, isSupabaseLive } from './supabase';

export const DEMO_USERS: User[] = [
  { id: 'usr_off_03', name: 'Vijay Deshmukh', role: 'officer', phone: '+91 98765 43212', district: 'State HQ - Maharashtra' },
  { id: 'usr_sup_02', name: 'Sunita Patil', role: 'supervisor', phone: '+91 98765 43211', district: 'Pune' },
  { id: 'usr_worker_01', name: 'Ramesh Kumar', role: 'worker', phone: '+91 98765 43210', district: 'Pune' },
  { id: 'usr_worker_02', name: 'Pooja Shinde', role: 'worker', phone: '+91 98765 43214', district: 'Pune' },
];

export const DEMO_VILLAGES = [
  { id: 'vil_01', name: 'Khed (Gram Panchayat)', lat: 18.8471, lng: 73.9118 },
  { id: 'vil_02', name: 'Shirur (East Ward)', lat: 18.8268, lng: 74.3789 },
  { id: 'vil_03', name: 'Baramati (Rural Tap Stand #2)', lat: 18.1517, lng: 74.5771 },
];

// 40 Realistic Seed Tests matching seed.sql
export const SEED_TESTS: TestRecord[] = [
  // Khed (Latest: Safe)
  { id: 'seed_t_15', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_01', village_name: 'Khed (Gram Panchayat)', batch_id: 'JJM-2026-B4', blue_pad_count: 2, frc_range: '0.2-0.5 ppm', frc_numeric: 0.35, status: 'safe', lat: 18.8471, lng: 73.9118, tested_at: '2026-10-03T09:30:00Z', notes: 'Today morning sample' },
  { id: 'seed_t_14', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_01', village_name: 'Khed (Gram Panchayat)', batch_id: 'JJM-2026-B4', blue_pad_count: 3, frc_range: '0.5-1.0 ppm', frc_numeric: 0.75, status: 'safe', lat: 18.8474, lng: 73.9121, tested_at: '2026-10-02T13:00:00Z', notes: 'Midday check' },
  { id: 'seed_t_13', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_01', village_name: 'Khed (Gram Panchayat)', batch_id: 'JJM-2026-B4', blue_pad_count: 2, frc_range: '0.2-0.5 ppm', frc_numeric: 0.35, status: 'safe', lat: 18.8471, lng: 73.9118, tested_at: '2026-10-01T09:00:00Z', notes: 'Morning routine sample' },
  { id: 'seed_t_12', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_01', village_name: 'Khed (Gram Panchayat)', batch_id: 'JJM-2026-B4', blue_pad_count: 1, frc_range: '0.1-0.2 ppm', frc_numeric: 0.15, status: 'low', lat: 18.8458, lng: 73.9090, tested_at: '2026-09-30T08:30:00Z', notes: 'Remote settlement standpost' },
  { id: 'seed_t_11', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_01', village_name: 'Khed (Gram Panchayat)', batch_id: 'JJM-2026-B4', blue_pad_count: 3, frc_range: '0.5-1.0 ppm', frc_numeric: 0.75, status: 'safe', lat: 18.8477, lng: 73.9125, tested_at: '2026-09-29T12:00:00Z', notes: 'North lane tap' },
  { id: 'seed_t_10', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_01', village_name: 'Khed (Gram Panchayat)', batch_id: 'JJM-2026-B4', blue_pad_count: 2, frc_range: '0.2-0.5 ppm', frc_numeric: 0.35, status: 'safe', lat: 18.8472, lng: 73.9118, tested_at: '2026-09-28T10:10:00Z', notes: 'Community handwash station' },
  { id: 'seed_t_09', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_01', village_name: 'Khed (Gram Panchayat)', batch_id: 'JJM-2026-B4', blue_pad_count: 4, frc_range: '1.0-2.0 ppm', frc_numeric: 1.50, status: 'high', lat: 18.8470, lng: 73.9115, tested_at: '2026-09-27T09:40:00Z', notes: 'ESR overhead reservoir outlet' },
  { id: 'seed_t_08', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_01', village_name: 'Khed (Gram Panchayat)', batch_id: 'JJM-2026-B4', blue_pad_count: 3, frc_range: '0.5-1.0 ppm', frc_numeric: 0.75, status: 'safe', lat: 18.8473, lng: 73.9120, tested_at: '2026-09-26T11:20:00Z', notes: 'Zilla Parishad School tap' },
  { id: 'seed_t_07', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_01', village_name: 'Khed (Gram Panchayat)', batch_id: 'JJM-2026-B4', blue_pad_count: 2, frc_range: '0.2-0.5 ppm', frc_numeric: 0.35, status: 'safe', lat: 18.8461, lng: 73.9096, tested_at: '2026-09-25T15:30:00Z', notes: 'Recheck post booster dosing' },
  { id: 'seed_t_06', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_01', village_name: 'Khed (Gram Panchayat)', batch_id: 'JJM-2026-B4', blue_pad_count: 0, frc_range: '<0.1 ppm', frc_numeric: 0.05, status: 'low', lat: 18.8460, lng: 73.9095, tested_at: '2026-09-25T08:45:00Z', notes: 'South colony tail end tap' },
  { id: 'seed_t_05', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_01', village_name: 'Khed (Gram Panchayat)', batch_id: 'JJM-2026-B4', blue_pad_count: 3, frc_range: '0.5-1.0 ppm', frc_numeric: 0.75, status: 'safe', lat: 18.8480, lng: 73.9130, tested_at: '2026-09-24T14:15:00Z', notes: 'Market area community tap' },
  { id: 'seed_t_04', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_01', village_name: 'Khed (Gram Panchayat)', batch_id: 'JJM-2026-B4', blue_pad_count: 2, frc_range: '0.2-0.5 ppm', frc_numeric: 0.35, status: 'safe', lat: 18.8468, lng: 73.9110, tested_at: '2026-09-23T09:00:00Z', notes: 'Gram Panchayat office standpost' },
  { id: 'seed_t_03', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_01', village_name: 'Khed (Gram Panchayat)', batch_id: 'JJM-2026-B4', blue_pad_count: 1, frc_range: '0.1-0.2 ppm', frc_numeric: 0.15, status: 'low', lat: 18.8465, lng: 73.9105, tested_at: '2026-09-22T11:00:00Z', notes: 'End of distribution pipe #4' },
  { id: 'seed_t_02', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_01', village_name: 'Khed (Gram Panchayat)', batch_id: 'JJM-2026-B4', blue_pad_count: 3, frc_range: '0.5-1.0 ppm', frc_numeric: 0.75, status: 'safe', lat: 18.8475, lng: 73.9122, tested_at: '2026-09-21T10:30:00Z', notes: 'Anganwadi water post' },
  { id: 'seed_t_01', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_01', village_name: 'Khed (Gram Panchayat)', batch_id: 'JJM-2026-B4', blue_pad_count: 2, frc_range: '0.2-0.5 ppm', frc_numeric: 0.35, status: 'safe', lat: 18.8471, lng: 73.9118, tested_at: '2026-09-20T09:15:00Z', notes: 'Primary Health Centre tap' },

  // Shirur (Latest: Low - Red Alert)
  { id: 'seed_t_27', worker_id: 'usr_worker_02', worker_name: 'Pooja Shinde', village_id: 'vil_02', village_name: 'Shirur (East Ward)', batch_id: 'JJM-2026-B4', blue_pad_count: 1, frc_range: '0.1-0.2 ppm', frc_numeric: 0.15, status: 'low', lat: 18.8268, lng: 74.3789, tested_at: '2026-10-03T11:15:00Z', notes: 'Today test - persistent low' },
  { id: 'seed_t_26', worker_id: 'usr_worker_02', worker_name: 'Pooja Shinde', village_id: 'vil_02', village_name: 'Shirur (East Ward)', batch_id: 'JJM-2026-B4', blue_pad_count: 1, frc_range: '0.1-0.2 ppm', frc_numeric: 0.15, status: 'low', lat: 18.8268, lng: 74.3789, tested_at: '2026-10-02T11:15:00Z', notes: 'Near canal line' },
  { id: 'seed_t_25', worker_id: 'usr_worker_02', worker_name: 'Pooja Shinde', village_id: 'vil_02', village_name: 'Shirur (East Ward)', batch_id: 'JJM-2026-B4', blue_pad_count: 3, frc_range: '0.5-1.0 ppm', frc_numeric: 0.75, status: 'safe', lat: 18.8272, lng: 74.3792, tested_at: '2026-09-29T10:00:00Z', notes: 'Gram Panchayat tap' },
  { id: 'seed_t_24', worker_id: 'usr_worker_02', worker_name: 'Pooja Shinde', village_id: 'vil_02', village_name: 'Shirur (East Ward)', batch_id: 'JJM-2026-B4', blue_pad_count: 2, frc_range: '0.2-0.5 ppm', frc_numeric: 0.35, status: 'safe', lat: 18.8268, lng: 74.3789, tested_at: '2026-09-28T15:40:00Z', notes: 'Weekly market tap' },
  { id: 'seed_t_23', worker_id: 'usr_worker_02', worker_name: 'Pooja Shinde', village_id: 'vil_02', village_name: 'Shirur (East Ward)', batch_id: 'JJM-2026-B4', blue_pad_count: 0, frc_range: '<0.1 ppm', frc_numeric: 0.05, status: 'low', lat: 18.8285, lng: 74.3810, tested_at: '2026-09-27T08:30:00Z', notes: 'Farmland border stand' },
  { id: 'seed_t_22', worker_id: 'usr_worker_02', worker_name: 'Pooja Shinde', village_id: 'vil_02', village_name: 'Shirur (East Ward)', batch_id: 'JJM-2026-B4', blue_pad_count: 2, frc_range: '0.2-0.5 ppm', frc_numeric: 0.35, status: 'safe', lat: 18.8268, lng: 74.3789, tested_at: '2026-09-26T12:10:00Z', notes: 'Central chowk standpost' },
  { id: 'seed_t_21', worker_id: 'usr_worker_02', worker_name: 'Pooja Shinde', village_id: 'vil_02', village_name: 'Shirur (East Ward)', batch_id: 'JJM-2026-B4', blue_pad_count: 1, frc_range: '0.1-0.2 ppm', frc_numeric: 0.15, status: 'low', lat: 18.8280, lng: 74.3800, tested_at: '2026-09-25T09:45:00Z', notes: 'Tail end household cluster' },
  { id: 'seed_t_20', worker_id: 'usr_worker_02', worker_name: 'Pooja Shinde', village_id: 'vil_02', village_name: 'Shirur (East Ward)', batch_id: 'JJM-2026-B4', blue_pad_count: 3, frc_range: '0.5-1.0 ppm', frc_numeric: 0.75, status: 'safe', lat: 18.8262, lng: 74.3780, tested_at: '2026-09-24T10:20:00Z', notes: 'Hospital feeder pipe' },
  { id: 'seed_t_19', worker_id: 'usr_worker_02', worker_name: 'Pooja Shinde', village_id: 'vil_02', village_name: 'Shirur (East Ward)', batch_id: 'JJM-2026-B4', blue_pad_count: 2, frc_range: '0.2-0.5 ppm', frc_numeric: 0.35, status: 'safe', lat: 18.8265, lng: 74.3785, tested_at: '2026-09-23T11:30:00Z', notes: 'East ward main road stand' },
  { id: 'seed_t_18', worker_id: 'usr_worker_02', worker_name: 'Pooja Shinde', village_id: 'vil_02', village_name: 'Shirur (East Ward)', batch_id: 'JJM-2026-B4', blue_pad_count: 2, frc_range: '0.2-0.5 ppm', frc_numeric: 0.35, status: 'safe', lat: 18.8270, lng: 74.3790, tested_at: '2026-09-22T14:00:00Z', notes: 'Following reservoir chlorination' },
  { id: 'seed_t_17', worker_id: 'usr_worker_02', worker_name: 'Pooja Shinde', village_id: 'vil_02', village_name: 'Shirur (East Ward)', batch_id: 'JJM-2026-B4', blue_pad_count: 0, frc_range: '<0.1 ppm', frc_numeric: 0.05, status: 'low', lat: 18.8275, lng: 74.3795, tested_at: '2026-09-21T09:15:00Z', notes: 'Primary School tap post' },
  { id: 'seed_t_16', worker_id: 'usr_worker_02', worker_name: 'Pooja Shinde', village_id: 'vil_02', village_name: 'Shirur (East Ward)', batch_id: 'JJM-2026-B4', blue_pad_count: 1, frc_range: '0.1-0.2 ppm', frc_numeric: 0.15, status: 'low', lat: 18.8268, lng: 74.3789, tested_at: '2026-09-20T10:00:00Z', notes: 'Bus depot community stand' },

  // Baramati (Latest: Safe)
  { id: 'seed_t_40', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_03', village_name: 'Baramati (Rural Tap Stand #2)', batch_id: 'JJM-2026-B4', blue_pad_count: 2, frc_range: '0.2-0.5 ppm', frc_numeric: 0.35, status: 'safe', lat: 18.1517, lng: 74.5771, tested_at: '2026-10-03T08:30:00Z', notes: 'Today morning sample' },
  { id: 'seed_t_39', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_03', village_name: 'Baramati (Rural Tap Stand #2)', batch_id: 'JJM-2026-B4', blue_pad_count: 3, frc_range: '0.5-1.0 ppm', frc_numeric: 0.75, status: 'safe', lat: 18.1517, lng: 74.5771, tested_at: '2026-10-02T16:00:00Z', notes: 'Routine check' },
  { id: 'seed_t_38', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_03', village_name: 'Baramati (Rural Tap Stand #2)', batch_id: 'JJM-2026-B4', blue_pad_count: 3, frc_range: '0.5-1.0 ppm', frc_numeric: 0.75, status: 'safe', lat: 18.1525, lng: 74.5780, tested_at: '2026-09-30T09:50:00Z', notes: 'East housing line' },
  { id: 'seed_t_37', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_03', village_name: 'Baramati (Rural Tap Stand #2)', batch_id: 'JJM-2026-B4', blue_pad_count: 2, frc_range: '0.2-0.5 ppm', frc_numeric: 0.35, status: 'safe', lat: 18.1518, lng: 74.5772, tested_at: '2026-09-29T11:15:00Z', notes: 'Gram Panchayat courtyard' },
  { id: 'seed_t_36', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_03', village_name: 'Baramati (Rural Tap Stand #2)', batch_id: 'JJM-2026-B4', blue_pad_count: 3, frc_range: '0.5-1.0 ppm', frc_numeric: 0.75, status: 'safe', lat: 18.1517, lng: 74.5771, tested_at: '2026-09-28T10:45:00Z', notes: 'Normal chlorination' },
  { id: 'seed_t_35', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_03', village_name: 'Baramati (Rural Tap Stand #2)', batch_id: 'JJM-2026-B4', blue_pad_count: 5, frc_range: '2.0-5.0 ppm', frc_numeric: 3.50, status: 'high', lat: 18.1512, lng: 74.5768, tested_at: '2026-09-27T16:00:00Z', notes: 'Post pipe repair' },
  { id: 'seed_t_34', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_03', village_name: 'Baramati (Rural Tap Stand #2)', batch_id: 'JJM-2026-B4', blue_pad_count: 2, frc_range: '0.2-0.5 ppm', frc_numeric: 0.35, status: 'safe', lat: 18.1519, lng: 74.5773, tested_at: '2026-09-26T09:30:00Z', notes: 'Dairy cooperative tap' },
  { id: 'seed_t_33', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_03', village_name: 'Baramati (Rural Tap Stand #2)', batch_id: 'JJM-2026-B4', blue_pad_count: 3, frc_range: '0.5-1.0 ppm', frc_numeric: 0.75, status: 'safe', lat: 18.1517, lng: 74.5771, tested_at: '2026-09-25T13:00:00Z', notes: 'Midday sampling' },
  { id: 'seed_t_32', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_03', village_name: 'Baramati (Rural Tap Stand #2)', batch_id: 'JJM-2026-B4', blue_pad_count: 2, frc_range: '0.2-0.5 ppm', frc_numeric: 0.35, status: 'safe', lat: 18.1522, lng: 74.5778, tested_at: '2026-09-24T11:45:00Z', notes: 'School drinking post' },
  { id: 'seed_t_31', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_03', village_name: 'Baramati (Rural Tap Stand #2)', batch_id: 'JJM-2026-B4', blue_pad_count: 3, frc_range: '0.5-1.0 ppm', frc_numeric: 0.75, status: 'safe', lat: 18.1515, lng: 74.5770, tested_at: '2026-09-23T10:15:00Z', notes: 'Normal distribution tap' },
  { id: 'seed_t_30', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_03', village_name: 'Baramati (Rural Tap Stand #2)', batch_id: 'JJM-2026-B4', blue_pad_count: 4, frc_range: '1.0-2.0 ppm', frc_numeric: 1.50, status: 'high', lat: 18.1510, lng: 74.5765, tested_at: '2026-09-22T09:20:00Z', notes: 'Main water works' },
  { id: 'seed_t_29', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_03', village_name: 'Baramati (Rural Tap Stand #2)', batch_id: 'JJM-2026-B4', blue_pad_count: 2, frc_range: '0.2-0.5 ppm', frc_numeric: 0.35, status: 'safe', lat: 18.1520, lng: 74.5775, tested_at: '2026-09-21T14:30:00Z', notes: 'Sub-centre water line' },
  { id: 'seed_t_28', worker_id: 'usr_worker_01', worker_name: 'Ramesh Kumar', village_id: 'vil_03', village_name: 'Baramati (Rural Tap Stand #2)', batch_id: 'JJM-2026-B4', blue_pad_count: 3, frc_range: '0.5-1.0 ppm', frc_numeric: 0.75, status: 'safe', lat: 18.1517, lng: 74.5771, tested_at: '2026-09-20T11:00:00Z', notes: 'Standpost #2' },
];

export const SEED_ALERTS: AlertRecord[] = [
  {
    id: 'alert_seed_t_27',
    test_id: 'seed_t_27',
    village_id: 'vil_02',
    village_name: 'Shirur (East Ward)',
    frc_range: '0.1-0.2 ppm (Low)',
    worker_name: 'Pooja Shinde',
    status: 'open',
    assigned_to: null,
    notes: 'New open alert: FRC 0.1-0.2 ppm. Immediate booster chlorination required.',
    created_at: '2026-10-03T11:15:00Z',
  },
  {
    id: 'alert_seed_t_26',
    test_id: 'seed_t_26',
    village_id: 'vil_02',
    village_name: 'Shirur (East Ward)',
    frc_range: '0.1-0.2 ppm (Low)',
    worker_name: 'Pooja Shinde',
    status: 'recheck_assigned',
    assigned_to: 'usr_worker_02',
    assigned_to_name: 'Pooja Shinde',
    notes: 'Supervisor Sunita Patil assigned recheck to Pooja.',
    created_at: '2026-10-02T11:15:00Z',
    updated_at: '2026-10-02T12:00:00Z',
  },
  {
    id: 'alert_seed_t_12',
    test_id: 'seed_t_12',
    village_id: 'vil_01',
    village_name: 'Khed (Gram Panchayat)',
    frc_range: '0.1-0.2 ppm (Low)',
    worker_name: 'Ramesh Kumar',
    status: 'recheck_assigned',
    assigned_to: 'usr_worker_01',
    assigned_to_name: 'Ramesh Kumar',
    notes: 'Recheck assigned to volunteer Ramesh Kumar.',
    created_at: '2026-09-30T08:30:00Z',
    updated_at: '2026-09-30T10:00:00Z',
  },
  {
    id: 'alert_seed_t_03',
    test_id: 'seed_t_03',
    village_id: 'vil_01',
    village_name: 'Khed (Gram Panchayat)',
    frc_range: '0.1-0.2 ppm (Low)',
    worker_name: 'Ramesh Kumar',
    status: 'rechlorinated',
    assigned_to: 'usr_worker_01',
    assigned_to_name: 'Ramesh Kumar',
    notes: 'Bleaching powder booster added. Recheck confirmed 0.35 ppm Safe.',
    created_at: '2026-09-22T11:00:00Z',
    resolved_at: '2026-09-22T15:30:00Z',
  },
];

class DashboardDataService {
  private tests: TestRecord[] = [...SEED_TESTS];
  private alerts: AlertRecord[] = [...SEED_ALERTS];

  async getTests(): Promise<TestRecord[]> {
    if (isSupabaseLive) {
      try {
        const { data, error } = await supabase
          .from('tests')
          .select('*')
          .order('tested_at', { ascending: false });
        if (!error && data && data.length > 0) {
          this.tests = data;
        }
      } catch (err) {
        console.warn('Supabase fetch tests fallback to cache:', err);
      }
    }
    return [...this.tests];
  }

  async getAlerts(): Promise<AlertRecord[]> {
    if (isSupabaseLive) {
      try {
        const { data, error } = await supabase
          .from('alerts')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          this.alerts = data;
        }
      } catch (err) {
        console.warn('Supabase fetch alerts fallback to cache:', err);
      }
    }
    return [...this.alerts];
  }

  getVillageStatuses(tests: TestRecord[], alerts: AlertRecord[]): VillageStatus[] {
    return DEMO_VILLAGES.map((v) => {
      const villageTests = tests.filter((t) => t.village_id === v.id);
      const latestTest = villageTests[0] || null;
      const safeTests = villageTests.filter((t) => t.status === 'safe').length;
      const safePercentage = villageTests.length > 0
        ? Math.round((safeTests / villageTests.length) * 100)
        : 100;
      const openAlertsCount = alerts.filter(
        (a) => a.village_id === v.id && (a.status === 'open' || a.status === 'recheck_assigned')
      ).length;

      return {
        id: v.id,
        name: v.name,
        lat: v.lat,
        lng: v.lng,
        latestStatus: latestTest ? latestTest.status : 'safe',
        latestFrcRange: latestTest ? latestTest.frc_range : 'No tests',
        latestTestedAt: latestTest ? latestTest.tested_at : '',
        totalTests: villageTests.length,
        safePercentage,
        openAlertsCount,
      };
    });
  }

  async assignRecheck(alertId: string, workerId: string, workerName: string): Promise<void> {
    const updatedAt = new Date().toISOString();
    if (isSupabaseLive) {
      try {
        await supabase
          .from('alerts')
          .update({
            status: 'recheck_assigned',
            assigned_to: workerId,
            assigned_to_name: workerName,
            updated_at: updatedAt,
          })
          .eq('id', alertId);
      } catch (err) {
        console.warn('Supabase update alert failed:', err);
      }
    }

    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = 'recheck_assigned';
      alert.assigned_to = workerId;
      alert.assigned_to_name = workerName;
      alert.updated_at = updatedAt;
    }
  }

  async markRechlorinated(alertId: string): Promise<void> {
    const resolvedAt = new Date().toISOString();
    if (isSupabaseLive) {
      try {
        await supabase
          .from('alerts')
          .update({
            status: 'rechlorinated',
            resolved_at: resolvedAt,
            updated_at: resolvedAt,
          })
          .eq('id', alertId);
      } catch (err) {
        console.warn('Supabase mark rechlorinated failed:', err);
      }
    }

    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = 'rechlorinated';
      alert.resolved_at = resolvedAt;
      alert.updated_at = resolvedAt;
    }
  }
}

export const dashboardDataService = new DashboardDataService();
