import { useState, type FC } from 'react';
import type { User } from '../types';
import { DEMO_USERS } from '../services/dashboardData';
import { ShieldCheck, Droplet, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  onLogin: (user: User) => void;
}

export const LoginModal: FC<LoginModalProps> = ({ onLogin }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectRole = (user: User) => {
    setErrorMessage(null);
    if (user.role === 'worker') {
      setErrorMessage(
        'Access Denied: Field Workers must use the Cl-Ladder mobile app for strip scanning and field testing. Only Supervisors and Officers have dashboard access.'
      );
      return;
    }
    onLogin(user);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-teal-600/30">
            <Droplet className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Cl-Ladder Officer Portal</h2>
          <p className="text-xs text-teal-700 font-bold uppercase tracking-wider mt-0.5">
            Jal Jeevan Mission • Water Quality Monitoring
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Restricted administrative dashboard for JJM State Officers and Cluster Supervisors.
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="leading-snug">{errorMessage}</p>
          </div>
        )}

        {/* Role options */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Authorized Profile:</p>

          {/* Officer */}
          <button
            onClick={() => handleSelectRole(DEMO_USERS[0])}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-slate-900">Vijay Deshmukh (JJM Officer)</p>
              <p className="text-xs text-slate-500">State HQ - Maharashtra • Full Compliance Authority</p>
            </div>
            <span className="text-xs font-bold text-teal-600">Login &rarr;</span>
          </button>

          {/* Supervisor */}
          <button
            onClick={() => handleSelectRole(DEMO_USERS[1])}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-slate-900">Sunita Patil (Supervisor)</p>
              <p className="text-xs text-slate-500">Pune District Cluster • Recheck & Alert Management</p>
            </div>
            <span className="text-xs font-bold text-teal-600">Login &rarr;</span>
          </button>

          {/* Field Worker (Demonstrates restriction) */}
          <button
            onClick={() => handleSelectRole(DEMO_USERS[2])}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-dashed border-slate-300 hover:bg-slate-50 transition text-left opacity-75"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-xs text-slate-700">Ramesh Kumar (Field Worker)</p>
              <p className="text-[11px] text-slate-400">Village Volunteer (Mobile app only)</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Restricted</span>
          </button>
        </div>
      </div>
    </div>
  );
};
