'use client';
import { DoorOpen, DoorClosed, BedDouble, Home, CreditCard, Clock } from 'lucide-react';
import KPICard from '../components/KPICard';
import MiniBarChart from '../components/MiniBarChart';
import type { BookingWithRelations, Room } from '../types';
import { statusColor } from '../constants';

export default function DashboardTab({
  todayArrivals, todayDepartures, occupiedRooms, totalRooms,
  pendingConfirmations, expectedRevenue, totalRevenue,
  monthlyData, roomPopularity, bookings, darkMode, openDrawer,
  setTab,
}: {
  todayArrivals: number;
  todayDepartures: number;
  occupiedRooms: number;
  totalRooms: number;
  pendingConfirmations: number;
  expectedRevenue: number;
  totalRevenue: number;
  monthlyData: { label: string; value: number }[];
  roomPopularity: { name: string; count: number }[];
  bookings: BookingWithRelations[];
  darkMode: boolean;
  openDrawer: (b: BookingWithRelations) => void;
  setTab: (t: any) => void;
}) {
  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard label="Today's Arrivals" value={todayArrivals} sub={`${todayArrivals} guests`} icon={DoorOpen} color="bg-blue-500" trend="up" />
        <KPICard label="Today's Departures" value={todayDepartures} sub={`${todayDepartures} guests`} icon={DoorClosed} color="bg-slate-500" trend="neutral" />
        <KPICard label="Rooms Occupied" value={`${Math.min(occupiedRooms, totalRooms)} / ${totalRooms}`} sub={`${Math.round((Math.min(occupiedRooms, totalRooms) / totalRooms) * 100)}% occupancy`} icon={BedDouble} color="bg-purple-500" trend="up" />
        <KPICard label="Available Rooms" value={Math.max(0, totalRooms - occupiedRooms)} sub="ready for booking" icon={Home} color="bg-emerald-500" trend="neutral" />
        <KPICard label="Expected Revenue" value={`$${expectedRevenue.toLocaleString()}`} sub="paid bookings" icon={CreditCard} color="bg-amber-500" trend="up" />
        <KPICard label="Pending" value={pendingConfirmations} sub="need confirmation" icon={Clock} color="bg-red-500" trend="down" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`rounded-xl border p-5 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <p className={`text-xs font-semibold tracking-wider uppercase mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Monthly Revenue</p>
          <MiniBarChart data={monthlyData} color="#d97706" />
          <p className={`text-xs mt-3 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Total: <strong className={darkMode ? 'text-slate-200' : 'text-slate-800'}>${totalRevenue.toLocaleString()}</strong></p>
        </div>

        <div className={`rounded-xl border p-5 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <p className={`text-xs font-semibold tracking-wider uppercase mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Room Popularity</p>
          {roomPopularity.length === 0 ? (
            <p className="text-slate-400 text-xs">No data yet</p>
          ) : roomPopularity.map((r, i) => {
            const max = roomPopularity[0].count || 1;
            return (
              <div key={i} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{r.name}</span>
                  <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>{r.count} bookings</span>
                </div>
                <div className={`h-1.5 rounded-full ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${(r.count / max) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent bookings */}
      <div className={`rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <p className={`text-xs font-semibold tracking-wider uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Recent Bookings</p>
          <button onClick={() => setTab('bookings')} className="text-xs text-amber-600 hover:text-amber-700 cursor-none">View all →</button>
        </div>
        {bookings.slice(0, 5).map(b => (
          <div key={b.id} onClick={() => openDrawer(b)} className={`flex items-center justify-between px-5 py-3 border-b last:border-0 cursor-none transition-colors ${darkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-50 hover:bg-slate-50'}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-amber-700 text-xs font-bold">{b.guest_name?.charAt(0)}</span>
              </div>
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{b.guest_name}</p>
                <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{b.booking_reference} · {b.rooms?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(b.payment_status)}`}>{b.payment_status}</span>
              <span className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>${b.total_amount?.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}