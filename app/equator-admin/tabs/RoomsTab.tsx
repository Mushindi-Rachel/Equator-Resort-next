import { Search, Plus, BedDouble, Eye, Calendar, Edit2, Trash2, Star, Baby, Building2, Home, Sparkles } from 'lucide-react';
import type { Room, EnrichedBooking } from '../types';
import { useState } from 'react';

interface Props {
  darkMode: boolean;
  rooms: Room[];
  bookings: EnrichedBooking[];
  roomSearch: string;
  setRoomSearch: (v: string) => void;
  roomCategoryFilter: string;
  setRoomCategoryFilter: (v: string) => void;
  roomStatusFilter: string;
  setRoomStatusFilter: (v: string) => void;
  roomSort: string;
  setRoomSort: (v: string) => void;
  filteredRooms: Room[];
  onView: (room: Room) => void;
  onBookings: (room: Room) => void;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  onAddRoom: () => void;
}


export function RoomsTab({
  darkMode, rooms, bookings, roomSearch, setRoomSearch, roomCategoryFilter, setRoomCategoryFilter,
  roomStatusFilter, setRoomStatusFilter, roomSort, setRoomSort, filteredRooms,
  onView, onBookings, onEdit, onDelete, onAddRoom,
}: Props) {
    const totalRooms = rooms.length;

const standardRooms = rooms.filter(room =>
  room.category?.toLowerCase().includes("standard")
).length;

const deluxeRooms = rooms.filter(room =>
  room.category?.toLowerCase().includes("deluxe")
).length;

const executiveRooms = rooms.filter(room =>
  room.category?.toLowerCase().includes("executive")
).length;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-64">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by name, category, amenities..."
              value={roomSearch} onChange={e => setRoomSearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'}`} />
          </div>
          <select value={roomCategoryFilter} onChange={e => setRoomCategoryFilter(e.target.value)}
            className={`px-3 py-2.5 rounded-lg border text-sm cursor-none focus:outline-none ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
            <option value="all">All Categories</option>
            <option value="Executive">Executive</option>
            <option value="Deluxe Single">Deluxe Single</option>
            <option value="Deluxe Double">Deluxe Double</option>
            <option value="Standard Single">Standard Single</option>
            <option value="Standard Double">Standard Double</option>
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
        <button onClick={onAddRoom}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors cursor-none">
          <Plus size={15} /> Add Room
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
  {
    label: 'Total Rooms',
    value: totalRooms,
    color: 'bg-slate-500',
    icon: Building2,
  },
  {
    label: 'Standard',
    value: standardRooms,
    color: 'bg-blue-500',
    icon: Home,
  },
  {
    label: 'Deluxe',
    value: deluxeRooms,
    color: 'bg-purple-500',
    icon: Star,
  },
  {
    label: 'Executive',
    value: executiveRooms,
    color: 'bg-amber-500',
    icon: Sparkles,
  },
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
          const priceKeys = Object.keys(r.price);
          const minPrice = Math.min(...priceKeys.map(k => r.price[k]));
          const maxPrice = Math.max(...priceKeys.map(k => r.price[k]));
          const statusConfig = {
  Available: {
    dot: 'bg-emerald-500',
    label: 'Available',
    bg: 'bg-emerald-50 text-emerald-700',
  },

  Occupied: {
    dot: 'bg-blue-500',
    label: 'Occupied',
    bg: 'bg-blue-50 text-blue-700',
  },

  Reserved: {
    dot: 'bg-orange-500',
    label: 'Reserved',
    bg: 'bg-orange-50 text-orange-700',
  },

  Cleaning: {
    dot: 'bg-amber-400',
    label: 'Cleaning',
    bg: 'bg-amber-50 text-amber-700',
  },

  Maintenance: {
    dot: 'bg-red-500',
    label: 'Maintenance',
    bg: 'bg-red-50 text-red-700',
  },

  "Out of Service": {
    dot: 'bg-slate-500',
    label: 'Out of Service',
    bg: 'bg-slate-100 text-slate-700',
  },
};
          const sc =
  statusConfig[r.status as keyof typeof statusConfig] ?? {
    dot: 'bg-slate-500',
    label: r.status,
    bg: 'bg-slate-100 text-slate-700',
  };

          return (
            <div key={r.id} className={`rounded-xl border overflow-hidden group ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
              {/* Image */}
              <div className="h-48 bg-slate-200 overflow-hidden relative">
                {r.images && r.images.length > 0 ? (
                  <img src={r.images[0]} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { (e.target as HTMLImageElement).src = '/placeholder-room.jpg'; }} />
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
                  <span className="flex items-center gap-1"><Building2 size={12} /> {r.max_adults} Adults</span>
                  <span className="flex items-center gap-1"><Baby size={12} /> {r.max_children} Children</span>
                  <span className="flex items-center gap-1"><Home size={12} /> {r.size_sqm}m²</span>
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
                  <button onClick={() => onView(r)} className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-none flex items-center justify-center gap-1 ${darkMode ? 'border-slate-700 text-slate-400 hover:border-amber-500 hover:text-amber-400' : 'border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600'}`}>
                    <Eye size={12} /> View
                  </button>
                  <button onClick={() => onBookings(r)} className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-none flex items-center justify-center gap-1 ${darkMode ? 'border-slate-700 text-slate-400 hover:border-blue-500 hover:text-blue-400' : 'border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'}`}>
                    <Calendar size={12} /> Bookings
                  </button>
                  <button onClick={() => onEdit(r)} className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-none flex items-center justify-center gap-1 ${darkMode ? 'border-slate-700 text-slate-400 hover:border-emerald-500 hover:text-emerald-400' : 'border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-600'}`}>
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={() => onDelete(r)} className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-none flex items-center justify-center gap-1 ${darkMode ? 'border-slate-700 text-slate-400 hover:border-red-500 hover:text-red-400' : 'border-slate-200 text-slate-600 hover:border-red-400 hover:text-red-600'}`}>
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
}