'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';
import { useAdminData } from './hooks/useAdminData';

import Sidebar from './components/sidebar';
import TopBar from './components/topbar';
import { BookingDrawer } from './components/BookingDrawer';
import { Drawer } from './components/drawer';
import RoomFormModal from './components/RoomFormModal';
import ReportDrawer from './components/ReportDrawer';

import { DashboardTab } from './tabs/DashboardTab';
import { BookingsTab } from './tabs/BookingsTab';
import { NewBookingTab } from './tabs/NewBookingTab';
import { RoomsTab } from './tabs/RoomsTab';
import { GuestsTab } from './tabs/GuestsTab';
import { PaymentsTab } from './tabs/PaymentTab';
import { ReviewsTab } from './tabs/ReviewsTab';
import { HousekeepingTab } from './tabs/HousekeepingTab';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { ReportsTab } from './tabs/ReportsTab';
import { ActivityTab } from './tabs/ActivityTab';
import { SettingsTab } from './tabs/SettingsTab';
import { ConferenceBookingsTab } from './tabs/ConferenceBookingsTab';

import type {
  EnrichedBooking,
  Room,
  SidebarTab,
} from './types';

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  // ── Auth (middleware.ts already verified this server-side; this is just
  // for reading the current user's info in the UI and handling sign-out) ──
  const router = useRouter();
  const { user, isAdmin, signOut } = useAuth();
  const adminUser = user ? { id: user.id, email: user.email ?? '' } : undefined;

  const onClose = async () => {
    await signOut();
    router.push('/equator-admin/login');
    router.refresh();
  };

  // ── Shell / chrome state ──────────────────────────────────────────────
  const [tab, setTab] = useState<SidebarTab>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // ── Data + mutations (Supabase-backed) ────────────────────────────────
  const {
    todayArrivals,
    todayDepartures,
    totalRooms,
    occupiedRooms,
    availableRooms,
    bookings,
    rooms,
    reviews,
    loading,
    activityLog,
    categories,
    addRoom,
    updateRoom,
    deleteRoom,
    newBooking,
    setNewBooking,
    savingBooking,
    bookingError,
    bookingSuccess,
    handleNewBooking,
    newReview,
    setNewReview,
    savingReview,
    reviewError,
    handleAddReview,
    updateHousekeeping,
    toggleReviewPublished,
    settings,
    setSettings,
    addLog,
    updateConfirmation,
  } = useAdminData(adminUser);

  // ── Booking drawer ─────────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerBooking, setDrawerBooking] = useState<EnrichedBooking | null>(null);

  const openDrawer = (booking: EnrichedBooking) => {
    setDrawerBooking(booking);
    setDrawerOpen(true);
  };

  // ── Bookings tab filters ───────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [confirmFilter, setConfirmFilter] = useState('all');
const filtered = useMemo(() => {
  const q = search.trim().toLowerCase();

  return bookings.filter((b) => {
    const matchesSearch =
      !q ||
      b.guest_name?.toLowerCase().includes(q) ||
      b.guest_email?.toLowerCase().includes(q) ||
      b.booking_reference?.toLowerCase().includes(q) ||
      b.rooms?.name?.toLowerCase().includes(q) ||
      b.rooms?.room_number?.toString().includes(q);

    const matchesPayment =
      paymentFilter === "all" ||
      b.payment_status === paymentFilter;

    const matchesConfirm =
      confirmFilter === "all" ||
      b.booking_status === confirmFilter ||
      b.confirmation_status === confirmFilter;

    return matchesSearch && matchesPayment && matchesConfirm;
  });
}, [bookings, search, paymentFilter, confirmFilter]);

  // ── Rooms tab filters ───────────────────────────────────────────────────
  const [roomSearch, setRoomSearch] = useState('');
  const [roomCategoryFilter, setRoomCategoryFilter] = useState('all');
  const [roomStatusFilter, setRoomStatusFilter] = useState('all');
  const [roomSort, setRoomSort] = useState('name-asc');

  const filteredRooms = useMemo(() => {
    const q = roomSearch.trim().toLowerCase();
    const list = rooms.filter((r) => {
      const matchesSearch =
        !q ||
        r.name?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        (r.amenities || []).some((a) => a.toLowerCase().includes(q));
      const matchesCategory = roomCategoryFilter === 'all' || r.category === roomCategoryFilter;
      const matchesStatus = roomStatusFilter === 'all' || r.status === roomStatusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });

    const minPrice = (r: Room) => Math.min(...Object.values(r.price).map(Number));

    return [...list].sort((a, b) => {
      switch (roomSort) {
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price-low': return minPrice(a) - minPrice(b);
        case 'price-high': return minPrice(b) - minPrice(a);
        case 'category': return (a.category || '').localeCompare(b.category || '');
        default: return a.name.localeCompare(b.name);
      }
    });
  }, [rooms, roomSearch, roomCategoryFilter, roomStatusFilter, roomSort]);

  // ── Room view drawer + add/edit modal ───────────────────────────────────
  const [viewRoom, setViewRoom] = useState<Room | null>(null);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);

  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [savingRoom, setSavingRoom] = useState(false);

  const handleSaveRoom = async (data: {
    room_number: string;
    room_name: string;
    category_id: string;
    status: string;
    rating: number;
    featured: boolean;
  }) => {
    setSavingRoom(true);
    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, data);
        addLog(`Room ${data.room_number} updated`, 'room');
      } else {
        await addRoom(data);
        addLog(`Room ${data.room_number} added`, 'room');
      }
      setRoomModalOpen(false);
      setEditingRoom(null);
    } finally {
      setSavingRoom(false);
    }
  };

  const handleDeleteRoom = async (room: Room) => {
    if (!window.confirm(`Delete room ${room.name}? This cannot be undone.`)) return;
    await deleteRoom(room.id);
    addLog(`Room ${room.name} deleted`, 'room');
  };

  // ── Derived KPIs ─────────────────────────────────────────────────────────
  const pendingConfirmations = bookings.filter(
    (b) => !b.booking_status || b.booking_status === 'pending'
  ).length;

  const totalRevenue = bookings
    .filter((b) => b.payment_status === 'paid')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);

  const expectedRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = MONTH_LABELS[d.getMonth()];
      const value = bookings
        .filter((b) => {
          if (!b.created_at || b.payment_status !== 'paid') return false;
          const bd = new Date(b.created_at);
          return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth();
        })
        .reduce((sum, b) => sum + (b.total_amount || 0), 0);
      months.push({ label, value });
    }
    return months;
  }, [bookings]);

  const roomPopularity = useMemo(() => {
    const counts = new Map<string, number>();
    bookings.forEach((b) => {
      const name = b.rooms?.name;
      if (!name) return;
      counts.set(name, (counts.get(name) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [bookings]);

  const guests = useMemo(() => {
    const map = new Map<
      string,
      { name: string; email: string; bookings: EnrichedBooking[]; spend: number }
    >();
    bookings.forEach((b) => {
      const key = b.guest_email || b.guest_name || 'unknown';
      if (!map.has(key)) {
        map.set(key, { name: b.guest_name || 'Guest', email: b.guest_email || '', bookings: [], spend: 0 });
      }
      const g = map.get(key)!;
      g.bookings.push(b);
      if (b.payment_status === 'paid') g.spend += b.total_amount || 0;
    });
    return Array.from(map.values()).sort((a, b) => b.spend - a.spend);
  }, [bookings]);

  // ── Notifications ────────────────────────────────────────────────────────
  const notifications = useMemo(() => {
    const items: { id: string; msg: string; type: 'booking' | 'payment' }[] = [];
    bookings
      .filter((b) => !b.booking_status || b.booking_status === 'pending')
      .forEach((b) =>
        items.push({
          id: `pending-${b.id}`,
          msg: `${b.guest_name || 'A guest'} is awaiting confirmation`,
          type: 'booking',
        })
      );
    bookings
      .filter((b) => b.payment_status === 'pending')
      .forEach((b) =>
        items.push({
          id: `payment-${b.id}`,
          msg: `Payment pending for ${b.guest_name || 'a guest'}`,
          type: 'payment',
        })
      );
    return items.slice(0, 10);
  }, [bookings]);

const [reportOpen, setReportOpen] = useState(false);
const [reportDrawerOpen, setReportDrawerOpen] = useState(false);
const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // useAuth resolves the session asynchronously on mount. middleware.ts has
  // already verified admin access server-side by the time this component
  // renders at all, so this is just to avoid a flash of stale/empty data
  // while the client-side session check catches up.
  if (!user || !isAdmin) {


  return (
    <div className={`fixed inset-0 flex overflow-hidden cursor-pointer ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Sidebar tab={tab} setTab={setTab} darkMode={darkMode} collapsed={sidebarCollapsed} />

      <div className={`fixed inset-0 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>

  <TopBar
    adminUser={adminUser}
    darkMode={darkMode}
    setDarkMode={setDarkMode}
    sidebarCollapsed={sidebarCollapsed}
    setSidebarCollapsed={setSidebarCollapsed}
    onClose={onClose}
    notifications={notifications}
    notifOpen={notifOpen}
    setNotifOpen={setNotifOpen}
  />

  <div className="flex h-[calc(100%-72px)]">

    <Sidebar
      tab={tab}
      setTab={setTab}
      darkMode={darkMode}
      collapsed={sidebarCollapsed}
    />

        <main className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className={`mb-4 text-xs font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Loading latest data…
            </div>
          )}

          {tab === 'dashboard' && (
            <DashboardTab
              darkMode={darkMode}
              bookings={bookings}
              rooms={rooms}
              todayArrivals={todayArrivals}
              todayDepartures={todayDepartures}
              occupiedRooms={occupiedRooms}
              availableRooms={availableRooms}
              totalRooms={totalRooms}
              pendingConfirmations={pendingConfirmations}
              expectedRevenue={expectedRevenue}
              totalRevenue={totalRevenue}
              monthlyData={monthlyData}
              roomPopularity={roomPopularity}
              onViewAll={() => setTab('bookings')}
              onOpenDrawer={openDrawer}
            />
          )}

          {tab === 'bookings' && (
            <BookingsTab
              darkMode={darkMode}
              bookings={bookings}
              filtered={filtered}
              search={search}
              setSearch={setSearch}
              paymentFilter={paymentFilter}
              setPaymentFilter={setPaymentFilter}
              confirmFilter={confirmFilter}
              setConfirmFilter={setConfirmFilter}
              onOpenDrawer={openDrawer}
              onUpdateConfirmation={(id, status) =>
                updateConfirmation(id, status, drawerBooking, setDrawerBooking)
              }
            />
          )}

          {tab === 'new-booking' && (
            <NewBookingTab
                darkMode={darkMode}
                rooms={rooms}
                categories={categories}
                newBooking={newBooking}
                setNewBooking={setNewBooking}
                savingBooking={savingBooking}
                bookingError={bookingError}
                bookingSuccess={bookingSuccess}
                onSubmit={handleNewBooking}
              />
          )}
          {tab === 'conference-bookings' && (
              <ConferenceBookingsTab
                darkMode={darkMode}
              />
            )}

          {tab === 'rooms' && (
            <RoomsTab
              darkMode={darkMode}
              rooms={rooms}
              bookings={bookings}
              roomSearch={roomSearch}
              setRoomSearch={setRoomSearch}
              roomCategoryFilter={roomCategoryFilter}
              setRoomCategoryFilter={setRoomCategoryFilter}
              roomStatusFilter={roomStatusFilter}
              setRoomStatusFilter={setRoomStatusFilter}
              roomSort={roomSort}
              setRoomSort={setRoomSort}
              filteredRooms={filteredRooms}
              onView={(room) => { setViewRoom(room); setViewDrawerOpen(true); }}
              onBookings={(room) => { setSearch(room.name); setTab('bookings'); }}
              onEdit={(room) => { setEditingRoom(room); setRoomModalOpen(true); }}
              onDelete={handleDeleteRoom}
              onAddRoom={() => { setEditingRoom(null); setRoomModalOpen(true); }}
            />
          )}

          {tab === 'guests' && <GuestsTab darkMode={darkMode} guests={guests} />}

          {tab === 'payments' && (
            <PaymentsTab darkMode={darkMode} bookings={bookings} totalRevenue={totalRevenue} />
          )}

          {tab === 'reviews' && (
            <ReviewsTab
              darkMode={darkMode}
              reviews={reviews}
              bookings={bookings}
              newReview={newReview}
              setNewReview={setNewReview}
              savingReview={savingReview}
              reviewError={reviewError}
              onSubmit={handleAddReview}
              onTogglePublish={toggleReviewPublished}
            />
          )}

          {tab === 'housekeeping' && (
            <HousekeepingTab
                darkMode={darkMode}
                rooms={rooms}
                bookings={bookings}
                onStatusChange={updateHousekeeping}
              />
          )}

          {tab === 'analytics' && (
            <AnalyticsTab
              darkMode={darkMode}
              bookings={bookings}
              rooms={rooms}
              totalRevenue={totalRevenue}
              occupiedRooms={occupiedRooms}
              totalRooms={totalRooms}
              monthlyData={monthlyData}
              roomPopularity={roomPopularity}
            />
          )}

          {tab === 'reports' && (
            <ReportsTab
              darkMode={darkMode}
              bookings={bookings}
              rooms={rooms}
              reviews={reviews}
              totalRevenue={totalRevenue}
              onView={(reportId) => {
      setSelectedReport(reportId);
      setReportDrawerOpen(true);
    }}
            />
          )}



          {tab === 'activity' && <ActivityTab darkMode={darkMode} activityLog={activityLog} />}

          {tab === 'settings' && (
            <SettingsTab
              darkMode={darkMode}
              settings={settings}
              setSettings={setSettings}
              onSave={() => addLog('Settings updated', 'system')}
            />
          )}
        </main>
      </div>
      </div>

      <BookingDrawer
        open={drawerOpen}
        booking={drawerBooking}
        onClose={() => setDrawerOpen(false)}
        onUpdateConfirmation={(id, status) =>
          updateConfirmation(id, status, drawerBooking, setDrawerBooking)
        }
      />

      <Drawer
        open={viewDrawerOpen}
        onClose={() => setViewDrawerOpen(false)}
        title={viewRoom ? viewRoom.name : 'Room Details'}
      >
        {viewRoom && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">Category</p>
                <p className="font-semibold text-slate-800">{viewRoom.category}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">Status</p>
                <p className="font-semibold text-slate-800">{viewRoom.status}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">Room #</p>
                <p className="font-semibold text-slate-800">{viewRoom.room_number}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">Size</p>
                <p className="font-semibold text-slate-800">{viewRoom.size_sqm} m²</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">Adults / Children</p>
                <p className="font-semibold text-slate-800">{viewRoom.max_adults} / {viewRoom.max_children}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">Rating</p>
                <p className="font-semibold text-slate-800">{viewRoom.rating} / 5</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-2">Pricing (KES / night)</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(viewRoom.price).map(([plan, price]) => (
                  <div key={plan} className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{plan}</span>
                    <span className="font-semibold text-slate-800">{price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {viewRoom.amenities?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-2">Amenities</p>
                <div className="flex flex-wrap gap-1.5">
                  {viewRoom.amenities.map((a, i) => (
                    <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-600">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <RoomFormModal
        open={roomModalOpen}
        darkMode={darkMode}
        room={editingRoom}
        categories={categories}
        loading={savingRoom}
        onClose={() => { setRoomModalOpen(false); setEditingRoom(null); }}
        onSave={handleSaveRoom}
      />
    </div>
  );
}}