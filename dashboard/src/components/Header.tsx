import type { FC } from 'react';
import type { User } from '../types';
import { ShieldCheck, Droplet, Wifi, LogOut, FileText } from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onExportPdf: () => void;
  isRealtimeConnected: boolean;
}

export const Header: FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onExportPdf,
  isRealtimeConnected,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">Cl-Ladder</span>
              <span className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded font-bold border border-teal-200">
                OFFICER DASHBOARD
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Jal Jeevan Mission • Water Quality Portal</p>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center gap-3">
          {/* Live Realtime Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Wifi className="w-3.5 h-3.5" />
            <span>{isRealtimeConnected ? 'Live Supabase Sync' : 'Simulated Realtime'}</span>
          </div>

          {/* Quick PDF Report button */}
          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Audit PDF</span>
          </button>

          {/* User profile */}
          {currentUser && (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-teal-700 font-semibold uppercase tracking-wider">
                  {currentUser.role === 'officer' ? 'JJM Officer' : 'Cluster Supervisor'}
                </p>
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
              </div>

              <button
                onClick={onLogout}
                title="Switch account"
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
