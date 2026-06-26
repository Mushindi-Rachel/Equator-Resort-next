export interface AdminDashboardProps {
  onClose: () => void;
  adminUser?: { id: string; email: string };
}

export type SidebarTab =
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

export interface BookingWithRelations {
  id: string;
  user_id?: string;
  room_id?: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  payment_method: string;
  mpesa_number: string | null;
  payment_status: string;
  total_amount: number | null;
  booking_reference: string;
  confirmation_status: string | null;
  notes: string | null;
  created_at: string;
  rooms?: Room;
  profiles?: { id: string; email: string } | null;
  mpesa_transaction_id?: string;
}