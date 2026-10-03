import { useState, useEffect, useMemo, useCallback } from 'react';
import type { User, TestRecord, AlertRecord } from './types';
import { dashboardDataService, DEMO_USERS, DEMO_VILLAGES } from './services/dashboardData';
import { supabase, isSupabaseLive } from './services/supabase';
import { exportToCsv, exportToPdf } from './services/exportReport';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { VillageMap } from './components/VillageMap';
import { TrendsChart } from './components/TrendsChart';
import { AlertsTable } from './components/AlertsTable';
import { LoginModal } from './components/LoginModal';
import 'leaflet/dist/leaflet.css';
import './App.css';

export function App() {
  // Authentication: default to JJM Officer Vijay Deshmukh
  const [currentUser, setCurrentUser] = useState<User | null>(DEMO_USERS[0]);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Data states
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);

  // Filter states
  const [selectedVillage, setSelectedVillage] = useState<string>('');
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      const [fetchedTests, fetchedAlerts] = await Promise.all([
        dashboardDataService.getTests(),
        dashboardDataService.getAlerts(),
      ]);
      setTests(fetchedTests);
      setAlerts(fetchedAlerts);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime Supabase Subscription
  useEffect(() => {
    if (!isSupabaseLive) {
      // Simulate live connection for local demo mode
      setIsRealtimeConnected(false);
      return;
    }

    setIsRealtimeConnected(true);
    const channel = supabase
      .channel('jjm_dashboard_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tests' },
        () => {
          loadData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alerts' },
        () => {
          loadData();
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  // Filter options lists
  const villagesList = useMemo(() => {
    return DEMO_VILLAGES.map((v) => ({ id: v.id, name: v.name }));
  }, []);

  const workersList = useMemo(() => {
    const set = new Set<string>();
    tests.forEach((t) => {
      if (t.worker_name) set.add(t.worker_name);
    });
    return Array.from(set);
  }, [tests]);

  // Filtered tests computation
  const filteredTests = useMemo(() => {
    let result = [...tests];

    if (selectedVillage) {
      result = result.filter((t) => t.village_id === selectedVillage);
    }

    if (selectedWorker) {
      result = result.filter((t) => t.worker_name === selectedWorker);
    }

    if (selectedDateRange !== 'all') {
      const days = selectedDateRange === '7d' ? 7 : 14;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter((t) => new Date(t.tested_at).getTime() >= cutoff.getTime());
    }

    return result;
  }, [tests, selectedVillage, selectedWorker, selectedDateRange]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    if (!selectedVillage) return alerts;
    return alerts.filter((a) => a.village_id === selectedVillage);
  }, [alerts, selectedVillage]);

  // Village statuses for the map
  const villageStatuses = useMemo(() => {
    return dashboardDataService.getVillageStatuses(tests, alerts);
  }, [tests, alerts]);

  // Alert actions
  const handleAssignRecheck = async (alertId: string, workerId: string, workerName: string) => {
    await dashboardDataService.assignRecheck(alertId, workerId, workerName);
    await loadData();
  };

  const handleMarkRechlorinated = async (alertId: string) => {
    await dashboardDataService.markRechlorinated(alertId);
    await loadData();
  };

  // Export actions
  const handleExportCsv = () => {
    const filename = `jjm_cl_ladder_tests_${selectedVillage || 'all'}_${Date.now()}.csv`;
    exportToCsv(filteredTests, filename);
  };

  const handleExportPdf = () => {
    const villageName = DEMO_VILLAGES.find((v) => v.id === selectedVillage)?.name;
    exportToPdf(filteredTests, filteredAlerts, {
      village: villageName,
      worker: selectedWorker,
      dateRange: selectedDateRange === '7d' ? 'Last 7 Days' : selectedDateRange === '14d' ? 'Last 14 Days' : 'All Time',
    });
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLoginModal(true);
  };

  return (
    <div className="dashboard-app min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onExportPdf={handleExportPdf}
        isRealtimeConnected={isRealtimeConnected}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner greeting & info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Water Quality Residual Chlorine Dashboard
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              National Jal Jeevan Mission Surveillance & Escalation Portal • District Pune
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Logged in as:</span>
            <span className="text-xs font-bold text-teal-800 bg-teal-100 border border-teal-300 px-2.5 py-1 rounded-full">
              {currentUser?.name} ({currentUser?.role.toUpperCase()})
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold">Loading water quality telemetry...</p>
          </div>
        ) : (
          <>
            {/* 1. Overview Summary KPI Cards */}
            <MetricCards tests={filteredTests} alerts={filteredAlerts} />

            {/* 2. Interactive Map of Villages */}
            <VillageMap
              villages={villageStatuses}
              recentTests={tests}
              selectedVillageId={selectedVillage}
              onSelectVillage={(vId) => setSelectedVillage(vId === selectedVillage ? '' : vId)}
            />

            {/* 3. Trends Line Chart with Dynamic Filters */}
            <TrendsChart
              tests={filteredTests}
              selectedVillage={selectedVillage}
              onVillageChange={setSelectedVillage}
              selectedWorker={selectedWorker}
              onWorkerChange={setSelectedWorker}
              selectedDateRange={selectedDateRange}
              onDateRangeChange={setSelectedDateRange}
              villagesList={villagesList}
              workersList={workersList}
            />

            {/* 4. Low-FRC Alerts & Supervisor Actions Table */}
            <AlertsTable
              alerts={filteredAlerts}
              onAssignRecheck={handleAssignRecheck}
              onMarkRechlorinated={handleMarkRechlorinated}
              onExportCsv={handleExportCsv}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 font-medium">
        Jal Jeevan Mission (JJM) • Har Ghar Jal • Free Residual Chlorine (FRC) Ladder Surveillance Protocol
      </footer>

      {/* Login modal if logged out */}
      {showLoginModal && <LoginModal onLogin={handleLogin} />}
    </div>
  );
}

export default App;
