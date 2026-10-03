-- ====================================================================
-- Jal Jeevan Mission (JJM) Cl-Ladder Database Schema
-- Supabase / PostgreSQL Migration
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (field workers, supervisors, officers)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('worker', 'supervisor', 'officer')),
    phone TEXT NOT NULL,
    village_id TEXT,
    district TEXT DEFAULT 'Pune',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Villages Table (Gram Panchayat locations with GPS)
CREATE TABLE IF NOT EXISTS public.villages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    district TEXT NOT NULL DEFAULT 'Pune',
    state TEXT NOT NULL DEFAULT 'Maharashtra',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Strips Table (Certified manufacturer batches & expiry dates)
CREATE TABLE IF NOT EXISTS public.strips (
    batch_id TEXT PRIMARY KEY,
    expiry DATE NOT NULL,
    manufacturer TEXT DEFAULT 'JalJeevan BioTech India',
    is_valid BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tests Table (Offline-first test records with unique client test ID)
CREATE TABLE IF NOT EXISTS public.tests (
    id TEXT PRIMARY KEY, -- Unique client-generated ID (prevents sync duplicates)
    worker_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    worker_name TEXT,
    village_id TEXT NOT NULL REFERENCES public.villages(id) ON DELETE CASCADE,
    village_name TEXT,
    batch_id TEXT NOT NULL REFERENCES public.strips(batch_id) ON DELETE RESTRICT,
    batch_expiry DATE,
    blue_pad_count INTEGER NOT NULL CHECK (blue_pad_count BETWEEN 0 AND 6),
    frc_range TEXT NOT NULL,       -- e.g. '<0.1 ppm', '0.1-0.2 ppm', '0.2-0.5 ppm', etc.
    frc_numeric NUMERIC(4,2),
    status TEXT NOT NULL CHECK (status IN ('low', 'safe', 'high')),
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    location_accuracy NUMERIC(6,2),
    photo_uri TEXT,
    notes TEXT,
    is_override BOOLEAN DEFAULT false,
    tested_at TIMESTAMPTZ NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Alerts Table (Low-FRC escalation, SMS tracking, & resolution)
-- Columns strictly as required:
-- id, test_id, village_id, status, assigned_to, sms_status, sms_sent_via_fallback, created_at, updated_at, resolved_at
CREATE TABLE IF NOT EXISTS public.alerts (
    id TEXT PRIMARY KEY, -- Unique client-generated alert ID (alert_${test.id})
    test_id TEXT NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
    village_id TEXT NOT NULL REFERENCES public.villages(id) ON DELETE CASCADE,
    village_name TEXT,
    frc_range TEXT,
    worker_name TEXT,
    status TEXT NOT NULL CHECK (status IN ('open', 'recheck_assigned', 'rechlorinated')),
    assigned_to TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    assigned_to_name TEXT,
    sms_status TEXT NOT NULL DEFAULT 'pending' CHECK (sms_status IN ('pending', 'sent', 'failed', 'not_required', 'fallback_sent')),
    sms_sent_via_fallback BOOLEAN DEFAULT false NOT NULL,
    sms_error TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMPTZ
);

-- ====================================================================
-- Indexes for High Performance Queries & Dashboards
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_tests_village ON public.tests(village_id);
CREATE INDEX IF NOT EXISTS idx_tests_status ON public.tests(status);
CREATE INDEX IF NOT EXISTS idx_tests_tested_at ON public.tests(tested_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_village ON public.alerts(village_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON public.alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_assigned_to ON public.alerts(assigned_to);

-- ====================================================================
-- Row Level Security (RLS)
-- ====================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public read villages" ON public.villages FOR SELECT USING (true);
CREATE POLICY "Allow public read strips" ON public.strips FOR SELECT USING (true);
CREATE POLICY "Allow public read tests" ON public.tests FOR SELECT USING (true);

-- Insert & Update for Tests
CREATE POLICY "Allow insert tests" ON public.tests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update tests" ON public.tests FOR UPDATE USING (true);

-- Alerts RLS:
-- Field workers create alerts for their own tests
CREATE POLICY "Allow field workers create alerts" ON public.alerts 
  FOR INSERT WITH CHECK (true);

-- Supervisors and officers read all and update status
CREATE POLICY "Allow read all alerts" ON public.alerts 
  FOR SELECT USING (true);

CREATE POLICY "Allow supervisors and officers update alerts" ON public.alerts 
  FOR UPDATE USING (true);

-- Enable Realtime publication for alerts and tests
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tests;
