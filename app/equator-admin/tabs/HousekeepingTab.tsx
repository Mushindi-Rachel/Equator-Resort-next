import { Wrench } from 'lucide-react';
import type { Room } from '../types';

interface Props {
  darkMode: boolean;
  rooms: Room[];
  housekeepingStatus: Record<string, 'clean' | 'cleaning' | 'maintenance'>;
  onStatusChange: (roomId: string, status: 'clean' | 'cleaning' | 'maintenance') => void;
}

export function HousekeepingTab({ darkMode, rooms, housekeepingStatus, onStatusChange }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {rooms.map(r => {
        const hs =
  r.status === 'maintenance'
    ? 'maintenance'
    : r.status === 'cleaning'
    ? 'cleaning'
    : 'clean';
        return (
          <div key={r.id} className={`rounded-xl border p-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Room {r.room_number ?? r.id}</p>
                <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{r.name}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${hs === 'clean' ? 'bg-emerald-500' : hs === 'cleaning' ? 'bg-amber-400' : 'bg-red-500'}`} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['clean', 'cleaning', 'maintenance'] as const).map(s => (
                <button key={s} onClick={() => onStatusChange(r.id, s)}
                  className={`text-[10px] px-2 py-1 rounded-md font-semibold capitalize cursor-none transition-all ${hs === s
                    ? s === 'clean' ? 'bg-emerald-500 text-white' : s === 'cleaning' ? 'bg-amber-400 text-white' : 'bg-red-500 text-white'
                    : darkMode ? 'bg-slate-800 text-slate-500 hover:text-slate-300' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        );
      })}
      {rooms.length === 0 && (
        <div className={`col-span-4 text-center py-16 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-100 text-slate-400'}`}>
          <Wrench size={32} className="mx-auto mb-3 opacity-30" />
          <p>No rooms to manage</p>
        </div>
      )}
    </div>
  );
}