'use client'
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Phone, ChevronRight, ChevronLeft, Check, CreditCard,
  Smartphone, Mail, User, Users, Building2, Shield, ArrowLeft,
  Sun, ClipboardList,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type PackageType = 'HALF_DAY' | 'FULL_DAY';
type PaymentOption = 'pay_now' | 'pay_on_arrival';
type PaymentMethod = 'mpesa' | 'visa' | 'mastercard';

interface ConferenceHall {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  image: string | null;
  capacity: number;
  half_day_price: number;
  full_day_price: number;
  features: string[] | null;
  status: 'Available' | 'Unavailable' | 'Maintenance';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function generateBookingRef() {
  return 'ECH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

const PACKAGE_LABELS: Record<PackageType, string> = {
  HALF_DAY: 'Half Day',
  FULL_DAY: 'Full Day',
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function ConferenceBookNow() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);

  // Selected hall
  const [selectedHall, setSelectedHall] = useState<ConferenceHall | null>(null);
  const [loadingHall, setLoadingHall] = useState(true);

  async function loadSelectedHall(id: string) {
    setLoadingHall(true);
    try {
      const { data, error } = await supabase
        .from('conference_halls')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setSelectedHall(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHall(false);
    }
  }

  useEffect(() => {
    const id = searchParams.get('hall');
    if (id) loadSelectedHall(id);
    else setLoadingHall(false);
  }, [searchParams]);

  // Step 1 state
  const [packageType, setPackageType] = useState<PackageType>('FULL_DAY');
  const [eventDate, setEventDate] = useState('');
  const [delegates, setDelegates] = useState(1);

  // Step 2 state
  const [organizationName, setOrganizationName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Step 3 state
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('pay_on_arrival');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');

  // UI state
  const [loading, setLoading] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [error, setError] = useState('');

  // ─── Derived values ───────────────────────────────────────────────────────
  const exceedsCapacity = !!selectedHall && delegates > selectedHall.capacity;

  const pricePerHead = selectedHall
    ? (packageType === 'HALF_DAY' ? selectedHall.half_day_price : selectedHall.full_day_price)
    : 0;

  const totalAmount = pricePerHead * (delegates || 0);

  // ─── Validation ───────────────────────────────────────────────────────────
  const canProceedStep1 =
    !!selectedHall &&
    !!eventDate &&
    delegates > 0 &&
    !exceedsCapacity;

  const canProceedStep2 = !!organizationName && !!contactPerson && !!phone;

  // ─── Handlers ─────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!selectedHall) return;
    setLoading(true);
    setError('');
    const ref = generateBookingRef();

    try {
      const resolvedPaymentMethod =
        paymentOption === 'pay_on_arrival'
          ? 'Pay on Arrival'
          : paymentMethod === 'mpesa' ? 'M-Pesa' : paymentMethod === 'visa' ? 'Visa' : 'Mastercard';

      const bookingPayload = {
        booking_reference: ref,
        hall_id: selectedHall.id,
        organization_name: organizationName,
        contact_person: contactPerson,
        email: email || null,
        phone,
        event_date: eventDate,
        delegates,
        package_type: packageType,
        purpose: purpose || null,
        special_requests: specialRequests || null,
        payment_method: resolvedPaymentMethod,
        payment_status: 'pending',
        booking_status: 'pending',
        total_amount: totalAmount,
      };

      const { data: booking, error: bookingError } = await supabase
        .from('conference_bookings')
        .insert(bookingPayload)
        .select('id')
        .single();

      if (bookingError) throw bookingError;

      if (booking) {
        const { error: paymentError } = await supabase.from('conference_payments').insert({
          booking_id: booking.id,
          merchant_reference: ref,
          payment_method: resolvedPaymentMethod,
          amount: totalAmount,
          currency: 'KES',
          payment_status: 'pending',
        });
        if (paymentError) throw paymentError;
      }

      setBookingRef(ref);
      setStep(4);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ─── Shared summary card ──────────────────────────────────────────────────
  function PriceSummary() {
    return (
      <div className="bg-sanctuary-50 p-5 border-l-4 border-gold-400">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-serif text-sanctuary-900 text-[15px]">{selectedHall?.name}</p>
            <p className="font-sans text-sanctuary-500 text-[12px]">
              {PACKAGE_LABELS[packageType]} •{' '}
              {`${delegates || 0} delegate${delegates !== 1 ? 's' : ''} × KSh ${pricePerHead.toLocaleString()}`}
            </p>
          </div>
          <p className="font-serif text-sanctuary-900 text-xl">KSh {totalAmount.toLocaleString()}</p>
        </div>
      </div>
    );
  }

  if (loadingHall) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        Loading conference hall...
      </section>
    );
  }

  if (!selectedHall) {
    return (
      <section className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-serif">Conference hall not found</h2>
        <button onClick={() => router.push('/#conferences')} className="btn-gold">
          Browse Conference Halls
        </button>
      </section>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <section
      id="book-conference"
      className="relative min-h-screen py-28 overflow-hidden bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: "url('/conferncecenter.jpeg')",
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-5 py-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 mb-10"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="text-center mb-16">
          <p className="section-label mb-4 text-gold-400">Reservations</p>
          <div className="section-divider mb-6" />
          <h2
            className="font-serif text-white mb-5"
            style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', lineHeight: '1.15', textShadow: '0 4px 20px rgba(0,0,0,.6)' }}
          >
            Book Your
            <br />
            <span className="text-gradient-gold">Conference Hall</span>
          </h2>
          <p className="font-sans text-white/90 max-w-xl mx-auto leading-relaxed text-[15px]">
            Select your package, date and number of delegates for {selectedHall.name}.
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

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 font-sans text-sm rounded">
              {error}
            </div>
          )}

          {/* ── Step 1: Package, Date & Delegates ── */}
          {step === 1 && (
            <div className="space-y-8">
              <h3 className="font-serif text-sanctuary-900 text-xl">Step 1: Package, Date &amp; Delegates</h3>

              <div className="rounded-xl border border-sanctuary-100 overflow-hidden">
                <img
                  src={selectedHall.image || '/board-room1.jpeg'}
                  alt={selectedHall.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="font-serif text-2xl">{selectedHall.name}</h3>
                  {selectedHall.description && (
                    <p className="mt-2 text-sanctuary-600">{selectedHall.description}</p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-sanctuary-500">
                    <span className="flex items-center gap-1.5">
                      <Users size={13} /> Max {selectedHall.capacity} delegates
                    </span>
                  </div>
                </div>
              </div>

              {/* Package */}
              <div>
                <label className="block font-sans text-[11px] text-sanctuary-400 tracking-wider uppercase mb-2">
                  Package
                </label>
                <div className="grid sm:grid-cols-2 gap-4">
                  {(['HALF_DAY', 'FULL_DAY'] as PackageType[]).map((pkg) => {
                    const price = pkg === 'HALF_DAY' ? selectedHall.half_day_price : selectedHall.full_day_price;
                    return (
                      <button
                        key={pkg}
                        onClick={() => setPackageType(pkg)}
                        className={`p-5 border-2 transition-all text-left
                          ${packageType === pkg ? 'border-gold-500 bg-gold-50' : 'border-sanctuary-100 hover:border-sanctuary-200'}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Sun size={16} className={packageType === pkg ? 'text-gold-600' : 'text-sanctuary-400'} />
                          <p className="font-serif text-sanctuary-900 text-[15px]">{PACKAGE_LABELS[pkg]}</p>
                        </div>
                        <p className="font-sans text-sanctuary-500 text-[12px]">
                          KSh {price.toLocaleString()} per head
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-[11px] text-sanctuary-400 tracking-wider uppercase mb-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-4 py-3 bg-cream-50 border border-sanctuary-100 font-sans text-sanctuary-700 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[11px] text-sanctuary-400 tracking-wider uppercase mb-2">
                    <Users size={12} className="inline mr-1" />Number of Delegates
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={selectedHall.capacity}
                    value={delegates}
                    onChange={(e) => setDelegates(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-3 bg-cream-50 border border-sanctuary-100 font-sans text-sanctuary-700 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>
              </div>

              {exceedsCapacity && (
                <p className="text-red-600 text-sm font-sans">
                  This hall accommodates a maximum of <strong>{selectedHall.capacity} delegates</strong>.
                  Please reduce the number of delegates or choose a larger hall.
                </p>
              )}

              {!exceedsCapacity && delegates > 0 && (
                <p className="font-sans text-[11px] text-sanctuary-400">
                  {delegates} / {selectedHall.capacity} delegates
                </p>
              )}

              {selectedHall && delegates > 0 && eventDate && !exceedsCapacity && <PriceSummary />}

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="btn-gold inline-flex items-center gap-2 disabled:opacity-40 cursor-pointer"
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Organization Details ── */}
          {step === 2 && (
            <div className="space-y-8">
              <h3 className="font-serif text-sanctuary-900 text-xl">Step 2: Organization Details</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-[11px] text-sanctuary-400 tracking-wider uppercase mb-2">
                    <Building2 size={12} className="inline mr-1" />Organization Name
                  </label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Grace Fellowship Church"
                    className="w-full px-4 py-3 bg-cream-50 border border-sanctuary-100 font-sans text-sanctuary-700 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[11px] text-sanctuary-400 tracking-wider uppercase mb-2">
                    <User size={12} className="inline mr-1" />Contact Person
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-cream-50 border border-sanctuary-100 font-sans text-sanctuary-700 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-[11px] text-sanctuary-400 tracking-wider uppercase mb-2">
                    <Phone size={12} className="inline mr-1" />Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 792888828"
                    className="w-full px-4 py-3 bg-cream-50 border border-sanctuary-100 font-sans text-sanctuary-700 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[11px] text-sanctuary-400 tracking-wider uppercase mb-2">
                    <Mail size={12} className="inline mr-1" />Email Address (optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-cream-50 border border-sanctuary-100 font-sans text-sanctuary-700 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-[11px] text-sanctuary-400 tracking-wider uppercase mb-2">
                  <ClipboardList size={12} className="inline mr-1" />Purpose of Event (optional)
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Annual leadership seminar"
                  className="w-full px-4 py-3 bg-cream-50 border border-sanctuary-100 font-sans text-sanctuary-700 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                />
              </div>

              <div>
                <label className="block font-sans text-[11px] text-sanctuary-400 tracking-wider uppercase mb-2">
                  Special Requests (optional)
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Extra microphones, seating layout, dietary needs..."
                  rows={3}
                  className="w-full px-4 py-3 bg-cream-50 border border-sanctuary-100 font-sans text-sanctuary-700 text-sm focus:outline-none focus:border-gold-400 transition-colors resize-none"
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
                  className="btn-gold inline-flex items-center gap-2 disabled:opacity-40 cursor-pointer"
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

              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentOption('pay_now')}
                  className={`p-5 border-2 transition-all text-center
                    ${paymentOption === 'pay_now' ? 'border-gold-500 bg-gold-50' : 'border-sanctuary-100 hover:border-sanctuary-200'}`}
                >
                  <CreditCard size={24} className={`mx-auto mb-2 ${paymentOption === 'pay_now' ? 'text-gold-600' : 'text-sanctuary-400'}`} />
                  <p className="font-serif text-sanctuary-900 text-[14px]">Pay Now</p>
                  <p className="font-sans text-sanctuary-400 text-[11px]">Secure your reservation immediately</p>
                </button>
                <button
                  onClick={() => setPaymentOption('pay_on_arrival')}
                  className={`p-5 border-2 transition-all text-center
                    ${paymentOption === 'pay_on_arrival' ? 'border-gold-500 bg-gold-50' : 'border-sanctuary-100 hover:border-sanctuary-200'}`}
                >
                  <Shield size={24} className={`mx-auto mb-2 ${paymentOption === 'pay_on_arrival' ? 'text-gold-600' : 'text-sanctuary-400'}`} />
                  <p className="font-serif text-sanctuary-900 text-[14px]">Reserve & Pay on Arrival</p>
                  <p className="font-sans text-sanctuary-400 text-[11px]">Hold the hall, settle payment on the day</p>
                </button>
              </div>

              {paymentOption === 'pay_now' && (
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
              )}

              {/* Dark summary */}
              <div className="bg-sanctuary-900 p-6 text-cream-50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-serif text-gold-400 text-[15px]">{selectedHall.name}</p>
                    <p className="font-sans text-cream-100 text-[12px]">
                      {organizationName} · {PACKAGE_LABELS[packageType]} · {eventDate} ·{' '}
                      {delegates} delegate{delegates !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <p className="font-serif text-gold-400 text-2xl">KSh {totalAmount.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 text-cream-100 text-[11px]">
                  <Shield size={12} />
                  <span>
                    {paymentOption === 'pay_now'
                      ? `Secure ${paymentMethod === 'mpesa' ? 'M-Pesa' : paymentMethod === 'visa' ? 'Visa' : 'Mastercard'} payment`
                      : 'Reservation held, payable on arrival'}
                  </span>
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
                  {loading ? 'Processing...' : paymentOption === 'pay_now' ? 'Confirm & Pay' : 'Confirm Reservation'} <ChevronRight size={16} />
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
              <h3 className="font-serif text-sanctuary-900 text-2xl">Reservation Confirmed!</h3>
              <p className="font-sans text-sanctuary-600 max-w-md mx-auto leading-relaxed text-[15px]">
                Thank you, {contactPerson}. Your conference hall reservation has been received
                {paymentOption === 'pay_now' ? ' and is pending payment confirmation.' : ' and is pending confirmation. Payment is due on arrival.'}
              </p>

              <div className="bg-sanctuary-50 p-6 inline-block">
                <p className="font-sans text-[11px] text-sanctuary-400 tracking-wider uppercase mb-1">Booking Reference</p>
                <p className="font-serif text-sanctuary-900 text-2xl tracking-widest">{bookingRef}</p>
              </div>

              <div className="bg-cream-50 p-5 max-w-sm mx-auto text-left space-y-2">
                {[
                  { label: 'Hall', value: selectedHall.name },
                  { label: 'Package', value: PACKAGE_LABELS[packageType] },
                  { label: 'Date', value: eventDate },
                  { label: 'Delegates', value: String(delegates) },
                  { label: 'Organization', value: organizationName },
                  {
                    label: 'Payment',
                    value: paymentOption === 'pay_now'
                      ? (paymentMethod === 'mpesa' ? 'M-Pesa' : paymentMethod === 'visa' ? 'Visa' : 'Mastercard')
                      : 'Pay on Arrival',
                  },
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
                <a href="tel:+254792888828" className="text-gold-600 underline">+254 700 123 456</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}