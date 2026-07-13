import { Download } from 'lucide-react';

interface Props { darkMode: boolean; }

const REPORTS = [
  { label: 'Daily Report',     desc: "Today's bookings, arrivals, and revenue" },
  { label: 'Weekly Report',    desc: 'Booking trends for this week' },
  { label: 'Monthly Report',   desc: 'Full monthly breakdown' },
  { label: 'Occupancy Report', desc: 'Room utilization analysis' },
  { label: 'Revenue Report',   desc: 'Payments and financial summary' },
  { label: 'Guest Report',     desc: 'Guest profiles and repeat visitors' },
];

export function ReportsTab({ darkMode }: Props) {
  return (
    <div className="max-w-xl space-y-4">
      {REPORTS.map(rep => (
        <div key={rep.label} className={`rounded-xl border p-4 flex items-center justify-between ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div>
            <p className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{rep.label}</p>
            <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{rep.desc}</p>
          </div>
          <div className="flex gap-2">
            {['PDF', 'Excel'].map(fmt => (
              <button key={fmt}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-none ${darkMode ? 'border-slate-700 text-slate-400 hover:border-amber-500 hover:text-amber-400' : 'border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600'}`}>
                <Download size={12} /> {fmt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}