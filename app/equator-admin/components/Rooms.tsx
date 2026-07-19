'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Booking } from "@/lib/supabase";
import type { Room, Review } from "../types";

import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  BedDouble,
  Building2,
  Home,
  Star,
  Sparkles,
  User,
  Baby,
} from 'lucide-react';

interface RoomsProps {
  darkMode: boolean;
}

export default function Rooms({ darkMode }: RoomsProps) {
  // ===========================
  // DATA
  // ===========================

  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  // ===========================
  // FILTERS
  // ===========================

  const [roomSearch, setRoomSearch] = useState('');
  const [roomCategoryFilter, setRoomCategoryFilter] = useState('all');
  const [roomStatusFilter, setRoomStatusFilter] = useState('all');
  const [roomSort, setRoomSort] = useState('name-asc');

  // ===========================
  // MODALS
  // ===========================

  const [viewRoomOpen, setViewRoomOpen] = useState(false);
  const [viewRoom, setViewRoom] = useState<Room | null>(null);

  const [roomBookingsOpen, setRoomBookingsOpen] = useState(false);
  const [roomBookings, setRoomBookings] = useState<Room | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteRoom, setDeleteRoom] = useState<Room | null>(null);

  const [roomFormOpen, setRoomFormOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);

  // ===========================
  // LOAD DATA
  // ===========================

 const loadData = async () => {
  setLoading(true);

  const { data: roomsData } = await supabase
    .from("rooms")
    .select(`
      *,
      room_categories(*)
    `);
  const { data: bookingsData } = await supabase
    .from('bookings')
    .select(`
      *,
      rooms(*)
    `);

  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  setRooms(roomsData ?? []);
  setBookings(bookingsData ?? []);
  setReviews(reviewsData ?? []);

  setLoading(false);
};

  useEffect(() => {
    loadData();
  }, []);
  
    // ===========================
  // FILTER ROOMS
  // ===========================
  const getMinPrice = (room: Room) => {
  const c = room.room_categories;

  const prices = [
    c?.bb_single_price,
    c?.bb_double_price,
    c?.hb_single_price,
    c?.hb_double_price,
    c?.fb_single_price,
    c?.fb_double_price,
  ]
    .map(Number)
    .filter((p) => p > 0);

  return prices.length ? Math.min(...prices) : 0;
};

  const filteredRooms = [...rooms]
    .filter((room) => {
      const matchesSearch =
        roomSearch === '' ||
        room.room_name.toLowerCase().includes(roomSearch.toLowerCase()) ||
        room.room_categories?.name.toLowerCase().includes(roomSearch.toLowerCase()) ||
        room.room_number.toLowerCase().includes(roomSearch.toLowerCase())
      
      const matchesCategory =
        roomCategoryFilter === 'all' ||
        room.room_categories?.name === roomCategoryFilter;

      const matchesStatus =
        roomStatusFilter === 'all' ||
        (room.status ?? 'available') === roomStatusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    })
    
    .sort((a, b) => {
  switch (roomSort) {
    case 'name-desc':
      return b.room_name.localeCompare(a.room_name);

    case 'price-low':
      return getMinPrice(a) - getMinPrice(b);

    case 'price-high':
      return getMinPrice(b) - getMinPrice(a);

    case 'category':
      return (a.room_categories?.name ?? '').localeCompare(
        b.room_categories?.name ?? ''
      );

    default:
      return a.room_name.localeCompare(b.room_name);
  }
});

  // ===========================
  // DASHBOARD STATISTICS
  // ===========================

  const totalRooms = rooms.length;

  const standardRooms = rooms.filter(
    (r) => r.room_categories?.name === 'Standard'
  ).length;

  const deluxeRooms = rooms.filter(
    (r) => r.room_categories?.name === 'Deluxe'
  ).length;

  const executiveRooms = rooms.filter(
    (r) => r.room_categories?.name === 'Executive Suite'
  ).length;

  const availableRooms = rooms.filter(
    (r) => r.status === 'available'
  ).length;

  const occupiedRooms = rooms.filter(
    (r) => r.status === 'occupied'
  ).length;

  const reservedRooms = rooms.filter(
    (r) => r.status === 'reserved'
  ).length;

  const maintenanceRooms = rooms.filter(
    (r) => r.status === 'maintenance'
  ).length;

  // ===========================
  // ROOM STATUS CONFIG
  // ===========================

  const statusConfig = {
    available: {
      dot: 'bg-emerald-500',
      label: 'Available',
      badge: 'bg-emerald-50 text-emerald-700',
    },

    occupied: {
      dot: 'bg-blue-500',
      label: 'Occupied',
      badge: 'bg-blue-50 text-blue-700',
    },

    reserved: {
      dot: 'bg-orange-500',
      label: 'Reserved',
      badge: 'bg-orange-50 text-orange-700',
    },

    cleaning: {
      dot: 'bg-amber-400',
      label: 'Cleaning',
      badge: 'bg-amber-50 text-amber-700',
    },

    maintenance: {
      dot: 'bg-red-500',
      label: 'Maintenance',
      badge: 'bg-red-50 text-red-700',
    },
  };


  if (loading) {
   

  
return(
  <div className="space-y-6">
    {/* Header Actions */}
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-3">
        <div className={`relative flex-1 min-w-64`}>
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, category.."
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
          <option value="Available">Available</option>
          <option value="Occupied">Occupied</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Reserved">Reserved</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Out of Service">Out of Service</option>
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
        { label: 'Standard', value: rooms.filter(r => r.room_categories?.name === 'Standard').length, color: 'bg-blue-500', icon: Home },
        { label: 'Deluxe', value: rooms.filter(r => r.room_categories?.name === 'Deluxe').length, color: 'bg-purple-500', icon: Star },
        { label: 'Executive', value: rooms.filter(r => r.room_categories?.name === 'Executive Suite').length, color: 'bg-amber-500', icon: Sparkles },
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
      ) : filteredRooms.map((r) => {
    const category = r.room_categories;

    const prices = [
      Number(category?.bb_single_price ?? 0),
      Number(category?.bb_double_price ?? 0),
      Number(category?.hb_single_price ?? 0),
      Number(category?.hb_double_price ?? 0),
      Number(category?.fb_single_price ?? 0),
      Number(category?.fb_double_price ?? 0),
    ].filter((p) => p > 0);

    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;

    const sc =
      statusConfig[r.status as keyof typeof statusConfig] ??
      statusConfig.available;

        return (
          <div key={r.id} className={`rounded-xl border overflow-hidden group ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
            {/* Image */}
            <div className="h-48 bg-slate-200 overflow-hidden relative">
              {category?.image ? (
                <img 
                  src={category.image}
                  alt={r.room_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <BedDouble size={32} className="text-slate-300" />
                  <span className="ml-2 text-sm text-slate-400">No Image</span>
                </div>
              )}
              <div className="absolute top-3 left-3">
<span className={`flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full backdrop-blur-md bg-white/90 shadow-sm ${sc.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  {sc.label}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full backdrop-blur-md bg-white/90 text-slate-700 shadow-sm">
                  {r.room_categories?.name}
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-3">
                
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={12} className={i <= Number(r.rating) ? "fill-amber-500" : darkMode ? "text-amber-500" : "text-slate-300"} />
                  ))}
                </div>
              </div>

              <div className={`flex flex-wrap gap-3 mb-3 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className="flex items-center gap-1"><User size={12} /> {category?.max_adults} Adults</span>
                <span className="flex items-center gap-1"><Baby size={12} /> {category?.max_children} Children</span>
                <span className="flex items-center gap-1"><Building2 size={12} /> {category?.size_sqm}m²</span>
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
);
  }}