import { useState } from 'react';
import type { AlertRecord, User } from '../types';
import { DEMO_USERS } from '../services/dashboardData';
import { AlertCircle, CheckCircle, UserPlus, Download } from 'lucide-react';

interface AlertsTableProps {
  alerts: AlertRecord[];
  onAssignRecheck: (alertId: string, workerId: string, workerName: string) => Promise<void>;
  onMarkRechlorinated: (alertId: string) => Promise<void>;
  onExportCsv: () => void;
}

export const AlertsTable: React.FC<AlertsTableProps> = ({
  alerts,
  onAssignRecheck,
  onMarkRechlorinated,
  onExportCsv,
}) => {
  const [selectedAlertForAssign, setSelectedAlertForAssign] = useState<AlertRecord | null>(null);
  const workers = DEMO_USERS.filter((u) => u.role === 'worker');

  const handleSelectWorker = async (worker: User) => {
    if (!selectedAlertForAssign) return;
    await onAssignRecheck(selectedAlertForAssign.id, worker.id, worker.name);
    setSelectedAlertForAssign(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Low-FRC Escalation & Rechlorination Log</h3>
            <p className="text-xs text-slate-500">Live supervisor action tracker for tap posts with residual below 0.2 ppm</p>
          </div>
        </div>

        <button
          onClick={onExportCsv}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
              <th className="py-3 px-4">Village</th>
              <th className="py-3 px-4">FRC Residual</th>
              <th className="py-3 px-4">Tested Time</th>
              <th className="py-3 px-4">Field Volunteer</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Assigned Worker</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                  No alerts recorded. All water points comply with JJM safe standards.
                </td>
              </tr>
            ) : (
              alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {alert.village_name}
                    {alert.notes && (
                      <p className="font-normal text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">{alert.notes}</p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-red-600">{alert.frc_range}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    {new Date(alert.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold">{alert.worker_name}</td>
                  <td className="py-3.5 px-4">
                    {alert.status === 'open' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-red-50 text-red-700 border border-red-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        OPEN ALERT
                      </span>
                    )}
                    {alert.status === 'recheck_assigned' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                        RECHECK ASSIGNED
                      </span>
                    )}
                    {alert.status === 'rechlorinated' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        RECHLORINATED
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {alert.assigned_to_name || <span className="text-slate-400 italic">Unassigned</span>}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {alert.status === 'open' && (
                        <button
                          onClick={() => setSelectedAlertForAssign(alert)}
                          className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-md transition"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>Assign</span>
                        </button>
                      )}

                      {alert.status !== 'rechlorinated' && (
                        <button
                          onClick={() => onMarkRechlorinated(alert.id)}
                          className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-md transition"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Rechlorinated</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Assign Volunteer Worker */}
      {selectedAlertForAssign && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h4 className="font-extrabold text-base text-slate-900">Assign Recheck Task</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Select a field volunteer to conduct secondary strip testing in{' '}
              <span className="font-bold text-slate-700">{selectedAlertForAssign.village_name}</span>.
            </p>

            <div className="space-y-2">
              {workers.map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleSelectWorker(w)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition text-left"
                >
                  <div>
                    <p className="font-bold text-xs text-slate-900">{w.name}</p>
                    <p className="text-[11px] text-slate-500">{w.phone} • {w.district}</p>
                  </div>
                  <span className="text-xs font-bold text-teal-600">Assign &rarr;</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setSelectedAlertForAssign(null)}
              className="w-full mt-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
