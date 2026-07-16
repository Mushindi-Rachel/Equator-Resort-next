import {
  LayoutDashboard, Calendar, Plus, BedDouble, Users, CreditCard,
  Star, Wrench, BarChart3, FileText, Activity, Settings, Building2,
} from 'lucide-react';
import type { SidebarTab } from './types';

export const SIDEBAR_ITEMS: {
  key: SidebarTab;
  label: string;
  icon: React.ElementType;
  section?: string;
}[] = [
  { key: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { key: 'bookings',     label: 'Bookings',     icon: Calendar,   section: 'Operations' },
  { key: 'new-booking',  label: 'New Booking',  icon: Plus },
  { key: 'conference-bookings', label: 'Conference Bookings', icon: Building2},
  { key: 'rooms',        label: 'Rooms',        icon: BedDouble },
  { key: 'guests',       label: 'Guests',       icon: Users },
  { key: 'payments',     label: 'Payments',     icon: CreditCard },
  { key: 'reviews',      label: 'Reviews',      icon: Star },
  { key: 'housekeeping', label: 'Housekeeping', icon: Wrench },
  { key: 'analytics',    label: 'Analytics',    icon: BarChart3,  section: 'Insights' },
  { key: 'reports',      label: 'Reports',      icon: FileText },
  { key: 'activity',     label: 'Activity Log', icon: Activity },
  { key: 'settings',     label: 'Settings',     icon: Settings,   section: 'Admin' },
];