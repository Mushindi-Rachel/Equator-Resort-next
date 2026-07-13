'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

import {Drawer} from './components/Drawer';
import Sidebar from './components/sidebar';
import TopBar from './components/topbar';

import {DashboardTab} from './tabs/DashboardTab';
import {BookingsTab} from './tabs/BookingsTab';
import {NewBookingTab} from './tabs/NewBookingTab';
import {RoomsTab} from './tabs/RoomsTab';
import {GuestsTab} from './tabs/GuestsTab';
import {PaymentsTab} from './tabs/PaymentTab';
import {ReviewsTab} from './tabs/ReviewsTab';
import {HousekeepingTab} from './tabs/HousekeepingTab';
import {AnalyticsTab} from './tabs/AnalyticsTab';
import {ReportsTab} from './tabs/ReportsTab';
import {ActivityTab} from './tabs/ActivityTab';
import {SettingsTab }from './tabs/SettingsTab';

import type { Booking, Profile } from '@/lib/supabase';
import type {
  SidebarTab,
  Room,
  Review,
  ActivityLog,
} from './types';

interface AdminDashboardProps {
  onClose: () => void;
  adminUser?: {
    id: string;
    email: string;
  };
}

export default function AdminDashboard({
  onClose,
  adminUser,
}: AdminDashboardProps) {

  const [tab, setTab] = useState<SidebarTab>('dashboard');

  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [loading, setLoading] = useState(true);

  const [bookings, setBookings] = useState<
    (Booking & {
      rooms?: Room;
      profiles?: Profile;
      confirmation_status?: string;
    })[]
  >([]);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerBooking, setDrawerBooking] =
    useState<(typeof bookings)[0] | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const [
      bookingsRes,
      roomsRes,
      reviewsRes,
      activityRes,
    ] = await Promise.all([
      supabase
        .from('bookings')
        .select('*, rooms(*), profiles(*)'),

      supabase
        .from('rooms')
        .select('*'),

      supabase
        .from('reviews')
        .select('*'),

      supabase
        .from('activity_logs')
        .select('*'),
    ]);

    if (bookingsRes.data) setBookings(bookingsRes.data);
    if (roomsRes.data) setRooms(roomsRes.data);
    if (reviewsRes.data) setReviews(reviewsRes.data);
    if (activityRes.data) setActivityLog(activityRes.data);

    setLoading(false);
  }

  return (
    <div
      className={`fixed inset-0 flex overflow-hidden ${
        darkMode
          ? 'bg-slate-950'
          : 'bg-slate-50'
      }`}
    >
      <Sidebar
        tab={tab}
        setTab={setTab}
        darkMode={darkMode}
        collapsed={sidebarCollapsed}
      />

      <div className="flex flex-col flex-1 overflow-hidden">

        <TopBar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          adminUser={adminUser}
          bookings={bookings}
          rooms={rooms}
          onRefresh={loadData}
          onClose={onClose}
        />

        <main className="flex-1 overflow-y-auto p-6">

          {tab === 'dashboard' && (
            <DashboardTab
              bookings={bookings}
              rooms={rooms}
              loading={loading}
            />
          )}

          {tab === 'bookings' && (
            <BookingsTab
              bookings={bookings}
              openDrawer={(booking) => {
                setDrawerBooking(booking);
                setDrawerOpen(true);
              }}
            />
          )}

          {tab === 'new-booking' && (
            <NewBookingTab
              rooms={rooms}
              onSuccess={loadData}
            />
          )}

          {tab === 'rooms' && (
            <RoomsTab
              rooms={rooms}
              refresh={loadData}
            />
          )}

          {tab === 'guests' && (
            <GuestsTab bookings={bookings} />
          )}

          {tab === 'payments' && (
            <PaymentsTab bookings={bookings} />
          )}

          {tab === 'reviews' && (
            <ReviewsTab
              reviews={reviews}
              refresh={loadData}
            />
          )}

          {tab === 'housekeeping' && (
            <HousekeepingTab
              rooms={rooms}
              refresh={loadData}
            />
          )}

          {tab === 'analytics' && (
            <AnalyticsTab
              bookings={bookings}
              rooms={rooms}
            />
          )}

          {tab === 'reports' && (
            <ReportsTab
              bookings={bookings}
            />
          )}

          {tab === 'activity' && (
            <ActivityTab
              logs={activityLog}
            />
          )}

          {tab === 'settings' && (
            <SettingsTab />
          )}

        </main>
      </div>

      <Drawer
        open={drawerOpen}
        booking={drawerBooking}
        onClose={() => setDrawerOpen(false)}
        refresh={loadData}
      />
    </div>
  );
}