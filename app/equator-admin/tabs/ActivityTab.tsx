// tabs/ActivityTab.tsx
import { Activity } from 'lucide-react';
import { formatTime } from '../utils';
import type { ActivityLog } from '../types';

interface Props { darkMode: boolean; activityLog: ActivityLog[]; }

export function ActivityTab({ darkMode, activityLog }: Props) {
  return (
    <div className="max-w-2xl">
      {activityLog.length === 0 ? (
        <div className={`text-center py-16 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-100 text-slate-400'}`}>
          <Activity size={32} className="mx-auto mb-3 opacity-30" />
          <p>No activity yet — actions you take will appear here</p>
        </div>
      ) : (
        <div className={`rounded-xl border overflow-hidden divide-y ${darkMode ? 'border-slate-800 divide-slate-800' : 'border-slate-100 divide-slate-100'}`}>
          {activityLog.map(log => (
            <div key={log.id} className={`flex items-start gap-4 px-5 py-3.5 ${darkMode ? 'bg-slate-900 hover:bg-slate-800' : 'bg-white hover:bg-slate-50'}`}>
              <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                log.type === 'booking'  ? 'bg-blue-500'   :
                log.type === 'payment' ? 'bg-emerald-500' :
                log.type === 'room'    ? 'bg-purple-500'  :
                log.type === 'review'  ? 'bg-amber-500'   : 'bg-slate-400'
              }`} />
              <div className="flex-1">
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{log.message}</p>
                <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>{formatTime(log.time)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}