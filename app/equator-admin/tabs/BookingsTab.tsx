import { Search, Eye, ThumbsUp, XCircle, DoorOpen, DoorClosed } from 'lucide-react';
import { statusColor, confirmationColor } from '../utils';
import type { EnrichedBooking } from '../types';

interface Props {
  darkMode: boolean;
  bookings: EnrichedBooking[];
  filtered: EnrichedBooking[];
  search: string;
  setSearch: (v: string) => void;
  paymentFilter: string;
  setPaymentFilter: (v: string) => void;
  confirmFilter: string;
  setConfirmFilter: (v: string) => void;
  onOpenDrawer: (booking: EnrichedBooking) => void;
  onUpdateConfirmation: (id: string, status: string) => void;
}

export function BookingsTab({
  darkMode, bookings, filtered, search, setSearch, paymentFilter, setPaymentFilter,
  confirmFilter, setConfirmFilter, onOpenDrawer, onUpdateConfirmation,
}: Props) {
  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search guest, ref, room..." value={search} onChange={e => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'}`} />
        </div>
        <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}
          className={`px-3 py-2 rounded-lg border text-sm cursor-none focus:outline-none ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <select value={confirmFilter} onChange={e => setConfirmFilter(e.target.value)}
          className={`px-3 py-2 rounded-lg border text-sm cursor-none focus:outline-none ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked_in">Checked In</option>
          <option value="checked_out">Checked Out</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className={`rounded-xl border overflow-hidden ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`text-[10px] tracking-wider uppercase font-semibold ${darkMode ? 'bg-slate-900 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
              {['Guest', 'Room', 'Check In', 'Check Out', 'Status', 'Payment', 'Total', 'Actions'].map(h => (
                <th key={h} className={`px-4 py-3 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className={`px-4 py-16 text-center text-sm ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>No bookings match your filters</td></tr>
            ) : filtered.map(b => (
              <tr key={b.id} className={`border-b last:border-0 transition-colors ${darkMode ? 'border-slate-800 hover:bg-slate-900' : 'border-slate-50 hover:bg-amber-50/30'}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-700 text-[10px] font-bold">{b.guest_name?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{b.guest_name}</p>
                      <p className={`text-[10px] ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>{b.booking_reference}</p>
                    </div>
                  </div>
                </td>
                <td className={`px-4 py-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{b.rooms?.name || '—'}</td>
                <td className={`px-4 py-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{b.check_in}</td>
                <td className={`px-4 py-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{b.check_out}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${confirmationColor(b.confirmation_status || 'pending')}`}>
                    {b.confirmation_status || 'pending'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(b.payment_status)}`}>{b.payment_status}</span>
                </td>
                <td className={`px-4 py-3 text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Ksh.{b.total_amount?.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onOpenDrawer(b)} title="View"
                      className={`p-1.5 rounded-md transition-colors cursor-none ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                      <Eye size={13} />
                    </button>
                    {(!b.confirmation_status || b.confirmation_status === 'pending') && (
                      <>
                        <button onClick={() => onUpdateConfirmation(b.id, 'confirmed')} title="Confirm"
                          className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-600 transition-colors cursor-none"><ThumbsUp size={13} /></button>
                        <button onClick={() => onUpdateConfirmation(b.id, 'rejected')} title="Reject"
                          className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors cursor-none"><XCircle size={13} /></button>
                      </>
                    )}
                    {b.confirmation_status === 'confirmed' && (
                      <button onClick={() => onUpdateConfirmation(b.id, 'checked_in')} title="Check In"
                        className="p-1.5 rounded-md hover:bg-purple-50 text-purple-500 transition-colors cursor-none"><DoorOpen size={13} /></button>
                    )}
                    {b.confirmation_status === 'checked_in' && (
                      <button onClick={() => onUpdateConfirmation(b.id, 'checked_out')} title="Check Out"
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors cursor-none"><DoorClosed size={13} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={`text-xs mt-3 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>{filtered.length} of {bookings.length} bookings</p>
    </div>
  );
}