// tabs/GuestsTab.tsx
import type { EnrichedBooking } from '../types';

interface Props {
  darkMode: boolean;
  guests: { name: string; email: string; bookings: EnrichedBooking[]; spend: number }[];
}

export function GuestsTab({ darkMode, guests }: Props) {
  return (
    <div className={`rounded-xl border overflow-hidden ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
      <table className="w-full text-left">
        <thead>
          <tr className={`text-[10px] tracking-wider uppercase font-semibold ${darkMode ? 'bg-slate-900 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
            {['Guest', 'Email', 'Total Bookings', 'Last Visit', 'Lifetime Spend'].map(h => (
              <th key={h} className={`px-5 py-3 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {guests.length === 0 ? (
            <tr><td colSpan={5} className="px-5 py-16 text-center text-sm text-slate-400">No guests yet</td></tr>
          ) : guests.map((g, i) => (
            <tr key={i} className={`border-b last:border-0 ${darkMode ? 'border-slate-800 hover:bg-slate-900' : 'border-slate-50 hover:bg-amber-50/20'}`}>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-700 text-xs font-bold">{g.name?.charAt(0)}</span>
                  </div>
                  <span className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{g.name}</span>
                </div>
              </td>
              <td className={`px-5 py-3.5 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{g.email || '—'}</td>
              <td className={`px-5 py-3.5 text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{g.bookings.length}</td>
              <td className={`px-5 py-3.5 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{g.bookings[0]?.check_in || '—'}</td>
              <td className={`px-5 py-3.5 text-sm font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>${g.spend.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}