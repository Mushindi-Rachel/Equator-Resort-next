'use client';
import { useEffect, useMemo, useState } from 'react';
import { Search, Eye, ThumbsUp, XCircle, CheckCircle2, X, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ConferenceHallLite {
  id: string;
  name: string;
  capacity: number;
}

interface ConferenceBooking {
  id: string;
  booking_reference: string;
  hall_id: string;
  organization_name: string;
  contact_person: string;
  email: string | null;
  phone: string | null;
  event_date: string;
  delegates: number;
  package_type: 'HALF_DAY' | 'FULL_DAY';
  purpose: string | null;
  special_requests: string | null;
  payment_method: string | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_amount: number;
  created_at: string;
  conference_halls?: ConferenceHallLite;
}

function paymentColor(status: string) {
  switch (status) {
    case 'paid': return 'bg-emerald-100 text-emerald-700';
    case 'failed': return 'bg-red-100 text-red-700';
    case 'refunded': return 'bg-slate-200 text-slate-600';
    default: return 'bg-amber-100 text-amber-700';
  }
}

function statusColorFor(status: string) {
  switch (status) {
    case 'confirmed': return 'bg-emerald-100 text-emerald-700';
    case 'completed': return 'bg-purple-100 text-purple-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-amber-100 text-amber-700';
  }
}

export function ConferenceBookingsTab({ darkMode }: { darkMode: boolean }) {
  const [bookings, setBookings] = useState<ConferenceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [drawerBooking, setDrawerBooking] = useState<ConferenceBooking | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conference_bookings')
        .select('*, conference_halls(id, name, capacity)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateBookingStatus(id: string, booking_status: string) {
    try {
      const { error } = await supabase
        .from('conference_bookings')
        .update({ booking_status })
        .eq('id', id);
      if (error) throw error;
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, booking_status: booking_status as any } : b)));
      setDrawerBooking((prev) => (prev && prev.id === id ? { ...prev, booking_status: booking_status as any } : prev));
    } catch (err) {
      console.error(err);
    }
  }

  async function markPaid(id: string) {
    try {
      const { error } = await supabase
        .from('conference_bookings')
        .update({ payment_status: 'paid' })
        .eq('id', id);
      if (error) throw error;

      await supabase
        .from('conference_payments')
        .update({ payment_status: 'paid', paid_at: new Date().toISOString() })
        .eq('booking_id', id);

      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, payment_status: 'paid' } : b)));
      setDrawerBooking((prev) => (prev && prev.id === id ? { ...prev, payment_status: 'paid' } : prev));
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        !search ||
        b.organization_name?.toLowerCase().includes(search.toLowerCase()) ||
        b.contact_person?.toLowerCase().includes(search.toLowerCase()) ||
        b.booking_reference?.toLowerCase().includes(search.toLowerCase()) ||
        b.conference_halls?.name?.toLowerCase().includes(search.toLowerCase());
      const matchesPayment = paymentFilter === 'all' || b.payment_status === paymentFilter;
      const matchesStatus = statusFilter === 'all' || b.booking_status === statusFilter;
      return matchesSearch && matchesPayment && matchesStatus;
    });
  }, [bookings, search, paymentFilter, statusFilter]);

  return (
    <div>
      {loading && (
        <div className={`mb-4 text-xs font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Loading conference bookings…
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search organization, ref, hall..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'}`}
          />
        </div>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className={`px-3 py-2 rounded-lg border text-sm cursor-none focus:outline-none ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}
        >
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`px-3 py-2 rounded-lg border text-sm cursor-none focus:outline-none ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className={`rounded-xl border overflow-hidden ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`text-[10px] tracking-wider uppercase font-semibold ${darkMode ? 'bg-slate-900 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
              {['Organization', 'Hall', 'Date', 'Package', 'Delegates', 'Status', 'Payment', 'Total', 'Actions'].map((h) => (
                <th key={h} className={`px-4 py-3 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className={`px-4 py-16 text-center text-sm ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  No conference bookings match your filters
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id} className={`border-b last:border-0 transition-colors ${darkMode ? 'border-slate-800 hover:bg-slate-900' : 'border-slate-50 hover:bg-amber-50/30'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Building2 size={12} className="text-amber-700" />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{b.organization_name}</p>
                        <p className={`text-[10px] ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>{b.booking_reference}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{b.conference_halls?.name || '—'}</td>
                  <td className={`px-4 py-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{b.event_date}</td>
                  <td className={`px-4 py-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {b.package_type === 'HALF_DAY' ? 'Half Day' : 'Full Day'}
                  </td>
                  <td className={`px-4 py-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {b.delegates}{b.conference_halls?.capacity ? ` / ${b.conference_halls.capacity}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColorFor(b.booking_status)}`}>
                      {b.booking_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${paymentColor(b.payment_status)}`}>
                      {b.payment_status}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    Ksh.{b.total_amount?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDrawerBooking(b)} title="View"
                        className={`p-1.5 rounded-md transition-colors cursor-none ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                        <Eye size={13} />
                      </button>
                      {b.booking_status === 'pending' && (
                        <>
                          <button onClick={() => updateBookingStatus(b.id, 'confirmed')} title="Confirm"
                            className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-600 transition-colors cursor-none">
                            <ThumbsUp size={13} />
                          </button>
                          <button onClick={() => updateBookingStatus(b.id, 'cancelled')} title="Cancel"
                            className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors cursor-none">
                            <XCircle size={13} />
                          </button>
                        </>
                      )}
                      {b.payment_status !== 'paid' && (
                        <button onClick={() => markPaid(b.id)} title="Mark as Paid"
                          className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-600 transition-colors cursor-none">
                          <CheckCircle2 size={13} />
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
      <p className={`text-xs mt-3 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>{filtered.length} of {bookings.length} conference bookings</p>

      {/* Drawer */}
      {drawerBooking && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerBooking(null)} />
          <div className={`relative w-full max-w-md h-full overflow-y-auto p-6 ${darkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">Conference Booking</h3>
              <button onClick={() => setDrawerBooking(null)} className="p-1.5 rounded-md hover:bg-slate-100 cursor-none">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Reference</p>
                <p className="font-medium">{drawerBooking.booking_reference}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Hall</p>
                <p className="font-medium">{drawerBooking.conference_halls?.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Organization</p>
                  <p className="font-medium">{drawerBooking.organization_name}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Contact Person</p>
                  <p className="font-medium">{drawerBooking.contact_person}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Phone</p>
                  <p className="font-medium">{drawerBooking.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Email</p>
                  <p className="font-medium">{drawerBooking.email || '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Event Date</p>
                  <p className="font-medium">{drawerBooking.event_date}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Package</p>
                  <p className="font-medium">{drawerBooking.package_type === 'HALF_DAY' ? 'Half Day' : 'Full Day'}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Delegates</p>
                <p className="font-medium">{drawerBooking.delegates}{drawerBooking.conference_halls?.capacity ? ` / ${drawerBooking.conference_halls.capacity} max` : ''}</p>
              </div>
              {drawerBooking.purpose && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Purpose</p>
                  <p className="font-medium">{drawerBooking.purpose}</p>
                </div>
              )}
              {drawerBooking.special_requests && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Special Requests</p>
                  <p className="font-medium">{drawerBooking.special_requests}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Payment Method</p>
                <p className="font-medium">{drawerBooking.payment_method || '—'}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Total</span>
                <span className="font-semibold text-lg">Ksh.{drawerBooking.total_amount?.toLocaleString()}</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-4">
                {drawerBooking.booking_status === 'pending' && (
                  <>
                    <button onClick={() => updateBookingStatus(drawerBooking.id, 'confirmed')}
                      className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium cursor-none">
                      Confirm Booking
                    </button>
                    <button onClick={() => updateBookingStatus(drawerBooking.id, 'cancelled')}
                      className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-medium cursor-none">
                      Cancel Booking
                    </button>
                  </>
                )}
                {drawerBooking.booking_status === 'confirmed' && (
                  <button onClick={() => updateBookingStatus(drawerBooking.id, 'completed')}
                    className="px-3 py-2 rounded-lg bg-purple-50 text-purple-600 text-xs font-medium cursor-none">
                    Mark Completed
                  </button>
                )}
                {drawerBooking.payment_status !== 'paid' && (
                  <button onClick={() => markPaid(drawerBooking.id)}
                    className="px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium cursor-none">
                    Mark as Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}