export type PackageType = 'BB' | 'HB' | 'FB' | 'BO' | 'DAY_REST';
export type PaymentMethod = 'mpesa' | 'visa' | 'mastercard';

export interface Room {
  id: string;
  name: string;
  price: Partial<Record<PackageType, number>>;
  desc: string;
  image: string;
  maxGuests: number;
}

export interface BookingFormData {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  packageType: PackageType;
  name: string;
  email: string;
  phone: string;
  paymentMethod: PaymentMethod;
}