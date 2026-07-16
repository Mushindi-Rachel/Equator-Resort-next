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

export interface Room {
  id: string;
  room_number: string;
  name: string;

  desc: string;

  category: "Standard" | "Deluxe" | "Executive Suite";

  badge: string | null;

  status:
    | "available"
    | "occupied"
    | "reserved"
    | "cleaning"
    | "maintenance";

  max_adults: number;
  max_children: number;
  max_guests: number;

  size_sqm: number;

  rating: number;

  created_at: string;

  images: string[];

  amenities: string[];

  price: {
    BB: number;
    HB: number;
    FB: number;
    BO: number;
    DAY_REST: number;
  };
}

export interface AdminDashboardProps {
  onClose: () => void;
  adminUser?: { id: string; email: string };
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

  packageType: 'BB' | 'HB' | 'FB' | 'BO' | 'DAY_REST';

  paymentMethod: string;
  mpesaNumber: string;
  paymentStatus: string;
}

export interface RoomPrice {
  BB: number;
  HB: number;
  FB: number;
  BO: number;
  DAY_REST: number;
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