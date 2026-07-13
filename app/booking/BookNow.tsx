'use client'
import { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';
// import { rooms } from "@/lib/rooms";
import { supabase } from '@/lib/supabase';
import {
  Phone, ChevronRight, ChevronLeft, Check, CreditCard,
  Smartphone, Mail, User, Calendar, Users, Shield, ArrowLeft
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type PackageType = 'BB' | 'HB' | 'FB' | 'BO' | 'DAY_REST';
type PaymentMethod = 'mpesa' | 'visa' | 'mastercard';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function generateBookingRef() {
  return 'ECR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function nightsBetween(start: string, end: string) {
  if (!start || !end) return 0;
  const diff = Math.ceil(
    (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff > 0 ? diff : 0;
}


const PACKAGE_LABELS: Record<PackageType, string> = {
  BB: 'Bed & Breakfast',
  HB: 'Half Board',
  FB: 'Full Board',
  BO: 'Bed Only',
  DAY_REST: 'Day Rest',
};

const VALID_PACKAGES: PackageType[] = ['BB', 'HB', 'FB', 'BO', 'DAY_REST'];

// ─── Component ───────────────────────────────────────────────────────────────
export default function BookNow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Step
  const [step, setStep] = useState(1);

  // Step 1 state
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [availability, setAvailability] = useState(0);
  const [packageType, setPackageType] = useState<PackageType>('BB');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const [loadingCategory, setLoadingCategory] = useState(true);
  
async function loadSelectedCategory(id: string) {
  setLoadingCategory(true);

  try {
    const { data, error } = await supabase
      .from("room_categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    setSelectedCategory(data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingCategory(false);
  }
}

  useEffect(() => {
  const id = searchParams.get("category");

  if (id) {
    loadSelectedCategory(id);
  }
}, [searchParams]);


  async function checkAvailability(categoryId: string) {

  if (!checkIn) return;

  const { count } = await supabase
    .from("rooms")
    .select("*", { count: "exact", head: true })
    .eq("category_id", categoryId)
    .eq("status", "available");

  setAvailability(count || 0);
}

useEffect(() => {

  if(selectedCategory){

      checkAvailability(selectedCategory.id);

  }

}, [selectedCategory, checkIn, checkOut]);



  // Step 2 state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Step 3 state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');

  // UI state
  const [loading, setLoading] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [error, setError] = useState('');

  // ─── Read URL params ──────────────────────────────────────────────────────
  useEffect(() => {
    
    const pkgParam = searchParams.get('package') as PackageType | null;

    if (pkgParam && VALID_PACKAGES.includes(pkgParam)) setPackageType(pkgParam);
  }, [searchParams]);

  // ─── Derived values ───────────────────────────────────────────────────────
  const nights = nightsBetween(checkIn, checkOut);

const selectedPrice =
  selectedCategory
    ? selectedCategory[`${packageType.toLowerCase()}_price`] ?? 0
    : 0;

const totalAmount =
  packageType === "DAY_REST"
    ? selectedPrice
    : selectedPrice * nights;
  
  // ─── Handlers ─────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setLoading(true);
    setError('');
    const ref = generateBookingRef();

    const { data: room, error: roomError } = await supabase
  .from("rooms")
  .select("id")
  .eq("category_id", selectedCategory.id)
  .eq("status", "Available")
  .limit(1)
  .single();
  
  if (roomError || !room) {
  throw new Error("No rooms are available for this category.");
}

    try {
      const bookingPayload = {
  booking_reference: ref,

  room_id: room.id,

  guest_name: name,
  guest_email: email,
  guest_phone: phone,

  check_in: checkIn,
  check_out: checkOut,

  number_of_guests: guests,

  package_type: packageType,

  payment_method:
    paymentMethod === "mpesa"
      ? "M-Pesa"
      : paymentMethod,

  payment_status: "pending",

  total_amount: totalAmount,

  booking_status: "pending",
};

console.log("BOOKING PAYLOAD", bookingPayload);

const { error: bookingError } = await supabase
  .from("bookings")
  .insert(bookingPayload);
  //     const { error: bookingError } = await supabase
  // .from("bookings")
  // .insert({
  //   booking_reference: ref,

  //   room_id: room.id,

  //   guest_name: name,
  //   guest_email: email,
  //   guest_phone: phone,

  //   check_in: checkIn,
  //   check_out: checkOut,

  //   number_of_guests: guests,

  //   package_type: packageType,

  //   payment_method:
  //     paymentMethod === "mpesa"
  //       ? "M-Pesa"
  //       : paymentMethod,

  //   payment_status: "pending",

  //   total_amount: totalAmount,

  //   booking_status: "pending",
  // });

      if (bookingError) {
  console.log("BOOKING ERROR:", bookingError);
  throw bookingError;
}
    const { error: roomUpdateError } = await supabase
  .from("rooms")
  .update({
    status: "Reserved",
  })
  .eq("id", room.id);

if (roomUpdateError) throw roomUpdateError;

      const { data: bookingData } = await supabase
        .from('bookings')
        .select('id')
        .eq('booking_reference', ref)
        .single();

      if (bookingData) {
        await supabase.from('payments').insert({
          booking_id: bookingData.id,
          merchant_reference: ref,
          payment_method:
            paymentMethod === 'mpesa' ? 'M-Pesa' :
            paymentMethod === 'visa' ? 'Visa' : 'Mastercard',
          amount: totalAmount,
          currency: 'KES',
          payment_status: 'pending',
        });
      }

      setBookingRef(ref);
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ─── Validation ───────────────────────────────────────────────────────────
  const canProceedStep1 =
    selectedCategory &&
    checkIn &&
    (packageType === "DAY_REST" || checkOut) &&
    guests > 0 &&
    (packageType === "DAY_REST" || nights > 0);
  const canProceedStep2 = name && email && phone;

  // ─── Shared summary card ──────────────────────────────────────────────────
  function PriceSummary() {
    return (
      <div className="bg-sanctuary-50 p-5 border-l-4 border-gold-400">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-serif text-sanctuary-900 text-[15px]">{selectedCategory?.name}</p>
            <p className="font-sans text-sanctuary-500 text-[12px]">
              {PACKAGE_LABELS[packageType]} •{' '}
              {packageType === 'DAY_REST'
                ? `KSh ${selectedPrice.toLocaleString()}`
                : `${nights} night${nights !== 1 ? 's' : ''} × KSh ${selectedPrice.toLocaleString()}`}
            </p>
          </div>
          <p className="font-serif text-sanctuary-900 text-xl">KSh {totalAmount.toLocaleString()}</p>
        </div>
      </div>
    );
  }

  if (loadingCategory) {
  return (
    <section className="min-h-screen flex items-center justify-center">
      Loading room...
    </section>
  );
}

if (!selectedCategory) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-serif">Room not found</h2>

      <button
        onClick={() => router.push("/#rooms")}
        className="btn-gold"
      >
        Browse Rooms
      </button>
    </section>
  );
}
// "relative min-h-screen py-20 overflow-hidden bg-cover bg-center"
  // ─── Render ───────────────────────────────────────────────────────────────
 return (
  <section
    id="book"
    className="relative min-h-screen py-28 overflow-hidden bg-cover bg-center bg-fixed"
    style={{
      backgroundImage: "url('/view.jpeg')",
      backgroundRepeat: "no-repeat",
    }}
  >
    {/* Dark overlay */}
    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

    {/* Optional luxury glow */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
    </div>

    {/* Content */}
    <div className="relative z-10 max-w-5xl mx-auto px-6">

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-5 py-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 mb-10"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Header */}
      <div className="text-center mb-16">
        <p className="section-label mb-4 text-gold-400">
          Reservations
        </p>

        <div className="section-divider mb-6" />

        <h2
          className="font-serif text-white mb-5"
          style={{
            fontSize: "clamp(2rem,4vw,3.2rem)",
            lineHeight: "1.15",
            textShadow: "0 4px 20px rgba(0,0,0,.6)",
          }}
        >
          Book Your
          <br />
          <span className="text-gradient-gold">Stay</span>
        </h2>

        <p className="font-sans text-white/90 max-w-xl mx-auto leading-relaxed text-[15px]">
          Select your room, dates and preferred payment method.
          A pastor is available on call for spiritual support during your stay.
        </p>
      </div>

        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-10">

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-4 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-sans text-sm font-medium transition-all
                  ${step >= s ? 'bg-sanctuary-900 text-gold-400' : 'bg-sanctuary-100 text-sanctuary-400'}`}>
                  {step > s ? <Check size={18} /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-0.5 transition-all ${step > s ? 'bg-sanctuary-900' : 'bg-sanctuary-100'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 font-sans text-sm rounded">
              {error}
            </div>
          )}

          {/* ── Step 1: Room & Dates ── */}
          {step === 1 && (
            <div className="space-y-8">
              <h3 className="font-serif text-sanctuary-900 text-xl">Step 1: Select Room Package & Dates</h3>

              <div className="rounded-xl border border-sanctuary-100 overflow-hidden">
    <img
  src={selectedCategory?.image}
  alt={selectedCategory?.name}
  className="w-full h-64 object-cover"
/>
    <div className="p-6">

        <h3 className="font-serif text-2xl">
            {selectedCategory?.name}
        </h3>

        <p className="mt-2 text-sanctuary-600">
            {selectedCategory?.description}
        </p>

        <div className="mt-4 flex gap-6">
            <span>
                From KSh {(selectedCategory?.bb_price ?? 0).toLocaleString()}
            </span>

        </div>

    </div>

</div>

              {/* Meal plan */}
              <div>
                <label className="block font-sans text-[11px] text-sanctuary-400 tracking-wider uppercase mb-2">
                  Package
                </label>
                <select
                  value={packageType}
                  onChange={(e) => setPackageType(e.target.value as PackageType)}
                  className="w-full px-4 py-3 bg-cream-50 border border-sanctuary-100 font-sans text-sanctuary-700 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                >
                  {selectedCategory && (
<>
    {selectedCategory.bb_price > 0 && (
        <option value="BB">
            Bed & Breakfast — KSh {(selectedCategory?.bb_price ?? 0).toLocaleString()}
        </option>
    )}

    {selectedCategory.hb_price > 0 && (
        <option value="HB">
            Half Board — KSh {(selectedCategory?.hb_price ?? 0).toLocaleString()}
        </option>
    )}

    {selectedCategory.fb_price > 0 && (
        <option value="FB">
            Full Board — KSh {(selectedCategory?.fb_price ?? 0).toLocaleString()}
        </option>
    )}

    {selectedCategory.bo_price > 0 && (
        <option value="BO">
            Bed Only — KSh {(selectedCategory?.bo_price ?? 0).toLocaleString()}
        </option>
    )}

    {selectedCategory.day_rest_price > 0 && (
        <option value="DAY_REST">
            Day Rest — KSh {selectedCategory.day_rest_price.toLocaleString()}
        </option>
    )}
</>
)}
                </select>
              </div>

              {/* Dates & guests */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-sans text-[11px] text-sanctuary-400 tracking-wider uppercase mb-2">
                    <Calendar size={12} className="inline mr-1" />Check-in
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-cream-50 border border-sanctuary-100 font-sans text-sanctuary-700 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[11px] text-sanctuary-400 tracking-wider uppercase mb-2">
                    <Calendar size={12} className="inline mr-1" />Check-out
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    disabled={packageType === 'DAY_REST'}
                    className="w-full px-4 py-3 bg-cream-50 border border-sanctuary-100 font-sans text-sanctuary-700 text-sm focus:outline-none focus:border-gold-400 transition-colors disabled:opacity-40"
                  />
                  {packageType === 'DAY_REST' && (
                    <p className="text-[11px] text-sanctuary-400 mt-1">Not required for Day Rest</p>
                  )}
                </div>
                <div>
                  <label className="block font-sans text-[11px] text-sanctuary-400 tracking-wider uppercase mb-2">
                    <Users size={12} className="inline mr-1" />Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-cream-50 border border-sanctuary-100 font-sans text-sanctuary-700 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                  >
                    {[1, 2, 3, 4].map((g) => (
                      <option key={g} value={g}>{g} Guest{g > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price summary — only show when we have enough info */}
              {selectedCategory && (packageType === 'DAY_REST' || nights > 0) && (
                <PriceSummary />
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="btn-gold inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Guest Details ── */}
          {step === 2 && (
            <div className="space-y-8">
              <h3 className="font-serif text-sanctuary-900 text-xl">Step 2: Guest Details</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-[11px] text-sanctuary-400 tracking-wider uppercase mb-2">
                    <User size={12} className="inline mr-1" />Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-cream-50 border border-sanctuary-100 font-sans text-sanctuary-700 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[11px] text-sanctuary-400 tracking-wider uppercase mb-2">
                    <Phone size={12} className="inline mr-1" />Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 700 123 456"
                    className="w-full px-4 py-3 bg-cream-50 border border-sanctuary-100 font-sans text-sanctuary-700 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-[11px] text-sanctuary-400 tracking-wider uppercase mb-2">
                  <Mail size={12} className="inline mr-1" />Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 bg-cream-50 border border-sanctuary-100 font-sans text-sanctuary-700 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                />
              </div>

              <PriceSummary />

              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="btn-outline-gold inline-flex items-center gap-2">
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  className="btn-gold inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Payment ── */}
          {step === 3 && (
            <div className="space-y-8">
              <h3 className="font-serif text-sanctuary-900 text-xl">Step 3: Payment</h3>

              <div className="grid sm:grid-cols-3 gap-4">
                {(['mpesa', 'visa', 'mastercard'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`p-5 border-2 transition-all text-center
                      ${paymentMethod === method ? 'border-gold-500 bg-gold-50' : 'border-sanctuary-100 hover:border-sanctuary-200'}`}
                  >
                    {method === 'mpesa'
                      ? <Smartphone size={28} className={`mx-auto mb-3 ${paymentMethod === method ? 'text-gold-600' : 'text-sanctuary-400'}`} />
                      : <CreditCard size={28} className={`mx-auto mb-3 ${paymentMethod === method ? 'text-gold-600' : 'text-sanctuary-400'}`} />
                    }
                    <p className="font-serif text-sanctuary-900 text-[14px] capitalize">
                      {method === 'mpesa' ? 'M-Pesa' : method === 'visa' ? 'Visa' : 'Mastercard'}
                    </p>
                    <p className="font-sans text-sanctuary-400 text-[11px]">
                      {method === 'mpesa' ? 'Mobile money' : 'Credit / Debit'}
                    </p>
                  </button>
                ))}
              </div>

              {/* Dark summary */}
              <div className="bg-sanctuary-900 p-6 text-cream-50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-serif text-gold-400 text-[15px]">{selectedCategory?.name}</p>
                    <p className="font-sans text-cream-100 text-[12px]">
                      {name} · {PACKAGE_LABELS[packageType]} ·{' '}
                      {packageType === 'DAY_REST' ? 'Day visit' : `${nights} night${nights !== 1 ? 's' : ''}`} ·{' '}
                      {guests} guest{guests > 1 ? 's' : ''}
                    </p>
                  </div>
                  <p className="font-serif text-gold-400 text-2xl">KSh {totalAmount.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 text-cream-100 text-[11px]">
                  <Shield size={12} />
                  <span>Secure {paymentMethod === 'mpesa' ? 'M-Pesa' : paymentMethod === 'visa' ? 'Visa' : 'Mastercard'} payment</span>
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(2)} className="btn-outline-gold inline-flex items-center gap-2">
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-gold inline-flex items-center gap-2 disabled:opacity-40"
                >
                  {loading ? 'Processing...' : 'Confirm & Pay'} <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Confirmation ── */}
          {step === 4 && (
            <div className="text-center space-y-6 py-8">
              <div className="w-16 h-16 bg-sanctuary-900 rounded-full flex items-center justify-center mx-auto">
                <Check size={32} className="text-gold-400" />
              </div>
              <h3 className="font-serif text-sanctuary-900 text-2xl">Booking Confirmed!</h3>
              <p className="font-sans text-sanctuary-600 max-w-md mx-auto leading-relaxed text-[15px]">
                Thank you, {name}. Your booking has been received and is pending payment confirmation.
                A confirmation email has been sent to {email}.
              </p>

              <div className="bg-sanctuary-50 p-6 inline-block">
                <p className="font-sans text-[11px] text-sanctuary-400 tracking-wider uppercase mb-1">Booking Reference</p>
                <p className="font-serif text-sanctuary-900 text-2xl tracking-widest">{bookingRef}</p>
              </div>

              <div className="bg-cream-50 p-5 max-w-sm mx-auto text-left space-y-2">
                {[
                  { label: 'Room', value: selectedCategory?.name },
                  { label: 'Package', value: PACKAGE_LABELS[packageType] },
                  { label: 'Dates', value: packageType === 'DAY_REST' ? checkIn : `${checkIn} → ${checkOut}` },
                  { label: 'Guests', value: guests },
                  { label: 'Payment', value: paymentMethod === 'mpesa' ? 'M-Pesa' : paymentMethod === 'visa' ? 'Visa' : 'Mastercard' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between font-sans text-[13px]">
                    <span className="text-sanctuary-400">{label}</span>
                    <span className="text-sanctuary-900">{value}</span>
                  </div>
                ))}
                <div className="border-t border-sanctuary-100 pt-2 mt-2 flex justify-between font-sans text-[14px] font-medium">
                  <span className="text-sanctuary-900">Total</span>
                  <span className="text-sanctuary-900">KSh {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <p className="font-sans text-sanctuary-400 text-[12px]">
                Need help? Call us at{' '}
                <a href="tel:+254700123456" className="text-gold-600 underline">+254 700 123 456</a>
              </p>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}