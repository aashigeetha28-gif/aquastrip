import type { FC } from 'react';
import type { TestRecord, AlertRecord } from '../types';
import { FlaskConical, CheckCircle2, AlertTriangle, BellRing } from 'lucide-react';

interface MetricCardsProps {
  tests: TestRecord[];
  alerts: AlertRecord[];
}

export const MetricCards: FC<MetricCardsProps> = ({ tests, alerts }) => {
  const total = tests.length;
  const safeTests = tests.filter((t) => t.status === 'safe').length;
  const safePercentage = total > 0 ? Math.round((safeTests / total) * 100) : 100;
  const lowCount = tests.filter((t) => t.status === 'low').length;
  const openAlerts = alerts.filter((a) => a.status === 'open' || a.status === 'recheck_assigned').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Tests */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow transition">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Strip Tests</p>
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <FlaskConical className="w-5 h-5" />
          </div>
        </div>
        <p className="text-3xl font-extrabold text-slate-900 mt-2">{total}</p>
        <p className="text-xs text-slate-500 mt-1 font-medium">Logged across 3 rural Gram Panchayats</p>
      </div>

      {/* 2. Safe Water % */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow transition">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Safe Compliance (0.2-1.0 ppm)</p>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-3xl font-extrabold text-emerald-600">{safePercentage}%</p>
          <span className="text-xs text-slate-500 font-semibold">({safeTests} of {total})</span>
        </div>
        <p className="text-xs text-slate-500 mt-1 font-medium">Meeting JJM minimum bacteriological limit</p>
      </div>

      {/* 3. Low-FRC Breaches */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow transition">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Low-FRC Breaches (&lt;0.2 ppm)</p>
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <p className="text-3xl font-extrabold text-red-600 mt-2">{lowCount}</p>
        <p className="text-xs text-red-600/80 mt-1 font-medium">High contamination risk (0-1 blue pads)</p>
      </div>

      {/* 4. Active Action Alerts */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow transition">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Escalations</p>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <BellRing className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-3xl font-extrabold text-amber-600">{openAlerts}</p>
          <span className="text-xs text-slate-500 font-semibold">awaiting resolution</span>
        </div>
        <p className="text-xs text-slate-500 mt-1 font-medium">Requires supervisor recheck assignment</p>
      </div>
    </div>
  );
};
