import { nightsBetween } from '../utils';
import type { EnrichedBooking, Room } from '../types';

interface Props {
  darkMode: boolean;
  bookings: EnrichedBooking[];
  rooms: Room[];
  totalRevenue: number;
  occupiedRooms: number;
  totalRooms: number;
  monthlyData: { label: string; value: number }[];
  roomPopularity: { name: string; count: number }[];
}

export function AnalyticsTab({
  darkMode, bookings, totalRevenue, occupiedRooms, totalRooms, monthlyData, roomPopularity,
}: Props) {
  const avgBookingValue = bookings.length ? Math.round(totalRevenue / bookings.length) : 0;
  const occupancyRate   = Math.round((Math.min(occupiedRooms, totalRooms) / (totalRooms || 1)) * 100);
  const avgStay         = bookings.length
    ? (bookings.reduce((s, b) => s + nightsBetween(b.check_in, b.check_out), 0) / bookings.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Avg Booking Value', value: `$${avgBookingValue.toLocaleString()}` },
          { label: 'Occupancy Rate',    value: `${occupancyRate}%` },
          { label: 'Avg Stay (nights)', value: avgStay },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-5 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <p className={`text-[10px] font-semibold tracking-wider uppercase mb-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{s.label}</p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className={`rounded-xl border p-5 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <p className={`text-[10px] font-semibold tracking-wider uppercase mb-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Monthly Revenue (last 6 months)</p>
        <div className="flex items-end gap-3 h-32">
          {monthlyData.map((d, i) => {
            const max = Math.max(...monthlyData.map(x => x.value), 1);
            return (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <span className={`text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{d.value > 0 ? `$${(d.value / 1000).toFixed(0)}k` : ''}</span>
                <div className="w-full rounded-t-md bg-amber-500" style={{ height: `${Math.max(4, (d.value / max) * 80)}px`, opacity: 0.7 + (i / 6) * 0.3 }} />
                <span className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`rounded-xl border p-5 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <p className={`text-[10px] font-semibold tracking-wider uppercase mb-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Room Popularity</p>
        {roomPopularity.length === 0 ? (
          <p className="text-slate-400 text-sm">No data yet</p>
        ) : roomPopularity.map((r, i) => {
          const max = roomPopularity[0].count || 1;
          return (
            <div key={i} className="mb-3">
              <div className="flex justify-between text-sm mb-1.5">
                <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{r.name}</span>
                <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>{r.count} bookings</span>
              </div>
              <div className={`h-2 rounded-full ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div className="h-2 rounded-full bg-amber-500" style={{ width: `${(r.count / max) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}