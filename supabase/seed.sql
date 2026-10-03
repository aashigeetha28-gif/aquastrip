-- ====================================================================
-- Jal Jeevan Mission (JJM) Cl-Ladder Database Seed Data
-- ====================================================================

-- 1. Seed Users
INSERT INTO public.users (id, name, role, phone, village_id, district) VALUES
('usr_worker_01', 'Ramesh Kumar (Volunteer)', 'worker', '+91 98765 43210', 'vil_01', 'Pune'),
('usr_worker_02', 'Pooja Shinde (Volunteer)', 'worker', '+91 98765 43214', 'vil_02', 'Pune'),
('usr_sup_02', 'Sunita Patil (Supervisor)', 'supervisor', '+91 98765 43211', NULL, 'Pune'),
('usr_off_03', 'Vijay Deshmukh (JJM Officer)', 'officer', '+91 98765 43212', NULL, 'State HQ - Maharashtra')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, phone = EXCLUDED.phone;

-- 2. Seed Villages
INSERT INTO public.villages (id, name, lat, lng, district, state) VALUES
('vil_01', 'Khed (Gram Panchayat)', 18.8471, 73.9118, 'Pune', 'Maharashtra'),
('vil_02', 'Shirur (East Ward)', 18.8268, 74.3789, 'Pune', 'Maharashtra'),
('vil_03', 'Baramati (Rural Tap Stand #2)', 18.1517, 74.5771, 'Pune', 'Maharashtra'),
('vil_04', 'Junnar (Hill Valley)', 19.2064, 73.8764, 'Pune', 'Maharashtra')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, lat = EXCLUDED.lat, lng = EXCLUDED.lng;

-- 3. Seed Batches
INSERT INTO public.strips (batch_id, expiry, manufacturer, is_valid) VALUES
('JJM-2026-B4', '2026-12-31', 'JalJeevan BioTech India', true),
('JJM-2026-B8', '2027-04-30', 'JalJeevan BioTech India', true),
('JJM-2026-C1', '2026-11-15', 'National Water Diagnostics', true),
('JJM-2025-A1', '2025-06-30', 'JalJeevan BioTech India', false)
ON CONFLICT (batch_id) DO UPDATE SET expiry = EXCLUDED.expiry, is_valid = EXCLUDED.is_valid;

-- 4. Seed ~40 Sample Tests across 3 villages (Khed, Shirur, Baramati)
-- Range distribution: Safe (2-3 pads), Low (0-1 pads), High (4-6 pads)
INSERT INTO public.tests (
    id, worker_id, worker_name, village_id, village_name, batch_id, batch_expiry,
    blue_pad_count, frc_range, frc_numeric, status, lat, lng, location_accuracy,
    notes, tested_at, synced_at
) VALUES
-- Khed Tests (vil_01)
('seed_t_01', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_01', 'Khed (Gram Panchayat)', 'JJM-2026-B4', '2026-12-31', 2, '0.2-0.5 ppm', 0.35, 'safe', 18.8471, 73.9118, 12, 'Primary Health Centre tap', '2026-09-20 09:15:00+00', '2026-09-20 09:20:00+00'),
('seed_t_02', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_01', 'Khed (Gram Panchayat)', 'JJM-2026-B4', '2026-12-31', 3, '0.5-1.0 ppm', 0.75, 'safe', 18.8475, 73.9122, 10, 'Anganwadi water post', '2026-09-21 10:30:00+00', '2026-09-21 10:35:00+00'),
('seed_t_03', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_01', 'Khed (Gram Panchayat)', 'JJM-2026-B4', '2026-12-31', 1, '0.1-0.2 ppm', 0.15, 'low', 18.8465, 73.9105, 14, 'End of distribution pipe #4', '2026-09-22 11:00:00+00', '2026-09-22 11:05:00+00'),
('seed_t_04', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_01', 'Khed (Gram Panchayat)', 'JJM-2026-B4', '2026-12-31', 2, '0.2-0.5 ppm', 0.35, 'safe', 18.8468, 73.9110, 8, 'Gram Panchayat office standpost', '2026-09-23 09:00:00+00', '2026-09-23 09:05:00+00'),
('seed_t_05', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_01', 'Khed (Gram Panchayat)', 'JJM-2026-B4', '2026-12-31', 3, '0.5-1.0 ppm', 0.75, 'safe', 18.8480, 73.9130, 15, 'Market area community tap', '2026-09-24 14:15:00+00', '2026-09-24 14:20:00+00'),
('seed_t_06', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_01', 'Khed (Gram Panchayat)', 'JJM-2026-B4', '2026-12-31', 0, '<0.1 ppm', 0.05, 'low', 18.8460, 73.9095, 11, 'South colony tail end tap', '2026-09-25 08:45:00+00', '2026-09-25 08:50:00+00'),
('seed_t_07', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_01', 'Khed (Gram Panchayat)', 'JJM-2026-B4', '2026-12-31', 2, '0.2-0.5 ppm', 0.35, 'safe', 18.8461, 73.9096, 9, 'Recheck post booster dosing', '2026-09-25 15:30:00+00', '2026-09-25 15:35:00+00'),
('seed_t_08', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_01', 'Khed (Gram Panchayat)', 'JJM-2026-B4', '2026-12-31', 3, '0.5-1.0 ppm', 0.75, 'safe', 18.8473, 73.9120, 10, 'Zilla Parishad School tap', '2026-09-26 11:20:00+00', '2026-09-26 11:25:00+00'),
('seed_t_09', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_01', 'Khed (Gram Panchayat)', 'JJM-2026-B4', '2026-12-31', 4, '1.0-2.0 ppm', 1.50, 'high', 18.8470, 73.9115, 12, 'ESR overhead reservoir outlet', '2026-09-27 09:40:00+00', '2026-09-27 09:45:00+00'),
('seed_t_10', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_01', 'Khed (Gram Panchayat)', 'JJM-2026-B4', '2026-12-31', 2, '0.2-0.5 ppm', 0.35, 'safe', 18.8472, 73.9118, 10, 'Community handwash station', '2026-09-28 10:10:00+00', '2026-09-28 10:15:00+00'),
('seed_t_11', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_01', 'Khed (Gram Panchayat)', 'JJM-2026-B4', '2026-12-31', 3, '0.5-1.0 ppm', 0.75, 'safe', 18.8477, 73.9125, 12, 'North lane tap', '2026-09-29 12:00:00+00', '2026-09-29 12:05:00+00'),
('seed_t_12', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_01', 'Khed (Gram Panchayat)', 'JJM-2026-B4', '2026-12-31', 1, '0.1-0.2 ppm', 0.15, 'low', 18.8458, 73.9090, 13, 'Remote settlement standpost', '2026-09-30 08:30:00+00', '2026-09-30 08:35:00+00'),
('seed_t_13', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_01', 'Khed (Gram Panchayat)', 'JJM-2026-B4', '2026-12-31', 2, '0.2-0.5 ppm', 0.35, 'safe', 18.8471, 73.9118, 10, 'Morning routine sample', '2026-10-01 09:00:00+00', '2026-10-01 09:05:00+00'),
('seed_t_14', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_01', 'Khed (Gram Panchayat)', 'JJM-2026-B4', '2026-12-31', 3, '0.5-1.0 ppm', 0.75, 'safe', 18.8474, 73.9121, 9, 'Midday check', '2026-10-02 13:00:00+00', '2026-10-02 13:05:00+00'),
('seed_t_15', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_01', 'Khed (Gram Panchayat)', 'JJM-2026-B4', '2026-12-31', 2, '0.2-0.5 ppm', 0.35, 'safe', 18.8471, 73.9118, 11, 'Today morning sample', '2026-10-03 09:30:00+00', '2026-10-03 09:35:00+00'),

-- Shirur Tests (vil_02)
('seed_t_16', 'usr_worker_02', 'Pooja Shinde (Volunteer)', 'vil_02', 'Shirur (East Ward)', 'JJM-2026-B4', '2026-12-31', 1, '0.1-0.2 ppm', 0.15, 'low', 18.8268, 74.3789, 14, 'Bus depot community stand', '2026-09-20 10:00:00+00', '2026-09-20 10:05:00+00'),
('seed_t_17', 'usr_worker_02', 'Pooja Shinde (Volunteer)', 'vil_02', 'Shirur (East Ward)', 'JJM-2026-B4', '2026-12-31', 0, '<0.1 ppm', 0.05, 'low', 18.8275, 74.3795, 12, 'Primary School tap post', '2026-09-21 09:15:00+00', '2026-09-21 09:20:00+00'),
('seed_t_18', 'usr_worker_02', 'Pooja Shinde (Volunteer)', 'vil_02', 'Shirur (East Ward)', 'JJM-2026-B4', '2026-12-31', 2, '0.2-0.5 ppm', 0.35, 'safe', 18.8270, 74.3790, 10, 'Following reservoir chlorination', '2026-09-22 14:00:00+00', '2026-09-22 14:05:00+00'),
('seed_t_19', 'usr_worker_02', 'Pooja Shinde (Volunteer)', 'vil_02', 'Shirur (East Ward)', 'JJM-2026-B4', '2026-12-31', 2, '0.2-0.5 ppm', 0.35, 'safe', 18.8265, 74.3785, 11, 'East ward main road stand', '2026-09-23 11:30:00+00', '2026-09-23 11:35:00+00'),
('seed_t_20', 'usr_worker_02', 'Pooja Shinde (Volunteer)', 'vil_02', 'Shirur (East Ward)', 'JJM-2026-B4', '2026-12-31', 3, '0.5-1.0 ppm', 0.75, 'safe', 18.8262, 74.3780, 15, 'Hospital feeder pipe', '2026-09-24 10:20:00+00', '2026-09-24 10:25:00+00'),
('seed_t_21', 'usr_worker_02', 'Pooja Shinde (Volunteer)', 'vil_02', 'Shirur (East Ward)', 'JJM-2026-B4', '2026-12-31', 1, '0.1-0.2 ppm', 0.15, 'low', 18.8280, 74.3800, 12, 'Tail end household cluster', '2026-09-25 09:45:00+00', '2026-09-25 09:50:00+00'),
('seed_t_22', 'usr_worker_02', 'Pooja Shinde (Volunteer)', 'vil_02', 'Shirur (East Ward)', 'JJM-2026-B4', '2026-12-31', 2, '0.2-0.5 ppm', 0.35, 'safe', 18.8268, 74.3789, 10, 'Central chowk standpost', '2026-09-26 12:10:00+00', '2026-09-26 12:15:00+00'),
('seed_t_23', 'usr_worker_02', 'Pooja Shinde (Volunteer)', 'vil_02', 'Shirur (East Ward)', 'JJM-2026-B4', '2026-12-31', 0, '<0.1 ppm', 0.05, 'low', 18.8285, 74.3810, 14, 'Farmland border stand', '2026-09-27 08:30:00+00', '2026-09-27 08:35:00+00'),
('seed_t_24', 'usr_worker_02', 'Pooja Shinde (Volunteer)', 'vil_02', 'Shirur (East Ward)', 'JJM-2026-B4', '2026-12-31', 2, '0.2-0.5 ppm', 0.35, 'safe', 18.8268, 74.3789, 11, 'Weekly market tap', '2026-09-28 15:40:00+00', '2026-09-28 15:45:00+00'),
('seed_t_25', 'usr_worker_02', 'Pooja Shinde (Volunteer)', 'vil_02', 'Shirur (East Ward)', 'JJM-2026-B4', '2026-12-31', 3, '0.5-1.0 ppm', 0.75, 'safe', 18.8272, 74.3792, 10, 'Gram Panchayat tap', '2026-09-29 10:00:00+00', '2026-09-29 10:05:00+00'),
('seed_t_26', 'usr_worker_02', 'Pooja Shinde (Volunteer)', 'vil_02', 'Shirur (East Ward)', 'JJM-2026-B4', '2026-12-31', 1, '0.1-0.2 ppm', 0.15, 'low', 18.8268, 74.3789, 12, 'Yesterday test near canal line', '2026-10-02 11:15:00+00', '2026-10-02 11:20:00+00'),
('seed_t_27', 'usr_worker_02', 'Pooja Shinde (Volunteer)', 'vil_02', 'Shirur (East Ward)', 'JJM-2026-B4', '2026-12-31', 1, '0.1-0.2 ppm', 0.15, 'low', 18.8268, 74.3789, 10, 'Today test - persistent low', '2026-10-03 11:15:00+00', NULL),

-- Baramati Tests (vil_03)
('seed_t_28', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_03', 'Baramati (Rural Tap Stand #2)', 'JJM-2026-B4', '2026-12-31', 3, '0.5-1.0 ppm', 0.75, 'safe', 18.1517, 74.5771, 9, 'Rural Tap Stand #2', '2026-09-20 11:00:00+00', '2026-09-20 11:05:00+00'),
('seed_t_29', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_03', 'Baramati (Rural Tap Stand #2)', 'JJM-2026-B4', '2026-12-31', 2, '0.2-0.5 ppm', 0.35, 'safe', 18.1520, 74.5775, 10, 'Sub-centre water line', '2026-09-21 14:30:00+00', '2026-09-21 14:35:00+00'),
('seed_t_30', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_03', 'Baramati (Rural Tap Stand #2)', 'JJM-2026-B4', '2026-12-31', 4, '1.0-2.0 ppm', 1.50, 'high', 18.1510, 74.5765, 12, 'High dose at main water works', '2026-09-22 09:20:00+00', '2026-09-22 09:25:00+00'),
('seed_t_31', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_03', 'Baramati (Rural Tap Stand #2)', 'JJM-2026-B4', '2026-12-31', 3, '0.5-1.0 ppm', 0.75, 'safe', 18.1515, 74.5770, 8, 'Normal distribution tap', '2026-09-23 10:15:00+00', '2026-09-23 10:20:00+00'),
('seed_t_32', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_03', 'Baramati (Rural Tap Stand #2)', 'JJM-2026-B4', '2026-12-31', 2, '0.2-0.5 ppm', 0.35, 'safe', 18.1522, 74.5778, 11, 'School drinking post', '2026-09-24 11:45:00+00', '2026-09-24 11:50:00+00'),
('seed_t_33', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_03', 'Baramati (Rural Tap Stand #2)', 'JJM-2026-B4', '2026-12-31', 3, '0.5-1.0 ppm', 0.75, 'safe', 18.1517, 74.5771, 10, 'Midday sampling', '2026-09-25 13:00:00+00', '2026-09-25 13:05:00+00'),
('seed_t_34', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_03', 'Baramati (Rural Tap Stand #2)', 'JJM-2026-B4', '2026-12-31', 2, '0.2-0.5 ppm', 0.35, 'safe', 18.1519, 74.5773, 9, 'Dairy cooperative tap', '2026-09-26 09:30:00+00', '2026-09-26 09:35:00+00'),
('seed_t_35', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_03', 'Baramati (Rural Tap Stand #2)', 'JJM-2026-B4', '2026-12-31', 5, '2.0-5.0 ppm', 3.50, 'high', 18.1512, 74.5768, 13, 'Heavy chlorination post pipe repair', '2026-09-27 16:00:00+00', '2026-09-27 16:05:00+00'),
('seed_t_36', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_03', 'Baramati (Rural Tap Stand #2)', 'JJM-2026-B4', '2026-12-31', 3, '0.5-1.0 ppm', 0.75, 'safe', 18.1517, 74.5771, 10, 'Resumed normal chlorination', '2026-09-28 10:45:00+00', '2026-09-28 10:50:00+00'),
('seed_t_37', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_03', 'Baramati (Rural Tap Stand #2)', 'JJM-2026-B4', '2026-12-31', 2, '0.2-0.5 ppm', 0.35, 'safe', 18.1518, 74.5772, 8, 'Gram Panchayat courtyard', '2026-09-29 11:15:00+00', '2026-09-29 11:20:00+00'),
('seed_t_38', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_03', 'Baramati (Rural Tap Stand #2)', 'JJM-2026-B4', '2026-12-31', 3, '0.5-1.0 ppm', 0.75, 'safe', 18.1525, 74.5780, 11, 'East housing line', '2026-09-30 09:50:00+00', '2026-09-30 09:55:00+00'),
('seed_t_39', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_03', 'Baramati (Rural Tap Stand #2)', 'JJM-2026-B4', '2026-12-31', 3, '0.5-1.0 ppm', 0.75, 'safe', 18.1517, 74.5771, 10, 'Yesterday routine tap check', '2026-10-02 16:00:00+00', '2026-10-02 16:05:00+00'),
('seed_t_40', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'vil_03', 'Baramati (Rural Tap Stand #2)', 'JJM-2026-B4', '2026-12-31', 2, '0.2-0.5 ppm', 0.35, 'safe', 18.1517, 74.5771, 9, 'Today morning sample', '2026-10-03 08:30:00+00', '2026-10-03 08:35:00+00')
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Corresponding Alerts for the Low-FRC Tests
INSERT INTO public.alerts (
    id, test_id, village_id, village_name, frc_range, worker_name,
    status, assigned_to, assigned_to_name, sms_status, sms_sent_via_fallback,
    notes, created_at, updated_at, resolved_at
) VALUES
('alert_seed_t_03', 'seed_t_03', 'vil_01', 'Khed (Gram Panchayat)', '0.1-0.2 ppm (Low)', 'Ramesh Kumar (Volunteer)', 'rechlorinated', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'sent', false, 'Bleaching powder booster added. Recheck confirmed 0.35 ppm Safe.', '2026-09-22 11:00:00+00', '2026-09-22 15:30:00+00', '2026-09-22 15:30:00+00'),
('alert_seed_t_06', 'seed_t_06', 'vil_01', 'Khed (Gram Panchayat)', '<0.1 ppm (Critical Low)', 'Ramesh Kumar (Volunteer)', 'rechlorinated', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'sent', false, 'Chlorine dosing restarted at overhead tank. Recheck tested 0.35 ppm Safe.', '2026-09-25 08:45:00+00', '2026-09-25 15:30:00+00', '2026-09-25 15:30:00+00'),
('alert_seed_t_12', 'seed_t_12', 'vil_01', 'Khed (Gram Panchayat)', '0.1-0.2 ppm (Low)', 'Ramesh Kumar (Volunteer)', 'recheck_assigned', 'usr_worker_01', 'Ramesh Kumar (Volunteer)', 'sent', false, 'Recheck assigned to volunteer Ramesh Kumar.', '2026-09-30 08:30:00+00', '2026-09-30 10:00:00+00', NULL),
('alert_seed_t_16', 'seed_t_16', 'vil_02', 'Shirur (East Ward)', '0.1-0.2 ppm (Low)', 'Pooja Shinde (Volunteer)', 'rechlorinated', 'usr_worker_02', 'Pooja Shinde (Volunteer)', 'sent', false, 'Tank rechlorinated. Secondary tap sample safe.', '2026-09-20 10:00:00+00', '2026-09-20 16:00:00+00', '2026-09-20 16:00:00+00'),
('alert_seed_t_17', 'seed_t_17', 'vil_02', 'Shirur (East Ward)', '<0.1 ppm (Critical Low)', 'Pooja Shinde (Volunteer)', 'rechlorinated', 'usr_worker_02', 'Pooja Shinde (Volunteer)', 'sent', false, 'Emergency chlorination tablet added to storage sumps.', '2026-09-21 09:15:00+00', '2026-09-22 14:00:00+00', '2026-09-22 14:00:00+00'),
('alert_seed_t_21', 'seed_t_21', 'vil_02', 'Shirur (East Ward)', '0.1-0.2 ppm (Low)', 'Pooja Shinde (Volunteer)', 'recheck_assigned', 'usr_worker_02', 'Pooja Shinde (Volunteer)', 'sent', false, 'Assigned to volunteer Pooja Shinde for tail-end line flushing.', '2026-09-25 09:45:00+00', '2026-09-25 11:00:00+00', NULL),
('alert_seed_t_23', 'seed_t_23', 'vil_02', 'Shirur (East Ward)', '<0.1 ppm (Critical Low)', 'Pooja Shinde (Volunteer)', 'rechlorinated', 'usr_worker_02', 'Pooja Shinde (Volunteer)', 'sent', false, 'Rechlorinated and pipeline air-lock cleared.', '2026-09-27 08:30:00+00', '2026-09-27 14:00:00+00', '2026-09-27 14:00:00+00'),
('alert_seed_t_26', 'seed_t_26', 'vil_02', 'Shirur (East Ward)', '0.1-0.2 ppm (Low)', 'Pooja Shinde (Volunteer)', 'recheck_assigned', 'usr_worker_02', 'Pooja Shinde (Volunteer)', 'sent', false, 'Supervisor Sunita Patil assigned recheck to Pooja.', '2026-10-02 11:15:00+00', '2026-10-02 12:00:00+00', NULL),
('alert_seed_t_27', 'seed_t_27', 'vil_02', 'Shirur (East Ward)', '0.1-0.2 ppm (Low)', 'Pooja Shinde (Volunteer)', 'open', NULL, NULL, 'pending', false, 'New open alert: FRC 0.1-0.2 ppm. Immediate booster chlorination required.', '2026-10-03 11:15:00+00', '2026-10-03 11:15:00+00', NULL)
ON CONFLICT (id) DO NOTHING;
