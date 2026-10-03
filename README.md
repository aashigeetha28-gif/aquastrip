# Cl-Ladder 💧🧪
### Smartphone-Based Paper-Strip Free Residual Chlorine (FRC) Water Test Kit & Escalation System
**Jal Jeevan Mission (JJM) • Har Ghar Jal Quality Surveillance Initiative**

---

## 📌 Executive Summary

**Cl-Ladder** is an end-to-end, offline-first digital water quality monitoring and escalation system built for the Jal Jeevan Mission (JJM). It pairs with paper strip test kits using Tetramethylbenzidine (TMB) reagent to accurately quantify Free Residual Chlorine (FRC) levels at rural tap posts, standposts, and storage reservoirs across India.

### Core Architecture
- **Mobile Field App (`/mobile`)**: React Native with Expo (TypeScript), Expo Router, offline SQLite storage (`expo-sqlite` in WAL mode), barcode/QR validation (`expo-camera`), HSV-normalized pad detection, GPS tagging (`expo-location`), Supabase sync with deduplication, offline SMS fallback (`expo-sms`), and local supervisor notifications (`expo-notifications`).
- **Officer & Supervisor Web Dashboard (`/dashboard`)**: React + Vite + TypeScript, responsive light theme, Leaflet geographic GIS map with red/green/amber village status markers, Recharts residual chlorine timeline trends, low-FRC escalation table with role-gated supervisor actions, CSV export, and PDF audit reporting.
- **Cloud Backend & Edge Functions (`/supabase`)**: PostgreSQL relational schema with Row Level Security (RLS), Realtime replication, idempotent client ID deduplication, and a Supabase Edge Function (`send-low-frc-sms`) supporting MSG91, Fast2SMS, and a simulated `DRY_RUN` mode.

---

## 📏 Fixed Rules & Scientific Mapping

### Pad Ladder to FRC Range Mapping
The test strip features 6 discrete pads that turn blue upon oxidation by free chlorine. Field volunteers count reactive blue pads (0 to 6) without needing subjective color chart matching:

| Blue Pads | FRC Concentration Range | Status | Safety Assessment | Action Protocol |
|:---:|:---:|:---:|:---:|:---|
| **0** | `< 0.1 ppm` | **LOW** 🔴 | Severe Contamination Risk | Auto-escalates alert & dispatches SMS |
| **1** | `0.1 - 0.2 ppm` | **LOW** 🔴 | Below JJM Bacteriological Limit | Auto-escalates alert & dispatches SMS |
| **2** | `0.2 - 0.5 ppm` | **SAFE** 🟢 | JJM Safe Minimum Compliance | Safe for immediate human consumption |
| **3** | `0.5 - 1.0 ppm` | **SAFE** 🟢 | JJM Optimal Residual | Safe for immediate human consumption |
| **4** | `1.0 - 2.0 ppm` | **HIGH** 🟡 | Elevated (Post-Dosing / Monsoon) | Monitor distribution decay |
| **5** | `2.0 - 5.0 ppm` | **HIGH** 🟡 | High Bleach Odour/Taste Risk | Check feeder dosing pump |
| **6** | `≥ 5.0 ppm` | **HIGH** 🟡 | Severe Overdose Hazard | Immediate line flush required |

- **Safe Compliance**: 0.2 – 1.0 ppm (2 to 3 blue pads)
- **Low-FRC Risk**: < 0.2 ppm (0 to 1 blue pads)
- **High Chlorine**: > 1.0 ppm (4 to 6 blue pads)
- **Theme Palette**: Teal/Blue primary (`#0D9488`), Green safe (`#16A34A`), Red low (`#DC2626`), Amber high (`#D97706`).

---

## 📁 Repository Structure

```
CL/
├── package.json                         # Monorepo task runner (start, mobile, dashboard, test)
├── README.md                            # Complete setup, architecture & test documentation
│
├── mobile/                              # React Native Expo Mobile App
│   ├── app/                             # Expo Router file-based pages
│   │   ├── _layout.tsx                  # Root providers (AuthProvider, TestProvider)
│   │   ├── override.tsx                 # Interactive 6-pad tap-to-toggle override
│   │   ├── result.tsx                   # Result screen: FRC reading, Low-FRC banner, SMS fallback
│   │   ├── (auth)/
│   │   │   └── login.tsx                # Role selector: Field Worker, Supervisor, Officer
│   │   └── (tabs)/
│   │       ├── index.tsx                # Home: village stats, sync status, offline toggle
│   │       ├── scan.tsx                 # 3-Step strip scanner: QR verify, photo, pad detection
│   │       ├── alerts.tsx               # Low-FRC escalation tracker & supervisor recheck modal
│   │       ├── history.tsx              # Local & cloud test history with audit details
│   │       └── profile.tsx              # SQLite store diagnostics & JJM standards
│   ├── src/
│   │   ├── __tests__/                   # Automated test suites (FRC mapping, deduplication)
│   │   │   └── runTests.mjs             # Standalone test runner (3 suites, 10 assertions)
│   │   ├── constants/theme.ts           # JJM color tokens & PAD_LADDER_CONFIG
│   │   ├── context/                     # AuthContext & TestContext (SQLite & Sync orchestration)
│   │   ├── services/
│   │   │   ├── frcCalculator.ts         # Pure FRC calculation algorithm
│   │   │   ├── padDetector.ts           # HSV pad color segmentation (modular for TFLite)
│   │   │   ├── qrValidator.ts           # Batch validation & expiry date blocker
│   │   │   ├── sqliteService.ts         # Local SQLite database (tests & alerts tables)
│   │   │   ├── syncService.ts           # Idempotent cloud sync & edge trigger
│   │   │   ├── smsFallbackService.ts    # Pre-filled expo-sms composer
│   │   │   ├── notificationService.ts   # Local expo-notifications for assigned tasks
│   │   │   └── supabaseClient.ts        # Supabase client singleton
│   │   └── types/index.ts               # Shared database & domain interfaces
│   ├── .env.example                     # Mobile environment template
│   └── package.json
│
├── dashboard/                           # Officer & Supervisor Web Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx               # Top bar with realtime connection badge & PDF export
│   │   │   ├── MetricCards.tsx          # 4 Overview KPI cards (% Safe, Low-FRC count, Alerts)
│   │   │   ├── VillageMap.tsx           # Leaflet GIS map with colored status markers
│   │   │   ├── TrendsChart.tsx          # Recharts FRC timeline with filters (village, date, worker)
│   │   │   ├── AlertsTable.tsx          # Low-FRC table with Assign Recheck & Rechlorinated actions
│   │   │   └── LoginModal.tsx           # Role-restricted portal login (Supervisor / Officer)
│   │   ├── services/
│   │   │   ├── dashboardData.ts         # Data layer with 40-test seed & Supabase live query
│   │   │   ├── exportReport.ts          # CSV and jsPDF audit report generator
│   │   │   └── supabase.ts              # Supabase browser client
│   │   ├── types.ts                     # TypeScript schemas for web
│   │   ├── App.tsx                      # Main dashboard application
│   │   └── index.css                    # Clean responsive styling & Leaflet map overrides
│   ├── .env.example                     # Dashboard environment template
│   └── package.json
│
└── supabase/                            # Database & Serverless Functions
    ├── schema.sql                       # PostgreSQL DDL: users, villages, strips, tests, alerts + RLS
    ├── seed.sql                         # 40 sample tests across 3 villages, matching alerts & users
    └── functions/
        └── send-low-frc-sms/
            ├── index.ts                 # Deno edge function checking fallback flag & logging SMS
            └── smsProvider.ts           # Isolated MSG91 / Fast2SMS gateway with DRY_RUN mode
```

---

## ⚡ Quick Start & Run Commands

From the project root directory (`CL/`):

| Purpose | Exact Command |
|---|---|
| **Run Unit Tests** | `npm test` |
| **Run Mobile App (Metro)** | `npm run mobile` |
| **Run Mobile App (Web View)** | `npm run mobile:web` |
| **Run Officer Web Dashboard** | `npm run dashboard` |
| **Build Web Dashboard** | `npm --prefix dashboard run build` |
| **Typecheck Mobile App** | `npm --prefix mobile run typecheck` |

---

## 🔑 Demo Login Accounts

Both the mobile application and the web dashboard support instant switching between predefined demo profiles:

| Role | Name | Phone / ID | Portal Access | Permissions |
|---|---|---|---|---|
| **Field Worker** | Ramesh Kumar | `usr_worker_01`<br>`+91 98765 43210` | **Mobile Only** | Strip scan, photo capture, offline SQLite save, fallback SMS |
| **Field Worker** | Pooja Shinde | `usr_worker_02`<br>`+91 98765 43214` | **Mobile Only** | Strip scan, photo capture, offline SQLite save, fallback SMS |
| **Cluster Supervisor** | Sunita Patil | `usr_sup_02`<br>`+91 98765 43211` | **Mobile & Web** | Assign recheck to workers, mark alerts rechlorinated, trigger tests |
| **JJM Officer** | Vijay Deshmukh | `usr_off_03`<br>`+91 98765 43212` | **Mobile & Web** | District surveillance, map telemetry, trends analysis, CSV/PDF audit export |

---

## ☁️ Supabase Setup & Deployment

### 1. Database Schema & Seed
1. Create a project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Paste and run [`supabase/schema.sql`](file:///c:/Users/aashi/Desktop/CL/supabase/schema.sql) to create the schema, tables, foreign keys, and Row Level Security (RLS) policies.
4. Paste and run [`supabase/seed.sql`](file:///c:/Users/aashi/Desktop/CL/supabase/seed.sql) to populate 40 realistic tests and corresponding alerts across Khed, Shirur, and Baramati villages.

### 2. Deploy Edge Function (`send-low-frc-sms`)
Deploy the serverless Edge Function using the Supabase CLI:

```bash
# Login to Supabase
npx supabase login

# Link your remote project
npx supabase link --project-ref your-project-ref

# Deploy the function
npx supabase functions deploy send-low-frc-sms --no-verify-jwt
```

### 3. Configure Supabase Secrets
Set the SMS gateway credentials in Supabase:

```bash
# For live MSG91 sending:
npx supabase secrets set SMS_GATEWAY_PROVIDER=MSG91
npx supabase secrets set SMS_API_KEY=your_msg91_auth_key
npx supabase secrets set MSG91_SENDER_ID=JJMWTR
npx supabase secrets set MSG91_TEMPLATE_ID=your_template_id

# Or enable DRY_RUN mode for development/testing (logs without charging credits):
npx supabase secrets set DRY_RUN=true
```

---

## 🧪 Comprehensive Verification Checklist

### 1. Online Low-FRC Test (Edge Function SMS & Alert Creation)
1. In the mobile app, log in as **Ramesh Kumar (Field Worker)**.
2. Tap **START NEW STRIP TEST** -> Select batch `JJM-2026-B4`.
3. Choose the **0 Pads Blue (<0.1 ppm Low)** preset.
4. On the Result screen, observe the **Red Low-FRC Alert Banner**:
   - `LOW CHLORINE ALERT: Residual chlorine is below 0.2 ppm (<0.1 ppm). Water is unsafe for drinking.`
5. Tap **Save and Report Test**.
6. The test auto-creates an alert tied to the test ID (`alert_{test_id}`).
7. In the cloud, the Supabase Edge Function `send-low-frc-sms` triggers:
   - SMS is dispatched to supervisor Sunita Patil (`+91 98765 43211`).
   - Format: `"LOW CHLORINE ALERT: {village}, FRC below 0.2 ppm, tested {time}. Please recheck and rechlorinate."`
   - Row updates to `sms_status = 'sent'`.

### 2. Offline Low-FRC Test (Fallback SMS & Deduplication)
1. Tap **Go Offline** in the Home screen header banner (or enable Airplane Mode).
2. Start a test and select **1 Pad Blue (0.1-0.2 ppm Low)**.
3. On the Result screen, an offline button appears: **"SEND OFFLINE SMS ALERT"**.
4. Tap the button:
   - Opens `expo-sms` with a pre-filled composer containing village, FRC range, timestamp, and worker ID.
   - Sets `sms_sent_via_fallback = true` on the local SQLite alert row.
5. Save the test. The test and alert are saved in local SQLite with `sync_status = 'pending'`.
6. Tap **Go Online** (or disable Airplane Mode).
7. Sync automatically runs:
   - Data is upserted to Supabase with the client-generated ID.
   - The Edge Function sees `sms_sent_via_fallback = true` and skips sending, setting `sms_status = 'fallback_sent'` to prevent duplicate SMS alerts.

### 3. Supervisor Workflow (Assign Recheck & Mark Rechlorinated)
1. In the mobile app or dashboard, switch role to **Sunita Patil (Supervisor)**.
2. Open the **Alerts** tab:
   - Active low-FRC alerts are displayed with red/amber badges.
3. Tap **Assign Recheck** on an open alert -> Select volunteer **Ramesh Kumar**.
   - Alert status updates to `recheck_assigned`.
   - `expo-notifications` triggers a local notification for the assigned worker.
4. When Ramesh conducts a recheck test at the same village that yields a **Safe result (2-3 pads)**:
   - Result screen prompts: *"Recheck confirms safe water. Mark previous low-FRC alert as rechlorinated?"*
   - Tap **Mark Rechlorinated** -> Alert status changes to `rechlorinated` with `resolved_at` timestamp.

### 4. Officer Web Dashboard Telemetry & Exports
1. Open the dashboard in browser (`http://localhost:5173`).
2. Log in as **Vijay Deshmukh (JJM Officer)**:
   - **KPI Cards**: Review Total Tests (40), Safe Compliance %, Low-FRC Breaches, and Active Action Alerts.
   - **Leaflet Map**: View Khed (Green pin), Shirur (Red pin), and Baramati (Green pin). Click any pin to open recent test history.
   - **Trends Chart**: View the Recharts line plot with the shaded green JJM Safe Range (0.2–1.0 ppm). Test filtering by village (Shirur), date range, and worker.
   - **Actions Table**: Assign rechecks or mark items rechlorinated directly from the web interface.
   - **Report Exports**: Tap **Export CSV** to download tabular test records; tap **Audit PDF** to generate a formatted PDF report with summary KPIs and test logs.
