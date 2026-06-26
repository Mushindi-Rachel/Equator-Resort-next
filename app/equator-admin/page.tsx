'use client'
import { useState, useEffect, useRef } from 'react';
import {
  X, Users, Calendar, CreditCard, CheckCircle2, Clock, Search,
  ChevronDown, LogOut, Plus, RefreshCw, Building2, Baby, Star,
  MessageSquare, ThumbsUp, XCircle, LayoutDashboard, BedDouble,
  BarChart3, FileText, Settings, Bell, ChevronRight, Printer,
  Mail, Eye, Edit2, DoorOpen, DoorClosed, Wrench, Download,
  TrendingUp, Home, UserCircle, Moon, Sun, Activity, Filter,
  Check, AlertCircle, ArrowUpRight, ArrowDownRight, Inbox,
  Sparkles, ClipboardList, Hash, Phone, Trash2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { rooms } from '@/lib/rooms';
import type { Booking, Profile } from '@/lib/supabase';

interface AdminDashboardProps {
  onClose: () => void;
  adminUser?: { id: string; email: string };
}

type SidebarTab =
  | 'dashboard'
  | 'bookings'
  | 'new-booking'
  | 'rooms'
  | 'guests'
  | 'payments'
  | 'reviews'
  | 'analytics'
  | 'reports'
  | 'housekeeping'
  | 'settings'
  | 'activity';

interface Review {
  id: string;
  booking_id: string | null;
  guest_name: string;
  guest_email: string | null;
  rating: number;
  comment: string | null;
  is_published: boolean;
  created_at: string;
}

interface ActivityLog {
  id: string;
  time: string;
  message: string;
  type: 'booking' | 'payment' | 'room' | 'review' | 'system';
}

interface Room {
  id: string;
  name: string;
  category: 'Executive Suite' | 'Deluxe' | 'Standard';
  price: Record<string, number>;
  desc: string;
  images: string[];
  max_guests: number;
  max_adults: number;
  max_children: number;
  size_sqm: number;
  amenities: string[];
  status: 'available' | 'occupied' | 'cleaning' | 'reserved' | 'maintenance';
  rating: number;
  badge: string | null;
  created_at: string;
}

function statusColor(status: string) {
  if (status === 'paid') return 'bg-emerald-100 text-emerald-700';
  if (status === 'pending') return 'bg-amber-100 text-amber-700';
  if (status === 'refunded') return 'bg-blue-100 text-blue-700';
  return 'bg-red-100 text-red-700';
}

function confirmationColor(status: string) {
  if (status === 'confirmed') return 'bg-blue-100 text-blue-700';
  if (status === 'rejected') return 'bg-red-100 text-red-700';
  if (status === 'checked_in') return 'bg-purple-100 text-purple-700';
  if (status === 'checked_out') return 'bg-slate-100 text-slate-700';
  if (status === 'completed') return 'bg-emerald-100 text-emerald-700';
  return 'bg-amber-100 text-amber-700';
}

function generateRef() {
  return 'EPR-' + Math.random().toString(36).toUpperCase().substring(2, 8);
}

function nightsBetween(checkin: string, checkout: string) {
  const a = new Date(checkin).getTime();
  const b = new Date(checkout).getTime();
  return Math.max(1, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const SIDEBAR_ITEMS: { key: SidebarTab; label: string; icon: React.ElementType; section?: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'bookings', label: 'Bookings', icon: Calendar, section: 'Operations' },
  { key: 'new-booking', label: 'New Booking', icon: Plus },
  { key: 'rooms', label: 'Rooms', icon: BedDouble },
  { key: 'guests', label: 'Guests', icon: Users },
  { key: 'payments', label: 'Payments', icon: CreditCard },
  { key: 'reviews', label: 'Reviews', icon: Star },
  { key: 'housekeeping', label: 'Housekeeping', icon: Wrench },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, section: 'Insights' },
  { key: 'reports', label: 'Reports', icon: FileText },
  { key: 'activity', label: 'Activity Log', icon: Activity },
  { key: 'settings', label: 'Settings', icon: Settings, section: 'Admin' },
];

// ─── Drawer Component ──────────────────────────────────────────────────────────
function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <p className="font-sans font-semibold text-slate-900 text-sm tracking-wide">{title}</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors cursor-none"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, icon: Icon, trend, color }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; trend?: 'up' | 'down' | 'neutral'; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="font-sans text-[10px] text-slate-400 tracking-[0.15em] uppercase font-semibold">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={15} className="text-white" />
        </div>
      </div>
      <div>
        <p className="font-display text-slate-900 text-3xl font-bold">{value}</p>
        {sub && <p className="font-sans text-slate-400 text-xs mt-0.5">{sub}</p>}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-sans font-semibold ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
          {trend === 'up' ? <ArrowUpRight size={13} /> : trend === 'down' ? <ArrowDownRight size={13} /> : null}
          {trend === 'up' ? '+12% vs last week' : trend === 'down' ? '-3% vs last week' : 'No change'}
        </div>
      )}
    </div>
  );
}

// ─── Mini Bar Chart ────────────────────────────────────────────────────────────
function MiniBarChart({ data, color = '#d4a574' }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div className="w-full rounded-sm" style={{ height: `${(d.value / max) * 64}px`, backgroundColor: color, opacity: 0.8 + (i / data.length) * 0.2 }} />
          <span className="font-sans text-[9px] text-slate-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard({ onClose, adminUser }: AdminDashboardProps) {
  const [tab, setTab] = useState<SidebarTab>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bookings, setBookings] = useState<(Booking & { rooms?: Room; profiles?: Profile; confirmation_status?: string; mpesa_transaction_id?: string })[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomSearch, setRoomSearch] = useState('');
const [roomCategoryFilter, setRoomCategoryFilter] = useState('all');
const [roomStatusFilter, setRoomStatusFilter] = useState('all');
const [roomSort, setRoomSort] = useState('name-asc');
const filteredRooms = [...rooms]
  .filter(room => {
    const matchesSearch =
      roomSearch === '' ||
      room.name.toLowerCase().includes(roomSearch.toLowerCase()) ||
      room.category.toLowerCase().includes(roomSearch.toLowerCase()) ||
      room.room_number.toLowerCase().includes(roomSearch.toLowerCase()) ||
      room.amenities.some(a =>
        a.toLowerCase().includes(roomSearch.toLowerCase())
      );

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
      case 'name-desc':
        return b.name.localeCompare(a.name);

      case 'price-low':
        return a.price_per_night - b.price_per_night;

      case 'price-high':
        return b.price_per_night - a.price_per_night;

      case 'category':
        return a.category.localeCompare(b.category);

      default:
        return a.name.localeCompare(b.name);
    }
  });

const [viewRoomOpen, setViewRoomOpen] = useState(false);
const [viewRoom, setViewRoom] = useState<Room | null>(null);
const [roomBookingsOpen, setRoomBookingsOpen] = useState(false);
const [roomBookings, setRoomBookings] = useState<Room | null>(null);
const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
const [deleteRoom, setDeleteRoom] = useState<Room | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [confirmFilter, setConfirmFilter] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerBooking, setDrawerBooking] = useState<typeof bookings[0] | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [housekeepingStatus, setHousekeepingStatus] = useState<Record<string, 'clean' | 'cleaning' | 'maintenance'>>({});
  const [newBooking, setNewBooking] = useState({
    guestName: '', guestEmail: '', guestPhone: '',
    checkIn: '', checkOut: '', adults: 1, children: 0,
    roomId: '', paymentMethod: 'mpesa', mpesaNumber: '', paymentStatus: 'paid',
  });
  const [savingBooking, setSavingBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [newReview, setNewReview] = useState({ bookingId: '', guestName: '', guestEmail: '', rating: 5, comment: '' });
  const [savingReview, setSavingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [settings, setSettings] = useState({
    taxRate: '16', checkinTime: '14:00', checkoutTime: '11:00',
    currency: 'USD', depositPercent: '30', cancellationPolicy: '48-hour notice required for full refund.',
  });
  const [roomFormOpen, setRoomFormOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const addLog = (message: string, type: ActivityLog['type'] = 'system') => {
    setActivityLog(prev => [{
      id: Math.random().toString(36).substring(2),
      time: new Date().toISOString(),
      message,
      type,
    }, ...prev].slice(0, 50));
  };

  const loadData = async () => {
    setLoading(true);
    const [bookingsRes, roomsRes, reviewsRes] = await Promise.all([
      supabase.from('bookings').select('*, rooms(*), profiles(*)').order('created_at', { ascending: false }),
      supabase.from('rooms').select('*').order('room_number'),
      supabase.from('reviews').select('*').order('created_at', { ascending: false }),
    ]);

    if (bookingsRes.data) {
      setBookings(bookingsRes.data.map(b => ({
        ...b,
        rooms: b.rooms ? {
          ...b.rooms,
          amenities: typeof b.rooms.amenities === 'string' ? JSON.parse(b.rooms.amenities) : b.rooms.amenities,
          images: typeof b.rooms.images === 'string' ? JSON.parse(b.rooms.images) : b.rooms.images,
        } : undefined,
      })));
    }
    if (roomsRes.data) {
      setRooms(roomsRes.data.map(r => ({
        ...r,
        amenities: typeof r.amenities === 'string' ? JSON.parse(r.amenities) : r.amenities,
        images: typeof r.images === 'string' ? JSON.parse(r.images) : r.images,
      })));
      const hs: Record<string, 'clean' | 'cleaning' | 'maintenance'> = {};
      roomsRes.data.forEach(r => { hs[r.id] = 'clean'; });
      setHousekeepingStatus(hs);
    }
    if (reviewsRes.data) setReviews(reviewsRes.data as Review[]);
    addLog('Dashboard data refreshed', 'system');
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

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

  // ── Guests (unique by email) ─────────────────────────────────────────────────
  const guestMap: Record<string, { name: string; email: string; bookings: typeof bookings; spend: number }> = {};
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

  // ── Monthly revenue data (last 6 months) ────────────────────────────────────
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
      const room = rooms.find(r => r.id === parseInt(newBooking.roomId));
      if (!room) throw new Error('Room not found');
      const nights = nightsBetween(newBooking.checkIn, newBooking.checkOut);
      const total = nights * room.price_per_night;
      const ref = generateRef();
      const { error } = await supabase.from('bookings').insert({
        user_id: adminUser?.id, room_id: parseInt(newBooking.roomId),
        check_in: newBooking.checkIn, check_out: newBooking.checkOut,
        adults: newBooking.adults, children: newBooking.children,
        guest_name: newBooking.guestName, guest_email: newBooking.guestEmail,
        guest_phone: newBooking.guestPhone, payment_method: newBooking.paymentMethod,
        mpesa_number: newBooking.mpesaNumber, payment_status: newBooking.paymentStatus,
        total_amount: total, booking_reference: ref,
        confirmation_status: 'confirmed', notes: 'Booked by admin',
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
        booking_id: newReview.bookingId || null, guest_name: newReview.guestName,
        guest_email: newReview.guestEmail || null, rating: newReview.rating,
        comment: newReview.comment || null, is_published: false,
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
    onClose();
  };

  const openDrawer = (booking: typeof bookings[0]) => {
    setDrawerBooking(booking);
    setDrawerOpen(true);
  };

  const dm = darkMode ? 'dark' : '';

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className={`fixed inset-0 z-50 flex flex-col overflow-hidden ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`} style={{ fontFamily: 'system-ui, sans-serif' }}>

      {/* ── TOP BAR ── */}
      <div className={`flex items-center justify-between px-5 py-3 flex-shrink-0 border-b ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarCollapsed(p => !p)} className="text-slate-400 hover:text-slate-700 transition-colors cursor-none">
            <LayoutDashboard size={18} />
          </button>
          <div>
            <p className={`font-display tracking-[0.2em] uppercase text-sm font-bold ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>Equator</p>
            <p className={`text-[9px] tracking-[0.25em] uppercase ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Christian Retreat Centre</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setNotifOpen(p => !p)} className={`relative p-2 rounded-lg transition-colors cursor-none ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
              <Bell size={17} />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{notifications.length}</span>
              )}
            </button>
            {notifOpen && (
              <div className={`absolute right-0 top-10 w-72 rounded-xl shadow-xl border z-50 overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className={`px-4 py-3 border-b text-xs font-semibold tracking-wide ${darkMode ? 'border-slate-700 text-slate-300' : 'border-slate-100 text-slate-600'}`}>
                  Notifications
                </div>
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs text-slate-400">All caught up!</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 border-b last:border-0 text-xs ${darkMode ? 'border-slate-800 text-slate-300' : 'border-slate-50 text-slate-600'}`}>
                      <div className="flex items-start gap-2">
                        <div className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${n.type === 'booking' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                        {n.msg}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Dark mode */}
          <button onClick={() => setDarkMode(p => !p)} className={`p-2 rounded-lg transition-colors cursor-none ${darkMode ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <UserCircle size={15} className={darkMode ? 'text-slate-400' : 'text-slate-500'} />
            <span className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{adminUser?.email}</span>
          </div>
          <button onClick={handleSignOut} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-none ${darkMode ? 'text-slate-400 hover:text-red-400 hover:bg-slate-800' : 'text-slate-500 hover:text-red-500 hover:bg-red-50'}`}>
            <LogOut size={13} /> Sign out
          </button>
          <button onClick={onClose} className={`p-1.5 transition-colors cursor-none ${darkMode ? 'text-slate-500 hover:text-slate-200' : 'text-slate-400 hover:text-slate-700'}`}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR ── */}
        <aside className={`flex-shrink-0 flex flex-col border-r transition-all duration-200 ${sidebarCollapsed ? 'w-14' : 'w-52'} ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
            {SIDEBAR_ITEMS.map(({ key, label, icon: Icon, section }) => (
              <div key={key}>
                {section && !sidebarCollapsed && (
                  <p className={`px-3 pt-4 pb-1 text-[9px] font-bold tracking-[0.2em] uppercase ${darkMode ? 'text-slate-600' : 'text-slate-300'}`}>{section}</p>
                )}
                <button
                  onClick={() => setTab(key)}
                  title={label}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-none
                    ${tab === key
                      ? darkMode ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-700'
                      : darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{label}</span>}
                  {!sidebarCollapsed && tab === key && <ChevronRight size={12} className="ml-auto opacity-60" />}
                </button>
              </div>
            ))}
          </nav>

          <div className={`p-3 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className={`flex items-center gap-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-bold">A</span>
              </div>
              {!sidebarCollapsed && (
                <div className="overflow-hidden">
                  <p className={`text-xs font-semibold truncate ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>Admin</p>
                  <p className={`text-[9px] truncate ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Super Admin</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className={`flex-1 overflow-y-auto ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
          <div className="p-6">

            {/* Refresh btn */}
            <div className="flex items-center justify-between mb-6">
              <h1 className={`font-display text-xl font-bold tracking-wide capitalize ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                {SIDEBAR_ITEMS.find(s => s.key === tab)?.label}
              </h1>
              <button onClick={loadData} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-none ${darkMode ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-white border border-slate-100 text-slate-500 hover:text-slate-800'}`}>
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="w-8 h-8 rounded-full animate-spin border-2 border-slate-200 border-t-amber-500" />
              </div>
            ) : (

              <>
                {/* ══════════════ DASHBOARD ══════════════ */}
                {tab === 'dashboard' && (
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
                )}

                {/* ══════════════ BOOKINGS ══════════════ */}
                {tab === 'bookings' && (
                  <div>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mb-5">
                      <div className={`relative flex-1 min-w-48 max-w-sm`}>
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search guest, ref, room..."
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'}`}
                        />
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
                              <td className={`px-4 py-3 text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>${b.total_amount?.toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <button onClick={() => openDrawer(b)} title="View" className={`p-1.5 rounded-md transition-colors cursor-none ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><Eye size={13} /></button>
                                  {(!b.confirmation_status || b.confirmation_status === 'pending') && (
                                    <>
                                      <button onClick={() => updateConfirmation(b.id, 'confirmed')} title="Confirm" className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-600 transition-colors cursor-none"><ThumbsUp size={13} /></button>
                                      <button onClick={() => updateConfirmation(b.id, 'rejected')} title="Reject" className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors cursor-none"><XCircle size={13} /></button>
                                    </>
                                  )}
                                  {b.confirmation_status === 'confirmed' && (
                                    <button onClick={() => updateConfirmation(b.id, 'checked_in')} title="Check In" className="p-1.5 rounded-md hover:bg-purple-50 text-purple-500 transition-colors cursor-none"><DoorOpen size={13} /></button>
                                  )}
                                  {b.confirmation_status === 'checked_in' && (
                                    <button onClick={() => updateConfirmation(b.id, 'checked_out')} title="Check Out" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors cursor-none"><DoorClosed size={13} /></button>
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
                )}

                {/* ══════════════ NEW BOOKING ══════════════ */}
                {tab === 'new-booking' && (
                  <div className="max-w-2xl">
                    {bookingSuccess && (
                      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm rounded-lg mb-5">
                        <CheckCircle2 size={15} /> {bookingSuccess}
                      </div>
                    )}
                    <form onSubmit={handleNewBooking} className="space-y-5">
                      {/* Guest */}
                      <div className={`rounded-xl border p-5 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <p className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Guest Information</p>
                        <div className="space-y-4">
                          {[
                            { label: 'Full Name', key: 'guestName', type: 'text', placeholder: 'John Doe', required: true },
                            { label: 'Email', key: 'guestEmail', type: 'email', placeholder: 'guest@example.com', required: true },
                            { label: 'Phone', key: 'guestPhone', type: 'tel', placeholder: '+254 700 000 000', required: false },
                          ].map(f => (
                            <div key={f.key}>
                              <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{f.label}</label>
                              <input type={f.type} required={f.required} placeholder={f.placeholder}
                                value={(newBooking as Record<string, unknown>)[f.key] as string}
                                onChange={e => setNewBooking(p => ({ ...p, [f.key]: e.target.value }))}
                                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'}`}
                              />
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
                              className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                            />
                          </div>
                          <div>
                            <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Check-out</label>
                            <input type="date" required min={newBooking.checkIn || today} value={newBooking.checkOut}
                              onChange={e => setNewBooking(p => ({ ...p, checkOut: e.target.value }))}
                              className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {[
                            { label: 'Adults', key: 'adults', min: 1, max: 6 },
                            { label: 'Children', key: 'children', min: 0, max: 5 },
                          ].map(f => (
                            <div key={f.key}>
                              <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{f.label}</label>
                              <div className="flex items-center gap-3">
                                <button type="button" onClick={() => setNewBooking(p => ({ ...p, [f.key]: Math.max(f.min, (p as Record<string, number>)[f.key] - 1) }))}
                                  className="w-8 h-8 rounded-lg border border-amber-400 text-amber-600 hover:bg-amber-50 flex items-center justify-center font-bold cursor-none text-lg">−</button>
                                <span className={`w-6 text-center font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{(newBooking as Record<string, number>)[f.key]}</span>
                                <button type="button" onClick={() => setNewBooking(p => ({ ...p, [f.key]: Math.min(f.max, (p as Record<string, number>)[f.key] + 1) }))}
                                  className="w-8 h-8 rounded-lg border border-amber-400 text-amber-600 hover:bg-amber-50 flex items-center justify-center font-bold cursor-none text-lg">+</button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div>
                          <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Room</label>
                          <select required value={newBooking.roomId} onChange={e => setNewBooking(p => ({ ...p, roomId: e.target.value }))}
                            className={`w-full px-3 py-2.5 rounded-lg border text-sm cursor-none focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                            <option value="">Select a room</option>
                            {rooms.map(r => <option key={r.id} value={r.id}>Room {r.room_number} — {r.name} (${r.price_per_night}/night)</option>)}
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
                                {rooms.find(r => r.id === parseInt(newBooking.roomId))?.name} · {nightsBetween(newBooking.checkIn, newBooking.checkOut)} nights
                              </span>
                              <span className="font-bold text-amber-400 text-lg">
                                ${(nightsBetween(newBooking.checkIn, newBooking.checkOut) * (rooms.find(r => r.id === parseInt(newBooking.roomId))?.price_per_night || 0)).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {bookingError && <p className="text-red-500 text-sm">{bookingError}</p>}
                      <button type="submit" disabled={savingBooking}
                        className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors cursor-none disabled:opacity-50 flex items-center justify-center gap-2">
                        {savingBooking ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating…</> : <><Plus size={15} />Create Booking</>}
                      </button>
                    </form>
                  </div>
                )}

                {/* ══════════════ ROOMS ══════════════ */}
{tab === 'rooms' && (
  <div className="space-y-6">
    {/* Header Actions */}
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-3">
        <div className={`relative flex-1 min-w-64`}>
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, category, amenities..."
            value={roomSearch}
            onChange={e => setRoomSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'}`}
          />
        </div>
        <select value={roomCategoryFilter} onChange={e => setRoomCategoryFilter(e.target.value)}
          className={`px-3 py-2.5 rounded-lg border text-sm cursor-none focus:outline-none ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
          <option value="all">All Categories</option>
          <option value="Executive Suite">Executive Suite</option>
          <option value="Deluxe">Deluxe</option>
          <option value="Standard">Standard</option>
        </select>
        <select value={roomStatusFilter} onChange={e => setRoomStatusFilter(e.target.value)}
          className={`px-3 py-2.5 rounded-lg border text-sm cursor-none focus:outline-none ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="cleaning">Cleaning</option>
          <option value="reserved">Reserved</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <select value={roomSort} onChange={e => setRoomSort(e.target.value)}
          className={`px-3 py-2.5 rounded-lg border text-sm cursor-none focus:outline-none ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="price-low">Price: Low → High</option>
          <option value="price-high">Price: High → Low</option>
          <option value="category">Category</option>
        </select>
      </div>
      <button onClick={() => setRoomFormOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors cursor-none">
        <Plus size={15} /> Add Room
      </button>
    </div>

    {/* Statistics */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Room Types', value: rooms.length, color: 'bg-slate-500', icon: Building2 },
        { label: 'Standard', value: rooms.filter(r => r.category === 'Standard').length, color: 'bg-blue-500', icon: Home },
        { label: 'Deluxe', value: rooms.filter(r => r.category === 'Deluxe').length, color: 'bg-purple-500', icon: Star },
        { label: 'Executive', value: rooms.filter(r => r.category === 'Executive Suite').length, color: 'bg-amber-500', icon: Sparkles },
      ].map(s => (
        <div key={s.label} className={`rounded-xl border p-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] font-semibold tracking-wider uppercase ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{s.label}</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.color}`}>
              <s.icon size={14} className="text-white" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{s.value}</p>
        </div>
      ))}
    </div>

    {/* Room Cards Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {filteredRooms.length === 0 ? (
        <div className={`col-span-full text-center py-16 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-100 text-slate-400'}`}>
          <BedDouble size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm">No rooms match your filters</p>
          <button onClick={() => { setRoomSearch(''); setRoomCategoryFilter('all'); setRoomStatusFilter('all'); }}
            className="mt-3 text-xs text-amber-600 hover:text-amber-700 cursor-none">Clear filters</button>
        </div>
      ) : filteredRooms.map(r => {
        const priceKeys = Object.keys(r.price) as Array<keyof typeof r.price>;
        const minPrice = Math.min(...priceKeys.map(k => r.price[k]));
        const maxPrice = Math.max(...priceKeys.map(k => r.price[k]));
        const statusConfig = {
          available: { dot: 'bg-emerald-500', label: 'Available', bg: 'bg-emerald-50 text-emerald-700' },
          occupied: { dot: 'bg-blue-500', label: 'Occupied', bg: 'bg-blue-50 text-blue-700' },
          cleaning: { dot: 'bg-amber-400', label: 'Cleaning', bg: 'bg-amber-50 text-amber-700' },
          reserved: { dot: 'bg-orange-500', label: 'Reserved', bg: 'bg-orange-50 text-orange-700' },
          maintenance: { dot: 'bg-red-500', label: 'Maintenance', bg: 'bg-red-50 text-red-700' },
        };
        const sc = statusConfig[r.status];

        return (
          <div key={r.id} className={`rounded-xl border overflow-hidden group ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
            {/* Image */}
            <div className="h-48 bg-slate-200 overflow-hidden relative">
              {r.images && r.images.length > 0 ? (
                <img 
                  src={r.images[0]} 
                  alt={r.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-room.jpg'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <BedDouble size={32} className="text-slate-300" />
                  <span className="ml-2 text-sm text-slate-400">No Image</span>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className={`flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full backdrop-blur-md bg-white/90 shadow-sm ${sc.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  {sc.label}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full backdrop-blur-md bg-white/90 text-slate-700 shadow-sm">
                  {r.category}
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`font-semibold text-base ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{r.name}</p>
                  {r.badge && (
                    <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{r.badge}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={12} className={i <= r.rating ? 'text-amber-500 fill-amber-500' : darkMode ? 'text-slate-700' : 'text-slate-200'} />
                  ))}
                </div>
              </div>

              <div className={`flex flex-wrap gap-3 mb-3 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className="flex items-center gap-1"><User size={12} /> {r.max_adults} Adults</span>
                <span className="flex items-center gap-1"><Baby size={12} /> {r.max_children} Children</span>
                <span className="flex items-center gap-1"><Building2 size={12} /> {r.size_sqm}m²</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {(r.amenities || []).slice(0, 5).map((a, i) => (
                  <span key={i} className={`text-[10px] px-2 py-1 rounded-full ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{a}</span>
                ))}
                {(r.amenities || []).length > 5 && (
                  <span className={`text-[10px] px-2 py-1 rounded-full ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>+{(r.amenities || []).length - 5} more</span>
                )}
              </div>

              <div className="mb-4">
                <p className={`text-lg font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                  KES {minPrice.toLocaleString()}
                  {minPrice !== maxPrice && <span className={`text-sm font-normal ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}> – {maxPrice.toLocaleString()}</span>}
                  <span className={`text-xs font-normal ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>/night</span>
                </p>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setViewRoom(r); setViewRoomOpen(true); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-none flex items-center justify-center gap-1 ${darkMode ? 'border-slate-700 text-slate-400 hover:border-amber-500 hover:text-amber-400' : 'border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600'}`}>
                  <Eye size={12} /> View
                </button>
                <button onClick={() => { setRoomBookings(r); setRoomBookingsOpen(true); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-none flex items-center justify-center gap-1 ${darkMode ? 'border-slate-700 text-slate-400 hover:border-blue-500 hover:text-blue-400' : 'border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'}`}>
                  <Calendar size={12} /> Bookings
                </button>
                <button onClick={() => { setEditRoom(r); setRoomFormOpen(true); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-none flex items-center justify-center gap-1 ${darkMode ? 'border-slate-700 text-slate-400 hover:border-emerald-500 hover:text-emerald-400' : 'border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-600'}`}>
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => { setDeleteRoom(r); setDeleteConfirmOpen(true); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-none flex items-center justify-center gap-1 ${darkMode ? 'border-slate-700 text-slate-400 hover:border-red-500 hover:text-red-400' : 'border-slate-200 text-slate-600 hover:border-red-400 hover:text-red-600'}`}>
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
                {/* ══════════════ GUESTS ══════════════ */}
                {tab === 'guests' && (
                  <div className={`rounded-xl border overflow-hidden ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <table className="w-full text-left">
                      <thead>
                        <tr className={`text-[10px] tracking-wider uppercase font-semibold ${darkMode ? 'bg-slate-900 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
                          {['Guest', 'Email', 'Total Bookings', 'Last Visit', 'Lifetime Spend'].map(h => (
                            <th key={h} className={`px-5 py-3 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {guests.length === 0 ? (
                          <tr><td colSpan={5} className="px-5 py-16 text-center text-sm text-slate-400">No guests yet</td></tr>
                        ) : guests.map((g, i) => (
                          <tr key={i} className={`border-b last:border-0 ${darkMode ? 'border-slate-800 hover:bg-slate-900' : 'border-slate-50 hover:bg-amber-50/20'}`}>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                  <span className="text-amber-700 text-xs font-bold">{g.name?.charAt(0)}</span>
                                </div>
                                <span className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{g.name}</span>
                              </div>
                            </td>
                            <td className={`px-5 py-3.5 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{g.email || '—'}</td>
                            <td className={`px-5 py-3.5 text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{g.bookings.length}</td>
                            <td className={`px-5 py-3.5 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              {g.bookings[0]?.check_in || '—'}
                            </td>
                            <td className={`px-5 py-3.5 text-sm font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>${g.spend.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ══════════════ PAYMENTS ══════════════ */}
                {tab === 'payments' && (
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                      {[
                        { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, color: 'bg-emerald-500' },
                        { label: 'Paid', value: bookings.filter(b => b.payment_status === 'paid').length, color: 'bg-blue-500' },
                        { label: 'Pending', value: bookings.filter(b => b.payment_status === 'pending').length, color: 'bg-amber-500' },
                        { label: 'Failed', value: bookings.filter(b => b.payment_status === 'failed').length, color: 'bg-red-500' },
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
                )}

                {/* ══════════════ REVIEWS ══════════════ */}
                {tab === 'reviews' && (
                  <div className="max-w-3xl">
                    {/* Add Review */}
                    <div className={`rounded-xl border p-5 mb-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                      <p className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Add Review</p>
                      <form onSubmit={handleAddReview} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Guest Name</label>
                            <input type="text" required value={newReview.guestName} onChange={e => setNewReview(p => ({ ...p, guestName: e.target.value }))} placeholder="Guest name"
                              className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                          </div>
                          <div>
                            <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Email (optional)</label>
                            <input type="email" value={newReview.guestEmail} onChange={e => setNewReview(p => ({ ...p, guestEmail: e.target.value }))} placeholder="guest@email.com"
                              className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                          </div>
                        </div>
                        <div>
                          <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Rating</label>
                          <div className="flex items-center gap-2">
                            {[1,2,3,4,5].map(i => (
                              <button key={i} type="button" onClick={() => setNewReview(p => ({ ...p, rating: i }))} className="cursor-none">
                                <Star size={22} className={i <= newReview.rating ? 'text-amber-500 fill-amber-500' : darkMode ? 'text-slate-700' : 'text-slate-200'} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Comment</label>
                          <textarea value={newReview.comment} onChange={e => setNewReview(p => ({ ...p, comment: e.target.value }))} rows={3} placeholder="Guest's review..."
                            className={`w-full px-3 py-2.5 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                        </div>
                        {reviewError && <p className="text-red-500 text-sm">{reviewError}</p>}
                        <button type="submit" disabled={savingReview}
                          className="py-2.5 px-5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors cursor-none disabled:opacity-50 flex items-center gap-2">
                          {savingReview ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MessageSquare size={14} />} Add Review
                        </button>
                      </form>
                    </div>

                    {/* Reviews list */}
                    <div className="space-y-3">
                      {reviews.map(r => (
                        <div key={r.id} className={`rounded-xl border p-4 flex items-start justify-between gap-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{r.guest_name}</p>
                              <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${r.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {r.is_published ? 'Published' : 'Draft'}
                              </span>
                            </div>
                            <div className="flex gap-0.5 mb-2">
                              {[1,2,3,4,5].map(i => <Star key={i} size={12} className={i <= r.rating ? 'text-amber-500 fill-amber-500' : darkMode ? 'text-slate-700' : 'text-slate-200'} />)}
                            </div>
                            {r.comment && <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{r.comment}</p>}
                            <p className={`text-[10px] mt-2 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>{new Date(r.created_at).toLocaleDateString()}</p>
                          </div>
                          <button onClick={() => toggleReviewPublished(r.id, r.is_published)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all cursor-none whitespace-nowrap ${r.is_published ? 'border border-red-200 text-red-600 hover:bg-red-50' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                            {r.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ══════════════ HOUSEKEEPING ══════════════ */}
                {tab === 'housekeeping' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {rooms.map(r => {
                      const hs = housekeepingStatus[r.id] || 'clean';
                      return (
                        <div key={r.id} className={`rounded-xl border p-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Room {r.room_number}</p>
                              <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{r.name}</p>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${hs === 'clean' ? 'bg-emerald-500' : hs === 'cleaning' ? 'bg-amber-400' : 'bg-red-500'}`} />
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(['clean', 'cleaning', 'maintenance'] as const).map(s => (
                              <button key={s} onClick={() => {
                                setHousekeepingStatus(p => ({ ...p, [r.id]: s }));
                                addLog(`Room ${r.room_number} → ${s}`, 'room');
                              }}
                                className={`text-[10px] px-2 py-1 rounded-md font-semibold capitalize cursor-none transition-all ${hs === s
                                  ? s === 'clean' ? 'bg-emerald-500 text-white' : s === 'cleaning' ? 'bg-amber-400 text-white' : 'bg-red-500 text-white'
                                  : darkMode ? 'bg-slate-800 text-slate-500 hover:text-slate-300' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}>
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {rooms.length === 0 && (
                      <div className={`col-span-4 text-center py-16 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-100 text-slate-400'}`}>
                        <Wrench size={32} className="mx-auto mb-3 opacity-30" />
                        <p>No rooms to manage</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ══════════════ ANALYTICS ══════════════ */}
                {tab === 'analytics' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { label: 'Avg Booking Value', value: `$${bookings.length ? Math.round(totalRevenue / bookings.length).toLocaleString() : 0}` },
                        { label: 'Occupancy Rate', value: `${Math.round((Math.min(occupiedRooms, totalRooms) / (totalRooms || 1)) * 100)}%` },
                        { label: 'Avg Stay (nights)', value: bookings.length ? (bookings.reduce((s, b) => s + nightsBetween(b.check_in, b.check_out), 0) / bookings.length).toFixed(1) : '0' },
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
                      {roomPopularity.length === 0 ? <p className="text-slate-400 text-sm">No data yet</p> : roomPopularity.map((r, i) => {
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
                )}

                {/* ══════════════ REPORTS ══════════════ */}
                {tab === 'reports' && (
                  <div className="max-w-xl space-y-4">
                    {[
                      { label: 'Daily Report', desc: "Today's bookings, arrivals, and revenue" },
                      { label: 'Weekly Report', desc: 'Booking trends for this week' },
                      { label: 'Monthly Report', desc: 'Full monthly breakdown' },
                      { label: 'Occupancy Report', desc: 'Room utilization analysis' },
                      { label: 'Revenue Report', desc: 'Payments and financial summary' },
                      { label: 'Guest Report', desc: 'Guest profiles and repeat visitors' },
                    ].map(rep => (
                      <div key={rep.label} className={`rounded-xl border p-4 flex items-center justify-between ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <div>
                          <p className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{rep.label}</p>
                          <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{rep.desc}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-none ${darkMode ? 'border-slate-700 text-slate-400 hover:border-amber-500 hover:text-amber-400' : 'border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600'}`}>
                            <Download size={12} /> PDF
                          </button>
                          <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-none ${darkMode ? 'border-slate-700 text-slate-400 hover:border-amber-500 hover:text-amber-400' : 'border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600'}`}>
                            <Download size={12} /> Excel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ══════════════ ACTIVITY LOG ══════════════ */}
                {tab === 'activity' && (
                  <div className="max-w-2xl">
                    {activityLog.length === 0 ? (
                      <div className={`text-center py-16 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-100 text-slate-400'}`}>
                        <Activity size={32} className="mx-auto mb-3 opacity-30" />
                        <p>No activity yet — actions you take will appear here</p>
                      </div>
                    ) : (
                      <div className={`rounded-xl border overflow-hidden divide-y ${darkMode ? 'border-slate-800 divide-slate-800' : 'border-slate-100 divide-slate-100'}`}>
                        {activityLog.map(log => (
                          <div key={log.id} className={`flex items-start gap-4 px-5 py-3.5 ${darkMode ? 'bg-slate-900 hover:bg-slate-800' : 'bg-white hover:bg-slate-50'}`}>
                            <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                              log.type === 'booking' ? 'bg-blue-500' : log.type === 'payment' ? 'bg-emerald-500' : log.type === 'room' ? 'bg-purple-500' : log.type === 'review' ? 'bg-amber-500' : 'bg-slate-400'
                            }`} />
                            <div className="flex-1">
                              <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{log.message}</p>
                              <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>{formatTime(log.time)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ══════════════ SETTINGS ══════════════ */}
                {tab === 'settings' && (
                  <div className="max-w-xl">
                    <div className={`rounded-xl border p-5 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                      <p className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Resort Settings</p>
                      <div className="space-y-5">
                        {[
                          { label: 'Tax Rate (%)', key: 'taxRate', type: 'number' },
                          { label: 'Check-in Time', key: 'checkinTime', type: 'time' },
                          { label: 'Check-out Time', key: 'checkoutTime', type: 'time' },
                          { label: 'Currency', key: 'currency', type: 'text' },
                          { label: 'Booking Deposit (%)', key: 'depositPercent', type: 'number' },
                        ].map(f => (
                          <div key={f.key}>
                            <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{f.label}</label>
                            <input type={f.type} value={(settings as Record<string, string>)[f.key]} onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))}
                              className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                          </div>
                        ))}
                        <div>
                          <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Cancellation Policy</label>
                          <textarea value={settings.cancellationPolicy} onChange={e => setSettings(p => ({ ...p, cancellationPolicy: e.target.value }))} rows={3}
                            className={`w-full px-3 py-2.5 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                        </div>
                      </div>
                      <button onClick={() => addLog('Settings saved', 'system')}
                        className="mt-5 py-2.5 px-5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors cursor-none flex items-center gap-2">
                        <Check size={14} /> Save Settings
                      </button>
                    </div>
                  </div>
                )}

              </>
            )}
          </div>
        </main>
      </div>

      {/* ── BOOKING DETAILS DRAWER ── */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={drawerBooking ? `Booking ${drawerBooking.booking_reference}` : 'Booking Details'}>
        {drawerBooking && (
          <div className="space-y-6">
            {/* Guest */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-3">Guest</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-amber-700 font-bold">{drawerBooking.guest_name?.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{drawerBooking.guest_name}</p>
                  <p className="text-xs text-slate-400">{drawerBooking.guest_email}</p>
                </div>
              </div>
              {drawerBooking.guest_phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone size={13} className="text-slate-400" /> {drawerBooking.guest_phone}
                </div>
              )}
            </div>

            {/* Stay */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-3">Stay Details</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Room', drawerBooking.rooms?.name || '—'],
                  ['Room #', drawerBooking.rooms?.room_number || '—'],
                  ['Check-in', drawerBooking.check_in],
                  ['Check-out', drawerBooking.check_out],
                  ['Nights', nightsBetween(drawerBooking.check_in, drawerBooking.check_out)],
                  ['Guests', `${drawerBooking.adults} adults, ${drawerBooking.children} children`],
                ].map(([l, v]) => (
                  <div key={String(l)} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">{l}</p>
                    <p className="text-sm font-semibold text-slate-800">{String(v)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-3">Payment</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Total', `$${drawerBooking.total_amount?.toLocaleString()}`],
                  ['Status', drawerBooking.payment_status],
                  ['Method', drawerBooking.payment_method?.toUpperCase() || '—'],
                  ['M-Pesa #', drawerBooking.mpesa_number || '—'],
                ].map(([l, v]) => (
                  <div key={String(l)} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">{l}</p>
                    <p className="text-sm font-semibold text-slate-800">{String(v)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-3">Timeline</p>
              <div className="space-y-2">
                {[
                  { label: 'Created', done: true, date: new Date(drawerBooking.created_at).toLocaleDateString() },
                  { label: 'Confirmed', done: drawerBooking.confirmation_status === 'confirmed' || drawerBooking.confirmation_status === 'checked_in' || drawerBooking.confirmation_status === 'checked_out' },
                  { label: 'Paid', done: drawerBooking.payment_status === 'paid' },
                  { label: 'Checked In', done: drawerBooking.confirmation_status === 'checked_in' || drawerBooking.confirmation_status === 'checked_out' },
                  { label: 'Checked Out', done: drawerBooking.confirmation_status === 'checked_out' },
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

            {/* Confirmation Actions */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-3">Actions</p>
              <div className="flex flex-wrap gap-2">
                {(!drawerBooking.confirmation_status || drawerBooking.confirmation_status === 'pending') && (
                  <>
                    <button onClick={() => updateConfirmation(drawerBooking.id, 'confirmed')} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-none transition-colors">
                      <ThumbsUp size={12} /> Confirm
                    </button>
                    <button onClick={() => updateConfirmation(drawerBooking.id, 'rejected')} className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-none transition-colors">
                      <XCircle size={12} /> Reject
                    </button>
                  </>
                )}
                {drawerBooking.confirmation_status === 'confirmed' && (
                  <button onClick={() => updateConfirmation(drawerBooking.id, 'checked_in')} className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-none transition-colors">
                    <DoorOpen size={12} /> Check In
                  </button>
                )}
                {drawerBooking.confirmation_status === 'checked_in' && (
                  <button onClick={() => updateConfirmation(drawerBooking.id, 'checked_out')} className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-none transition-colors">
                    <DoorClosed size={12} /> Check Out
                  </button>
                )}
                <button className="flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600 px-4 py-2 rounded-lg text-xs font-semibold cursor-none transition-colors">
                  <Printer size={12} /> Print Invoice
                </button>
                <button className="flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600 px-4 py-2 rounded-lg text-xs font-semibold cursor-none transition-colors">
                  <Mail size={12} /> Email Guest
                </button>
              </div>
            </div>

            {drawerBooking.notes && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                <p className="text-[10px] font-bold tracking-wider uppercase text-amber-600 mb-1">Notes</p>
                <p className="text-sm text-slate-700">{drawerBooking.notes}</p>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
