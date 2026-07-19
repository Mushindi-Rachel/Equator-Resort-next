import type { Booking, Profile } from '@/lib/supabase';

export type SidebarTab =
  | 'dashboard'
  | 'bookings'
  | 'new-booking'
  | 'conference-bookings'
  | 'rooms'
  | 'guests'
  | 'payments'
  | 'reviews'
  | 'analytics'
  | 'reports'
  | 'housekeeping'
  | 'settings'
  | 'activity';

export interface Review {
  id: string;
  booking_id: string | null;
  guest_name: string;
  guest_email: string | null;
  rating: number;
  comment: string | null;
  is_published: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  time: string;
  message: string;
  type: 'booking' | 'payment' | 'room' | 'review' | 'system';
}
export interface RoomCategory {
  id: string;
  name: string;

  description: string | null;

  image: string | null;
  gallery: string[] | null;

  max_adults: number | null;
  max_children: number | null;

  size_sqm: number | null;

  beds: string | null;
  view_type: string | null;

  bb_single_price: number | null;
  bb_double_price: number | null;

  hb_single_price: number | null;
  hb_double_price: number | null;

  fb_single_price: number | null;
  fb_double_price: number | null;
}

export interface Room {
  id: string;

  room_number: string;

  room_name: string;

  category_id: string | null;

  status:
    | "available"
    | "occupied"
    | "reserved"
    | "maintenance"
    | "cleaning"
    | null;

  rating: number | null;

  featured: boolean | null;

  created_at: string | null;

  updated_at: string | null;

  room_categories?: RoomCategory;
}

export type EnrichedBooking = Booking & {
  rooms?: Room;
  profiles?: Profile;
  confirmation_status?: string;
  mpesa_transaction_id?: string;
};

export interface NewBookingForm {
  guestName: string;
  guestEmail: string;
 guestPhone: string;

  checkIn: string;
  checkOut: string;

  adults: number;
  children: number;

  roomId: string;
  categoryId: string;

  packageType: 'BB' | 'HB' | 'FB' | 'BO' | 'DAY_REST';

  paymentMethod: string;
  mpesaNumber: string;
  paymentStatus: string;
}

export interface RoomPrice {
  bb_single: number;
  bb_double: number;
  hb_single: number;
  hb_double: number;
  fb_single: number;
  fb_double: number;
}

export interface NewReviewForm {
  bookingId: string;
  guestName: string;
  guestEmail: string;
  rating: number;
  comment: string;
}

export interface SettingsForm {
  taxRate: string;
  checkinTime: string;
  checkoutTime: string;
  currency: string;
  depositPercent: string;
  cancellationPolicy: string;
}