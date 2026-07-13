import { statusColor } from '../utils';
import type { EnrichedBooking } from '../types';

interface Props {
  darkMode: boolean;
  bookings: EnrichedBooking[];
  totalRevenue: number;
}

export function PaymentsTab({ darkMode, bookings, totalRevenue }: Props) {
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, color: 'bg-emerald-500' },
          { label: 'Paid',    value: bookings.filter(b => b.payment_status === 'paid').length,    color: 'bg-blue-500' },
          { label: 'Pending', value: bookings.filter(b => b.payment_status === 'pending').length,  color: 'bg-amber-500' },
          { label: 'Failed',  value: bookings.filter(b => b.payment_status === 'failed').length,   color: 'bg-red-500' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-100'}`}>
            <div className={`w-2 h-2 rounded-full ${s.color} mb-2`} />
            <p className={`text-[10px] uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className={`rounded-xl border overflow-hidden ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <table className="w-full text-left">
          <thead>
            <tr className={`text-[10px] tracking-wider uppercase font-semibold ${darkMode ? 'bg-slate-900 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
              {['Booking', 'Guest', 'Method', 'M-Pesa #', 'Amount', 'Status'].map(h => (
                <th key={h} className={`px-4 py-3 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} className={`border-b last:border-0 ${darkMode ? 'border-slate-800 hover:bg-slate-900' : 'border-slate-50 hover:bg-amber-50/20'}`}>
                <td className={`px-4 py-3 text-sm font-mono ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{b.booking_reference}</td>
                <td className={`px-4 py-3 text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{b.guest_name}</td>
                <td className={`px-4 py-3 text-xs uppercase font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{b.payment_method || 'mpesa'}</td>
                <td className={`px-4 py-3 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{b.mpesa_number || '—'}</td>
                <td className={`px-4 py-3 text-sm font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>${b.total_amount?.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(b.payment_status)}`}>{b.payment_status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}