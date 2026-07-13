import { Plus, CheckCircle2 } from 'lucide-react';
import { nightsBetween } from '../utils';
import type { Room, NewBookingForm } from '../types';

interface Props {
  darkMode: boolean;
  rooms: Room[];
  newBooking: NewBookingForm;
  setNewBooking: (fn: (prev: NewBookingForm) => NewBookingForm) => void;
  savingBooking: boolean;
  bookingError: string;
  bookingSuccess: string;
  onSubmit: (e: React.FormEvent) => void;
}

export function NewBookingTab({
  darkMode, rooms, newBooking, setNewBooking,
  savingBooking, bookingError, bookingSuccess, onSubmit,
}: Props) {
  const today = new Date().toISOString().split('T')[0];
  const selectedRoom = rooms.find(r => r.id === newBooking.roomId);
  const pricePerNight =
  selectedRoom && newBooking.packageType
    ? selectedRoom.price[
        newBooking.packageType as keyof typeof selectedRoom.price
      ]
    : 0;

  return (
    <div className="max-w-2xl">
      {bookingSuccess && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm rounded-lg mb-5">
          <CheckCircle2 size={15} /> {bookingSuccess}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Guest */}
        <div className={`rounded-xl border p-5 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <p className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Guest Information</p>
          <div className="space-y-4">
            {[
              { label: 'Full Name',    key: 'guestName',  type: 'text',  placeholder: 'John Doe',             required: true },
              { label: 'Email',        key: 'guestEmail', type: 'email', placeholder: 'guest@example.com',    required: true },
              { label: 'Phone',        key: 'guestPhone', type: 'tel',   placeholder: '+254 700 000 000',      required: false },
            ].map(f => (
              <div key={f.key}>
                <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{f.label}</label>
                <input type={f.type} required={f.required} placeholder={f.placeholder}
                  value={(newBooking as Record<string, unknown>)[f.key] as string}
                  onChange={e => setNewBooking(p => ({ ...p, [f.key]: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Stay */}
        <div className={`rounded-xl border p-5 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <p className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Stay Details</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Check-in</label>
              <input type="date" required min={today} value={newBooking.checkIn}
                onChange={e => setNewBooking(p => ({ ...p, checkIn: e.target.value }))}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
            </div>
            <div>
              <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Check-out</label>
              <input type="date" required min={newBooking.checkIn || today} value={newBooking.checkOut}
                onChange={e => setNewBooking(p => ({ ...p, checkOut: e.target.value }))}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[
              { label: 'Adults',   key: 'adults',   min: 1, max: 6 },
              { label: 'Children', key: 'children', min: 0, max: 5 },
            ].map(f => (
              <div key={f.key}>
                <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{f.label}</label>
                <div className="flex items-center gap-3">
                  <button type="button"
                    onClick={() => setNewBooking(p => ({ ...p, [f.key]: Math.max(f.min, (p as Record<string, number>)[f.key] - 1) }))}
                    className="w-8 h-8 rounded-lg border border-amber-400 text-amber-600 hover:bg-amber-50 flex items-center justify-center font-bold cursor-none text-lg">−</button>
                  <span className={`w-6 text-center font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{(newBooking as Record<string, number>)[f.key]}</span>
                  <button type="button"
                    onClick={() => setNewBooking(p => ({ ...p, [f.key]: Math.min(f.max, (p as Record<string, number>)[f.key] + 1) }))}
                    className="w-8 h-8 rounded-lg border border-amber-400 text-amber-600 hover:bg-amber-50 flex items-center justify-center font-bold cursor-none text-lg">+</button>
                </div>
              </div>
            ))}
          </div>
          <div>

            <div className="mt-4">
  <label
    className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${
      darkMode ? 'text-slate-500' : 'text-slate-400'
    }`}
  >
    Package
  </label>

  <select
    value={newBooking.packageType}
    onChange={(e) =>
      setNewBooking((p) => ({
        ...p,
        packageType: e.target.value,
      }))
    }
    className={`w-full px-3 py-2.5 rounded-lg border text-sm ${
      darkMode
        ? 'bg-slate-800 border-slate-700 text-slate-200'
        : 'bg-slate-50 border-slate-200 text-slate-800'
    }`}
  >
    <option value="BO">
      Bed Only
    </option>

    <option value="BB">
      Bed & Breakfast
    </option>

    <option value="HB">
      Half Board
    </option>

    <option value="FB">
      Full Board
    </option>

    <option value="DAY_REST">
      Day Rest
    </option>
  </select>
</div>
            <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Room</label>
            <select required value={newBooking.roomId} onChange={e => setNewBooking(p => ({ ...p, roomId: e.target.value }))}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm cursor-none focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
              <option value="">Select a room</option>
              {rooms.map((room) => (
  <option key={room.id} value={room.id}>
    {room.name}
  </option>
))}
            </select>
          </div>
        </div>

        {/* Payment */}
        <div className={`rounded-xl border p-5 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <p className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Payment</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>M-Pesa Number</label>
              <input type="tel" value={newBooking.mpesaNumber} onChange={e => setNewBooking(p => ({ ...p, mpesaNumber: e.target.value }))} placeholder="0712 345 678"
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
            </div>
            <div>
              <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Payment Status</label>
              <select value={newBooking.paymentStatus} onChange={e => setNewBooking(p => ({ ...p, paymentStatus: e.target.value }))}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm cursor-none focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          {newBooking.roomId && newBooking.checkIn && newBooking.checkOut && newBooking.checkIn < newBooking.checkOut && (
            <div className={`rounded-lg p-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-900'}`}>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">
                  {selectedRoom?.name} · {nightsBetween(newBooking.checkIn, newBooking.checkOut)} nights
                </span>
                <span className="font-bold text-amber-400 text-lg">
                  KES {(nightsBetween(newBooking.checkIn, newBooking.checkOut) * pricePerNight).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {bookingError && <p className="text-red-500 text-sm">{bookingError}</p>}
        <button type="submit" disabled={savingBooking}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors cursor-none disabled:opacity-50 flex items-center justify-center gap-2">
          {savingBooking
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating…</>
            : <><Plus size={15} />Create Booking</>}
        </button>
      </form>
    </div>
  );
}