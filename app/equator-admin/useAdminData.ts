'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  BookingWithRelations, Room, Review, ActivityLog,
} from '../types';
import { generateRef, nightsBetween } from '../constants';

export default function useAdminData(adminUser?: { id: string; email: string }) {
  const [tab, setTab] = useState('dashboard' as const);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [confirmFilter, setConfirmFilter] = useState('all');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerBooking, setDrawerBooking] = useState<BookingWithRelations | null>(null);

  const [notifOpen, setNotifOpen] = useState(false);

  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [housekeepingStatus, setHousekeepingStatus] = useState<Record<string, 'clean' | 'cleaning' | 'maintenance'>>({});

  // New booking form
  const [newBooking, setNewBooking] = useState({
    guestName: '', guestEmail: '', guestPhone: '',
    checkIn: '', checkOut: '', adults: 1, children: 0,
    roomId: '', paymentMethod: 'mpesa', mpesaNumber: '', paymentStatus: 'paid',
  });
  const [savingBooking, setSavingBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  // New review form
  const [newReview, setNewReview] = useState({ bookingId: '', guestName: '', guestEmail: '', rating: 5, comment: '' });
  const [savingReview, setSavingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Settings
  const [settings, setSettings] = useState({
    taxRate: '16', checkinTime: '14:00', checkoutTime: '11:00',
    currency: 'USD', depositPercent: '30', cancellationPolicy: '48-hour notice required for full refund.',
  });

  // Room modals
  const [roomFormOpen, setRoomFormOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [roomSearch, setRoomSearch] = useState('');
  const [roomCategoryFilter, setRoomCategoryFilter] = useState('all');
  const [roomStatusFilter, setRoomStatusFilter] = useState('all');
  const [roomSort, setRoomSort] = useState('name-asc');
  const [viewRoomOpen, setViewRoomOpen] = useState(false);
  const [viewRoom, setViewRoom] = useState<Room | null>(null);
  const [roomBookingsOpen, setRoomBookingsOpen] = useState(false);
  const [roomBookingsRoom, setRoomBookingsRoom] = useState<Room | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteRoom, setDeleteRoom] = useState<Room | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const addLog = useCallback((message: string, type: ActivityLog['type'] = 'system') => {
    setActivityLog(prev => [{
      id: Math.random().toString(36).substring(2),
      time: new Date().toISOString(),
      message,
      type,
    }, ...prev].slice(0, 50));
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [bookingsRes, roomsRes, reviewsRes] = await Promise.all([
      supabase.from('bookings').select('*, rooms(*), profiles(*)').order('created_at', { ascending: false }),
      supabase.from('rooms').select('*').order('room_number'),
      supabase.from('reviews').select('*').order('created_at', { ascending: false }),
    ]);

    if (bookingsRes.data) {
      setBookings(bookingsRes.data.map((b: any) => ({
        ...b,
        rooms: b.rooms ? {
          ...b.rooms,
          amenities: typeof b.rooms.amenities === 'string' ? JSON.parse(b.rooms.amenities) : b.rooms.amenities,
          images: typeof b.rooms.images === 'string' ? JSON.parse(b.rooms.images) : b.rooms.images,
          price: typeof b.rooms.price === 'string' ? JSON.parse(b.rooms.price) : b.rooms.price,
        } : undefined,
      })));
    }
    if (roomsRes.data) {
      setRooms(roomsRes.data.map((r: any) => ({
        ...r,
        amenities: typeof r.amenities === 'string' ? JSON.parse(r.amenities) : r.amenities,
        images: typeof r.images === 'string' ? JSON.parse(r.images) : r.images,
        price: typeof r.price === 'string' ? JSON.parse(r.price) : r.price,
      })));
      const hs: Record<string, 'clean' | 'cleaning' | 'maintenance'> = {};
      roomsRes.data.forEach((r: any) => { hs[r.id] = 'clean'; });
      setHousekeepingStatus(hs);
    }
    if (reviewsRes.data) setReviews(reviewsRes.data as Review[]);
    addLog('Dashboard data refreshed', 'system');
    setLoading(false);
  }, [addLog]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Derived stats ────────────────────────────────────────────────────────────
  const todayStr = new Date().toISOString().split('T')[0];
  const todayArrivals = bookings.filter(b => b.check_in === todayStr).length;
  const todayDepartures = bookings.filter(b => b.check_out === todayStr).length;
  const occupiedRooms = bookings.filter(b => {
    const cs = b.confirmation_status || 'pending';
    return cs === 'confirmed' || cs === 'checked_in';
  }).length;
  const totalRooms = rooms.length || 21;
  const pendingConfirmations = bookings.filter(b => !b.confirmation_status || b.confirmation_status === 'pending').length;
  const expectedRevenue = bookings
    .filter(b => b.check_in === todayStr || b.payment_status === 'paid')
    .reduce((s, b) => s + (b.total_amount || 0), 0);
  const totalRevenue = bookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + (b.total_amount || 0), 0);

  // ── Guests ─────────────────────────────────────────────────────────────────
  const guestMap: Record<string, { name: string; email: string; bookings: BookingWithRelations[]; spend: number }> = {};
  bookings.forEach(b => {
    const key = b.guest_email || b.guest_name;
    if (!guestMap[key]) guestMap[key] = { name: b.guest_name, email: b.guest_email || '', bookings: [], spend: 0 };
    guestMap[key].bookings.push(b);
    guestMap[key].spend += b.total_amount || 0;
  });
  const guests = Object.values(guestMap).sort((a, b) => b.spend - a.spend);

  // ── Filtered bookings ────────────────────────────────────────────────────────
  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q || (
      b.guest_name?.toLowerCase().includes(q) ||
      b.guest_email?.toLowerCase().includes(q) ||
      b.booking_reference?.toLowerCase().includes(q) ||
      b.rooms?.name?.toLowerCase().includes(q)
    );
    const matchPayment = paymentFilter === 'all' || b.payment_status === paymentFilter;
    const matchConfirm = confirmFilter === 'all' || (b.confirmation_status || 'pending') === confirmFilter;
    return matchSearch && matchPayment && matchConfirm;
  });

  // ── Monthly revenue data ────────────────────────────────────────────────────
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleString('default', { month: 'short' });
    const value = bookings
      .filter(b => {
        const bd = new Date(b.created_at);
        return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear() && b.payment_status === 'paid';
      })
      .reduce((s, b) => s + (b.total_amount || 0), 0);
    return { label, value };
  });

  // ── Room popularity ──────────────────────────────────────────────────────────
  const roomPopularity = rooms.map(r => ({
    name: r.name, count: bookings.filter(b => b.room_id === r.id).length,
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  // ── Notifications ────────────────────────────────────────────────────────────
  const notifications = [
    ...bookings.filter(b => !b.confirmation_status || b.confirmation_status === 'pending').slice(0, 3).map(b => ({
      id: b.id, msg: `New booking from ${b.guest_name}`, type: 'booking' as const,
    })),
    ...bookings.filter(b => b.payment_status === 'pending').slice(0, 2).map(b => ({
      id: b.id + '_pay', msg: `Payment pending for ${b.booking_reference}`, type: 'payment' as const,
    })),
  ];

  // ── Actions ──────────────────────────────────────────────────────────────────
  const updateConfirmation = async (bookingId: string, status: string) => {
    await supabase.from('bookings').update({ confirmation_status: status }).eq('id', bookingId);
    addLog(`Booking ${bookings.find(b => b.id === bookingId)?.booking_reference} → ${status}`, 'booking');
    loadData();
    if (drawerBooking?.id === bookingId) setDrawerBooking(prev => prev ? { ...prev, confirmation_status: status } : null);
  };

  const handleNewBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.roomId) { setBookingError('Please select a room'); return; }
    if (!newBooking.checkIn || !newBooking.checkOut) { setBookingError('Please select dates'); return; }
    if (newBooking.checkIn >= newBooking.checkOut) { setBookingError('Check-out must be after check-in'); return; }
    setSavingBooking(true); setBookingError(''); setBookingSuccess('');
    try {
      const room = rooms.find(r => r.id === newBooking.roomId);
      if (!room) throw new Error('Room not found');
      const priceKeys = Object.keys(room.price);
      const basePrice = priceKeys.length > 0 ? room.price[priceKeys[0]] : 0;
      const nights = nightsBetween(newBooking.checkIn, newBooking.checkOut);
      const total = nights * basePrice;
      const ref = generateRef();
      const { error } = await supabase.from('bookings').insert({
        user_id: adminUser?.id,
        room_id: newBooking.roomId,
        check_in: newBooking.checkIn,
        check_out: newBooking.checkOut,
        adults: newBooking.adults,
        children: newBooking.children,
        guest_name: newBooking.guestName,
        guest_email: newBooking.guestEmail,
        guest_phone: newBooking.guestPhone,
        payment_method: newBooking.paymentMethod,
        mpesa_number: newBooking.mpesaNumber,
        payment_status: newBooking.paymentStatus,
        total_amount: total,
        booking_reference: ref,
        confirmation_status: 'confirmed',
        notes: 'Booked by admin',
      });
      if (error) throw error;
      setBookingSuccess(`Booking confirmed! Ref: ${ref}`);
      addLog(`Admin created booking ${ref} for ${newBooking.guestName}`, 'booking');
      setNewBooking({ guestName: '', guestEmail: '', guestPhone: '', checkIn: '', checkOut: '', adults: 1, children: 0, roomId: '', paymentMethod: 'mpesa', mpesaNumber: '', paymentStatus: 'paid' });
      loadData();
    } catch (err: unknown) {
      setBookingError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally { setSavingBooking(false); }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.guestName.trim()) { setReviewError('Guest name is required'); return; }
    setSavingReview(true); setReviewError('');
    try {
      const { error } = await supabase.from('reviews').insert({
        booking_id: newReview.bookingId || null,
        guest_name: newReview.guestName,
        guest_email: newReview.guestEmail || null,
        rating: newReview.rating,
        comment: newReview.comment || null,
        is_published: false,
      });
      if (error) throw error;
      addLog(`Review added for ${newReview.guestName}`, 'review');
      setNewReview({ bookingId: '', guestName: '', guestEmail: '', rating: 5, comment: '' });
      loadData();
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : 'Failed to add review');
    } finally { setSavingReview(false); }
  };

  const toggleReviewPublished = async (reviewId: string, current: boolean) => {
    await supabase.from('reviews').update({ is_published: !current }).eq('id', reviewId);
    addLog(`Review ${current ? 'unpublished' : 'published'}`, 'review');
    loadData();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const openDrawer = (booking: BookingWithRelations) => {
    setDrawerBooking(booking);
    setDrawerOpen(true);
  };

  // ── Filtered rooms ───────────────────────────────────────────────────────────
  const filteredRooms = [...rooms]
    .filter(room => {
      const matchesSearch =
        roomSearch === '' ||
        room.name.toLowerCase().includes(roomSearch.toLowerCase()) ||
        room.category.toLowerCase().includes(roomSearch.toLowerCase()) ||
        room.amenities.some(a => a.toLowerCase().includes(roomSearch.toLowerCase()));

      const matchesCategory =
        roomCategoryFilter === 'all' ||
        room.category === roomCategoryFilter;

      const roomStatus = room.status ?? 'available';

      const matchesStatus =
        roomStatusFilter === 'all' ||
        roomStatus === roomStatusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (roomSort) {
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price-low': {
          const aKeys = Object.keys(a.price);
          const bKeys = Object.keys(b.price);
          const aMin = aKeys.length ? Math.min(...aKeys.map(k => a.price[k])) : 0;
          const bMin = bKeys.length ? Math.min(...bKeys.map(k => b.price[k])) : 0;
          return aMin - bMin;
        }
        case 'price-high': {
          const aKeys = Object.keys(a.price);
          const bKeys = Object.keys(b.price);
          const aMin = aKeys.length ? Math.min(...aKeys.map(k => a.price[k])) : 0;
          const bMin = bKeys.length ? Math.min(...bKeys.map(k => b.price[k])) : 0;
          return bMin - aMin;
        }
        case 'category': return a.category.localeCompare(b.category);
        default: return a.name.localeCompare(b.name);
      }
    });

  return {
    // State
    tab, setTab,
    darkMode, setDarkMode,
    sidebarCollapsed, setSidebarCollapsed,
    bookings, rooms, reviews,
    loading,
    search, setSearch,
    paymentFilter, setPaymentFilter,
    confirmFilter, setConfirmFilter,
    drawerOpen, setDrawerOpen,
    drawerBooking, setDrawerBooking,
    notifOpen, setNotifOpen,
    activityLog, setActivityLog,
    housekeepingStatus, setHousekeepingStatus,
    newBooking, setNewBooking,
    savingBooking, setSavingBooking,
    bookingError, setBookingError,
    bookingSuccess, setBookingSuccess,
    newReview, setNewReview,
    savingReview, setSavingReview,
    reviewError, setReviewError,
    settings, setSettings,
    roomFormOpen, setRoomFormOpen,
    editRoom, setEditRoom,
    roomSearch, setRoomSearch,
    roomCategoryFilter, setRoomCategoryFilter,
    roomStatusFilter, setRoomStatusFilter,
    roomSort, setRoomSort,
    viewRoomOpen, setViewRoomOpen,
    viewRoom, setViewRoom,
    roomBookingsOpen, setRoomBookingsOpen,
    roomBookingsRoom, setRoomBookingsRoom,
    deleteConfirmOpen, setDeleteConfirmOpen,
    deleteRoom, setDeleteRoom,
    today,

    // Derived
    todayStr, todayArrivals, todayDepartures, occupiedRooms, totalRooms,
    pendingConfirmations, expectedRevenue, totalRevenue,
    guests, filtered, monthlyData, roomPopularity, notifications,
    filteredRooms,

    // Actions
    addLog, loadData,
    updateConfirmation, handleNewBooking, handleAddReview,
    toggleReviewPublished, handleSignOut, openDrawer,
  };
}