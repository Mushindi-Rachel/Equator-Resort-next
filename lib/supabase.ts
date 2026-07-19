import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export type Profile = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  is_admin: boolean;
  created_at: string;
};

export type Room = {
  id: number;
  room_number: string;
  name: string;
  category: string;
  description: string;
  price_per_night: number;
  size_sqm: number;
  capacity_adults: number;
  capacity_children: number;
  amenities: string[];
  images: string[];
  badge: string;
  is_available: boolean;
  created_at: string;
};

export type Booking = {
  id: string;
  booking_reference: string;

  user_id: string | null;
  room_id: string;

  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;

  check_in: string;
  check_out: string;

  adults: number;
  children: number;
  number_of_guests: number;

  package_type: "BB" | "HB" | "FB" | "BO" | "DAY_REST" | null;

  payment_method: string | null;
  payment_status: string | null;
  mpesa_number: string | null;

  total_amount: number;

  booking_status: string | null;
  confirmation_status: string | null;

  special_requests: string | null;
  notes: string | null;

  created_at: string | null;
  updated_at: string | null;

  rooms?: Room;
  profiles?: Profile;
};