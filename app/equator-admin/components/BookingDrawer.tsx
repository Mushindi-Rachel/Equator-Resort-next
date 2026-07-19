import { ThumbsUp, XCircle, DoorOpen, DoorClosed, Printer, Mail, Phone, Check } from 'lucide-react';
import { Drawer } from './drawer';
import { statusColor, nightsBetween } from '../utils';
import type { EnrichedBooking } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  booking: EnrichedBooking | null;
  onUpdateConfirmation: (id: string, status: string) => void;
}

export function BookingDrawer({ open, onClose, booking: b, onUpdateConfirmation }: Props) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={b ? `Booking ${b.booking_reference}` : 'Booking Details'}
    >
      {b && (
        <div className="space-y-6">

          {/* Guest */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-3">Guest</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-amber-700 font-bold">{b.guest_name?.charAt(0)}</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">{b.guest_name}</p>
                <p className="text-xs text-slate-400">{b.guest_email}</p>
              </div>
            </div>
            {b.guest_phone && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={13} className="text-slate-400" /> {b.guest_phone}
              </div>
            )}
          </div>

          {/* Stay */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-3">Stay Details</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Room',      b.rooms?.name || '—'],
                ['Room #',    b.rooms?.room_number || '—'],
                ['Check-in',  b.check_in],
                ['Check-out', b.check_out],
                ['Nights',    nightsBetween(b.check_in, b.check_out)],
                ['Guests',    `${b.adults} adults, ${b.children} children`],
              ].map(([l, v]) => (
                <div key={String(l)} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">{l}</p>
                  <p className="text-sm font-semibold text-slate-800">{String(v)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Package */}
<div>
  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-3">
    Package
  </p>

  <div className="bg-slate-50 rounded-lg p-3">
    <p className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">
      Meal Plan
    </p>

    <p className="text-sm font-semibold text-slate-800">
      {b.package_type === "BB"
        ? "Bed & Breakfast"
        : b.package_type === "HB"
        ? "Half Board"
        : b.package_type === "FB"
        ? "Full Board"
        : b.package_type === "BO"
        ? "Bed Only"
        : b.package_type === "DAY_REST"
        ? "Day Rest"
        : "—"}
    </p>
  </div>
</div>

          {/* Payment */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-3">Payment</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Total',    `Ksh. ${b.total_amount?.toLocaleString()}`],
                ['Status',   b.payment_status],
                ['Method',   b.payment_method?.toUpperCase() || '—'],
                ['M-Pesa #', b.mpesa_number || '—'],
              ].map(([l, v]) => (
                <div key={String(l)} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">{l}</p>
                  <p className={`text-sm font-semibold ${l === 'Status' ? statusColor(String(v)).replace('bg-', 'text-').replace('-100', '-700') : 'text-slate-800'}`}>
                    {String(v)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-3">Timeline</p>
            <div className="space-y-2">
              {[
                { label: 'Created',     done: true, date: new Date(b.created_at ?? Date.now()).toLocaleDateString(),},
                { label: "Confirmed", done: b.confirmation_status === "confirmed",},
                { label: 'Paid',        done: b.payment_status === 'paid' },
                {
                    label: "Checked In",
                    done: ["checked_in", "checked_out"].includes(
                      b.booking_status ?? ""
                    ),
                  },
                  {
                    label: "Checked Out",
                    done: b.booking_status === "checked_out",
                  },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    {step.done && <Check size={11} className="text-white" />}
                  </div>
                  <span className={`text-sm ${step.done ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>{step.label}</span>
                  {step.date && <span className="text-xs text-slate-400 ml-auto">{step.date}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-3">Actions</p>
            <div className="flex flex-wrap gap-2">
              {(!b.booking_status  || b.booking_status === 'pending') && (
                <>
                  <button onClick={() => onUpdateConfirmation(b.id, 'confirmed')}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-none transition-colors">
                    <ThumbsUp size={12} /> Confirm
                  </button>
                  <button onClick={() => onUpdateConfirmation(b.id, 'cancelled')}
                    className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-none transition-colors">
                    <XCircle size={12} /> Reject
                  </button>
                </>
              )}
              {b.booking_status === "confirmed" && (
                <button onClick={() => onUpdateConfirmation(b.id, 'checked_in')}
                  className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-none transition-colors">
                  <DoorOpen size={12} /> Check In
                </button>
              )}
              {b.booking_status === "checked_in" && (
                <button onClick={() => onUpdateConfirmation(b.id, 'checked_out')}
                  className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-none transition-colors">
                  <DoorClosed size={12} /> Check Out
                </button>
              )}
              <button
  onClick={() => window.print()}
  className="flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600 px-4 py-2 rounded-lg text-xs font-semibold cursor-none transition-colors"
>
  <Printer size={12} />
  Print Invoice
</button>
              <button
  onClick={() => {
    if (!b.guest_email) {
      alert("Guest email is not available.");
      return;
    }

    const subject = encodeURIComponent(
      `Your Booking ${b.booking_reference}`
    );

    const body = encodeURIComponent(
`Dear ${b.guest_name},

Thank you for choosing Equator Resort.

Booking Reference: ${b.booking_reference}
Room: ${b.rooms?.name ?? "-"}
Package: ${b.package_type ?? "-"}
Check-in: ${b.check_in}
Check-out: ${b.check_out}
Guests: ${b.adults} Adults, ${b.children} Children
Total: KES ${b.total_amount?.toLocaleString()}

We look forward to welcoming you.

Kind regards,
Equator Resort`
    );

    window.location.href = `mailto:${b.guest_email}?subject=${subject}&body=${body}`;
  }}
  className="flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
>
  <Mail size={12} />
  Email Guest
</button>
            </div>
          </div>

          {b.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
              <p className="text-[10px] font-bold tracking-wider uppercase text-amber-600 mb-1">Notes</p>
              <p className="text-sm text-slate-700">{b.notes}</p>
            </div>
          )}

        </div>
      )}
    </Drawer>
  );
}