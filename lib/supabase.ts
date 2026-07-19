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
export type RoomCategory = {
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

  featured: boolean | null;
  active: boolean | null;

  display_order: number | null;

  bb_single_price: number | null;
  bb_double_price: number | null;

  hb_single_price: number | null;
  hb_double_price: number | null;

  fb_single_price: number | null;
  fb_double_price: number | null;
};

export type Room = {
  id: string;
  room_number: string;

  category_id: string | null;

  room_name: string;

  status: string | null;

  rating: number | null;

  featured: boolean | null;

  created_at: string | null;
  updated_at: string | null;

  room_categories?: RoomCategory;
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