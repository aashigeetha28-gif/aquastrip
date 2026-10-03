import type { FC } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import type { TestRecord } from '../types';
import { TrendingUp, Filter } from 'lucide-react';

interface TrendsChartProps {
  tests: TestRecord[];
  selectedVillage: string;
  onVillageChange: (village: string) => void;
  selectedWorker: string;
  onWorkerChange: (worker: string) => void;
  selectedDateRange: string;
  onDateRangeChange: (range: string) => void;
  villagesList: { id: string; name: string }[];
  workersList: string[];
}

export const TrendsChart: FC<TrendsChartProps> = ({
  tests,
  selectedVillage,
  onVillageChange,
  selectedWorker,
  onWorkerChange,
  selectedDateRange,
  onDateRangeChange,
  villagesList,
  workersList,
}) => {
  // Sort tests chronologically for the timeline chart
  const sortedTests = [...tests].sort(
    (a, b) => new Date(a.tested_at).getTime() - new Date(b.tested_at).getTime()
  );

  const chartData = sortedTests.map((t) => ({
    id: t.id,
    timestamp: t.tested_at,
    displayDate: new Date(t.tested_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    }),
    fullTime: new Date(t.tested_at).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    frc: t.frc_numeric,
    frcRange: t.frc_range,
    pads: t.blue_pad_count,
    village: t.village_name.split(' ')[0],
    worker: t.worker_name?.split(' ')[0] || 'Worker',
    status: t.status,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">FRC Residual Chlorine Trends Over Time</h3>
            <p className="text-xs text-slate-500">Target safe drinking range: 0.2 to 1.0 ppm (shaded green)</p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Village Filter */}
          <select
            value={selectedVillage}
            onChange={(e) => onVillageChange(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="">All Villages</option>
            {villagesList.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          {/* Worker Filter */}
          <select
            value={selectedWorker}
            onChange={(e) => onWorkerChange(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="">All Workers</option>
            {workersList.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>

          {/* Date Range Filter */}
          <select
            value={selectedDateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">All Dates</option>
            <option value="7d">Last 7 Days</option>
            <option value="14d">Last 14 Days</option>
          </select>
        </div>
      </div>

      {/* Recharts Timeline */}
      <div className="h-72 w-full mt-4">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
            No test records match the selected filters.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="displayDate" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis
                domain={[0, 5.5]}
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                ticks={[0, 0.2, 0.5, 1.0, 2.0, 5.0]}
                unit=" ppm"
              />

              {/* JJM Safe Drinking Range Zone (0.2 - 1.0 ppm) */}
              <ReferenceArea
                y1={0.2}
                y2={1.0}
                fill="#DCFCE7"
                fillOpacity={0.65}
                label={{
                  value: 'JJM Safe Range (0.2-1.0 ppm)',
                  fill: '#15803D',
                  fontSize: 10,
                  position: 'insideTopLeft',
                  offset: 10,
                }}
              />

              {/* Low-FRC Risk Baseline (0.2 ppm) */}
              <ReferenceLine
                y={0.2}
                stroke="#DC2626"
                strokeDasharray="4 4"
                label={{ value: 'Min Limit (0.2 ppm)', fill: '#DC2626', fontSize: 10, position: 'right' }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs font-sans">
                        <div className="font-extrabold text-slate-900 mb-1">{data.village}</div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-teal-700 text-sm">{data.frcRange}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              data.status === 'safe'
                                ? 'bg-emerald-100 text-emerald-800'
                                : data.status === 'low'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {data.status}
                          </span>
                        </div>
                        <div className="text-slate-500">Pads Blue: {data.pads} of 6</div>
                        <div className="text-slate-500">Tested by: {data.worker}</div>
                        <div className="text-slate-400 text-[10px] mt-1 border-t border-slate-100 pt-1">
                          {data.displayDate} at {data.fullTime}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Line
                type="monotone"
                dataKey="frc"
                stroke="#0D9488"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#0D9488', stroke: '#FFFFFF', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#0F766E' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
