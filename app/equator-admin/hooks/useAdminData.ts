'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { generateRef, nightsBetween } from '../utils';
import type {
  EnrichedBooking, Room, BookingRoomInfo, Review, ActivityLog,
  NewBookingForm, NewReviewForm, SettingsForm,
} from '../types';

const DEFAULT_BOOKING: NewBookingForm = {
  guestName: '',
  guestEmail: '',
  guestPhone: '',

  checkIn: '',
  checkOut: '',

  adults: 1,
  children: 0,

  roomId: '',
  categoryId: '',

  packageType: 'BB',

  paymentMethod: 'mpesa',
  mpesaNumber: '',
  paymentStatus: 'paid',
};

const DEFAULT_REVIEW: NewReviewForm = {
  bookingId: '', guestName: '', guestEmail: '', rating: 5, comment: '',
};

const DEFAULT_SETTINGS: SettingsForm = {
  taxRate: '16', checkinTime: '14:00', checkoutTime: '11:00',
  currency: 'USD', depositPercent: '30',
  cancellationPolicy: '48-hour notice required for full refund.',
};

export function useAdminData(adminUser?: { id: string; email: string }) {

  const [bookings, setBookings]   = useState<EnrichedBooking[]>([]);
  const [rooms, setRooms]         = useState<Room[]>([]);
  const [categories, setCategories] = useState<
  { id: string; name: string }[]
>([]);
  const [reviews, setReviews]     = useState<Review[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  
  // ── New booking form ──────────────────────────────────────────────────────
  const [newBooking, setNewBooking]         = useState<NewBookingForm>(DEFAULT_BOOKING);
  const [savingBooking, setSavingBooking]   = useState(false);
  const [bookingError, setBookingError]     = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  // ── New review form ───────────────────────────────────────────────────────
  const [newReview, setNewReview]         = useState<NewReviewForm>(DEFAULT_REVIEW);
  const [savingReview, setSavingReview]   = useState(false);
  const [reviewError, setReviewError]     = useState('');

  // ── Settings ─────────────────────────────────────────────────────────────
  const [settings, setSettings] = useState<SettingsForm>(DEFAULT_SETTINGS);

  // ── Activity log helper ───────────────────────────────────────────────────
  const addLog = (message: string, type: ActivityLog['type'] = 'system') => {
    setActivityLog(prev =>
      [{ id: Math.random().toString(36).substring(2), time: new Date().toISOString(), message, type },
       ...prev].slice(0, 50)
    );
  };

  // ── Load all data ─────────────────────────────────────────────────────────
  const loadData = async () => {
    setLoading(true);
    const categoriesRes = await supabase
  .from('room_categories')
  .select('id,name')
  .order('name');

  if (categoriesRes.data) {
    setCategories(categoriesRes.data);
}


    const bookingsRes = await supabase
  .from('bookings')
  .select(`
      *,
      profiles(*),
     rooms(
    *,
    category:room_categories!rooms_category_id_fkey(
        *
    )
)
  `)
  .order('created_at', { ascending: false });

  const roomsRes = await supabase
  .from("rooms")
  .select(`
    *,
    category:room_categories(*)
  `)
  .order("room_number");
  
    const [reviewsRes] = await Promise.all([
      supabase.from('reviews').select('*').order('created_at', { ascending: false }),
    ]);

    if (bookingsRes.data) {
  setBookings(
    bookingsRes.data.map((b) => ({
      ...b,

      rooms: b.rooms
        ? ({
            id: b.rooms.id,

            room_number: b.rooms.room_number,

            room_name: b.rooms.room_name,
            name: b.rooms.room_name,

            desc: b.rooms.description ?? "",

            category:
            b.rooms.category?.name ?? "Standard",
            badge: b.rooms.category?.beds ?? null,

            rating: Number(b.rooms.rating),

            status: b.rooms.status,

            max_adults: b.rooms.max_adults,

            max_children: b.rooms.max_children,

            max_guests:
              b.rooms.max_adults + b.rooms.max_children,

            size_sqm: b.rooms.size_sqm ?? 0,

            created_at: b.rooms.created_at,

            images:
    b.rooms.category?.gallery?.length
      ? b.rooms.category.gallery
      : b.rooms.category?.image
      ? [b.rooms.category.image]
      : [],
           

            price: {
              bb_single: Number(b.rooms.category?.bb_single_price ?? 0),
              bb_double: Number(b.rooms.category?.bb_double_price ?? 0),

              hb_single: Number(b.rooms.category?.hb_single_price ?? 0),
              hb_double: Number(b.rooms.category?.hb_double_price ?? 0),

              fb_single: Number(b.rooms.category?.fb_single_price ?? 0),
              fb_double: Number(b.rooms.category?.fb_double_price ?? 0),
            }
          } satisfies BookingRoomInfo)
        : undefined,
    }))
  );
}


    if (roomsRes.data) {
      setRooms(
  roomsRes.data.map((r): Room => ({
    id: r.id,

    room_number: r.room_number,

    room_name: r.room_name,

    category_id: r.category_id,

    name: r.room_name,

    category: r.category?.name ?? "",

    status: r.status,

    rating: Number(r.rating),

    featured: r.featured,

    created_at: r.created_at,
    updated_at: r.updated_at,

    description: r.category?.description ?? "",

    images: r.category?.gallery?.length
      ? r.category.gallery
      : r.category?.image
      ? [r.category.image]
      : [],

    amenities: [],

    max_adults: r.category?.max_adults ?? 0,

    max_children: r.category?.max_children ?? 0,

    max_guests:
      (r.category?.max_adults ?? 0) +
      (r.category?.max_children ?? 0),

    size_sqm: r.category?.size_sqm ?? 0,

    badge: r.category?.beds ?? null,

    price: {
        bb_single: Number(r.category?.bb_single_price ?? 0),
        bb_double: Number(r.category?.bb_double_price ?? 0),

        hb_single: Number(r.category?.hb_single_price ?? 0),
        hb_double: Number(r.category?.hb_double_price ?? 0),

        fb_single: Number(r.category?.fb_single_price ?? 0),
        fb_double: Number(r.category?.fb_double_price ?? 0),
    }
  }))
);

    }
    if (reviewsRes.data) setReviews(reviewsRes.data as Review[]);
    addLog('Dashboard data refreshed', 'system');
    setLoading(false);
  };
  

  useEffect(() => { loadData(); }, []);


const today = new Date().toISOString().split("T")[0];

const todayArrivals = bookings.filter(
  booking =>
    booking.booking_status === "checked_in" &&
    booking.check_in === today
).length;

const todayDepartures = bookings.filter(
  booking =>
    booking.booking_status === "checked_out" &&
    booking.check_out === today
).length;

const totalRooms = rooms.length;

const occupiedRooms = rooms.filter(
  room => room.status === "occupied"
).length;

const reservedRooms = rooms.filter(
  room => room.status === "reserved"
).length;

const availableRooms = rooms.filter(
  room => room.status === "available"
).length;

const cleaningRooms = rooms.filter(
  room => room.status === "cleaning"
).length;

const maintenanceRooms = rooms.filter(
  room => room.status === "maintenance"
).length;


const addRoom = async (room: {
  room_number: string;
  room_name: string;
  category_id: string;
  rating: number;
  featured: boolean;
  status: string;
}) => {
  const { data, error } = await supabase
    .from("rooms")
    .insert({
      room_number: room.room_number,
      room_name: room.room_name,
      category_id: room.category_id,
      rating: room.rating,
      featured: room.featured,
      status: room.status,
    })
    .select()
    .single();

  if (error) throw error;

  await loadData();

  return data;
};

const updateRoom = async (
  id: string,
  room: {
    room_number: string;
    room_name: string;
    category_id: string;
    rating: number;
    featured: boolean;
    status: string;
  }
) => {
  const { data, error } = await supabase
    .from("rooms")
    .update({
      room_number: room.room_number,
      room_name: room.room_name,
      category_id: room.category_id,
      rating: room.rating,
      featured: room.featured,
      status: room.status,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await loadData();

  return data;
};
const deleteRoom = async (id: string) => {
  const { error } = await supabase
    .from("rooms")
    .delete()
    .eq("id", id);

  if (error) throw error;

  await loadData();
};


  // ── Update confirmation status ────────────────────────────────────────────
  const updateConfirmation = async (
  bookingId: string,
  status: string,
  drawerBooking: EnrichedBooking | null,
  setDrawerBooking: (b: EnrichedBooking | null) => void,
) => {

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("room_id")
    .eq("id", bookingId)
    .single();

  if (bookingError) throw bookingError;

  const updates: any = {};

switch (status) {
  case "confirmed":
    updates.confirmation_status = "confirmed";
    updates.booking_status = "confirmed";
    break;

  case "checked_in":
    updates.booking_status = "checked_in";
    break;

  case "checked_out":
    updates.booking_status = "checked_out";
    break;

  case "cancelled":
    updates.confirmation_status = "cancelled";
    updates.booking_status = "cancelled";
    break;
}

await supabase
  .from("bookings")
  .update(updates)
  .eq("id", bookingId);
    
  if (status === "confirmed") {
  await supabase
    .from("bookings")
    .update({
      confirmation_status: "confirmed",
      booking_status: "confirmed",
    })
    .eq("id", bookingId);

  await supabase
    .from("rooms")
    .update({
      status: "reserved",
    })
    .eq("id", booking.room_id);
}

if (status === "checked_in") {
  await supabase
    .from("bookings")
    .update({
      booking_status: "checked_in",
    })
    .eq("id", bookingId);

  await supabase
    .from("rooms")
    .update({
      status: "occupied",
    })
    .eq("id", booking.room_id);
}

if (status === "checked_out") {
  await supabase
    .from("bookings")
    .update({
      booking_status: "checked_out",
    })
    .eq("id", bookingId);

  await supabase
    .from("rooms")
    .update({
      status: "available",
    })
    .eq("id", booking.room_id);
}
  addLog(
    `Booking ${bookings.find(b => b.id === bookingId)?.booking_reference} → ${status}`,
    "booking"
  );

  loadData();

  if (drawerBooking?.id === bookingId) {
    setDrawerBooking({
      ...drawerBooking,
      confirmation_status: status,
    });
  }
};
const getRoomPrice = (
  room: Room,
  packageType: "BB" | "HB" | "FB" | "BO" | "DAY_REST",
  adults: number,
  children: number
) => {
  const p = room.price;

  const double = adults + children > 1;

  if (packageType === "HB") {
    return double ? p.hb_double : p.hb_single;
  }

  if (packageType === "FB") {
    return double ? p.fb_double : p.fb_single;
  }

  // BB, plus BO ("Bed Only") and DAY_REST fall back to the base BB rate
  // since there are no dedicated price columns for those package types.
  return double ? p.bb_double : p.bb_single;
};

  // ── Create booking ────────────────────────────────────────────────────────
  const handleNewBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.roomId)                            { setBookingError('Please select a room'); return; }
    if (!newBooking.checkIn || !newBooking.checkOut)   { setBookingError('Please select dates'); return; }
    if (newBooking.checkIn >= newBooking.checkOut)     { setBookingError('Check-out must be after check-in'); return; }

    setSavingBooking(true); setBookingError(''); setBookingSuccess('');
    try {
      const room = rooms.find(r => r.id === newBooking.roomId);

      if (!room) {
        throw new Error("Room not found");
      }

      const nights = nightsBetween(
        newBooking.checkIn,
        newBooking.checkOut
      );

      const pricePerNight = getRoomPrice(
        room,
        newBooking.packageType,
        newBooking.adults,
        newBooking.children
      );

      const total = nights * pricePerNight;
      const ref = generateRef();

      const { data, error } = await supabase
  .from("bookings")
  .insert({
    user_id: adminUser?.id,

    room_id: newBooking.roomId,

    booking_reference: ref,

    guest_name: newBooking.guestName,
    guest_email: newBooking.guestEmail,
    guest_phone: newBooking.guestPhone,

    check_in: newBooking.checkIn,
    check_out: newBooking.checkOut,

    adults: newBooking.adults,
    children: newBooking.children,

    number_of_guests:
      newBooking.adults + newBooking.children,

    package_type: newBooking.packageType,

    payment_method: newBooking.paymentMethod,
    payment_status: newBooking.paymentStatus,
    mpesa_number: newBooking.mpesaNumber,

    total_amount: total,

    booking_status: "confirmed",

    confirmation_status: "confirmed",

    notes: "Booked by admin",
  })
  .select()
  .single();


if (error) throw error;

      setBookingSuccess(`Booking confirmed! Ref: ${ref}`);
      addLog(`Admin created booking ${ref} for ${newBooking.guestName}`, 'booking');
      setNewBooking(DEFAULT_BOOKING);
      loadData();
    } catch (err: unknown) {
      setBookingError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally { setSavingBooking(false); }
  };

  // ── Add review ────────────────────────────────────────────────────────────
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.guestName.trim()) { setReviewError('Guest name is required'); return; }
    setSavingReview(true); setReviewError('');
    try {
      const { error } = await supabase.from('reviews').insert({
        booking_id:  newReview.bookingId || null,
        guest_name:  newReview.guestName,
        guest_email: newReview.guestEmail || null,
        rating:      newReview.rating,
        comment:     newReview.comment || null,
        is_published: false,
      });
      if (error) throw error;
      addLog(`Review added for ${newReview.guestName}`, 'review');
      setNewReview(DEFAULT_REVIEW);
      loadData();
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : 'Failed to add review');
    } finally { setSavingReview(false); }
  };

  const updateHousekeeping = async (
  roomId: string,
  status: "clean" | "cleaning" | "maintenance"
) => {
  const roomStatus =
    status === "clean"
      ? "Available"
      : status === "cleaning"
      ? "Cleaning"
      : "Maintenance";

  const { error } = await supabase
    .from("rooms")
    .update({
      status: roomStatus,
    })
    .eq("id", roomId);

  if (error) throw error;

  addLog(`Room status changed to ${roomStatus}`, "room");

  await loadData();
};
  // ── Toggle review published ───────────────────────────────────────────────
  const toggleReviewPublished = async (reviewId: string, current: boolean) => {
    await supabase.from('reviews').update({ is_published: !current }).eq('id', reviewId);
    addLog(`Review ${current ? 'unpublished' : 'published'}`, 'review');
    loadData();
  };


  return {
    // data
    todayArrivals, todayDepartures, totalRooms, occupiedRooms, availableRooms, reservedRooms, cleaningRooms, maintenanceRooms,
    bookings, rooms, reviews, loading, activityLog, categories, addRoom, updateRoom, deleteRoom,
    // booking form
    newBooking, setNewBooking, savingBooking, bookingError, bookingSuccess,
    handleNewBooking,
    // review form
    newReview, setNewReview, savingReview, reviewError, handleAddReview, toggleReviewPublished,
    // settings
    settings, setSettings,
    // actions
    loadData, addLog, updateConfirmation, updateHousekeeping,
  };
}