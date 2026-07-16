'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Monitor, Wifi, Coffee, Projector, Mic, Presentation, Sun } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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

const amenities = [
  { icon: Wifi, label: 'High-Speed WiFi' },
  { icon: Monitor, label: 'AV Equipment' },
  { icon: Coffee, label: 'Catering' },
  { icon: Projector, label: 'Projection' },
  { icon: Mic, label: 'Sound System' },
  { icon: Presentation, label: 'Flipcharts' },
];

export default function Conferences() {
  const router = useRouter();
  const [halls, setHalls] = useState<ConferenceHall[]>([]);
  const [activeSpace, setActiveSpace] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHalls();
  }, []);

  async function loadHalls() {
  setLoading(true);

  const { data, error } = await supabase
    .from("conference_halls")
    .select("*");

  console.log("Conference halls:", data);
  console.log("Conference error:", error);

  if (!error) {
    setHalls(data ?? []);
  }

  setLoading(false);
}
  const goToBooking = (hall: ConferenceHall) => {
    router.push(`/conference-booking?hall=${hall.id}`);
  };

  if (loading) {
    return (
      <section className="py-28">
        <div className="text-center">Loading conference halls...</div>
      </section>
    );
  }

  if (halls.length === 0) {
    return null;
  }

  const current = halls[activeSpace] ?? halls[0];

  console.log(current);
  return (
    <section id="conferences" className="py-28 bg-sanctuary-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 ">
          <p className="section-label mb-4">Conferencing</p>
          <div className="section-divider mb-6" />
          <h2 className="font-serif text-sanctuary-900 mb-5" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', lineHeight: '1.15' }}>
            Conference Facilities
            <br />
            <span className="text-gradient-gold">for Every Gathering</span>
          </h2>
          <p className="font-sans text-sanctuary-600 max-w-xl mx-auto leading-relaxed" style={{ fontSize: '17px' }}>
            Excellent conference facilities are available to all organizations that desire to mix business,
            team building and relaxation. State-of-the-art technology in a serene environment.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {halls.map((hall, i) => (
                <button
                  key={hall.id}
                  onClick={() => setActiveSpace(i)}
                  className={`text-left p-5 transition-all duration-300 cursor-none card-luxury
                    ${activeSpace === i
                      ? 'bg-sanctuary-900 text-cream-50'
                      : 'bg-cream-50 text-sanctuary-700 hover:bg-cream-100'
                    }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className={`font-serif text-[15px] ${activeSpace === i ? 'text-gold-400' : ''}`}>
                      {hall.name}
                    </h4>
                    {hall.status !== 'Available' && (
                      <span className="font-sans text-[9px] tracking-wider uppercase px-2 py-0.5 bg-red-500/20 text-red-500 rounded-full flex-shrink-0">
                        {hall.status}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 font-sans text-[11px] opacity-70">
                    <Users size={11} />up to {hall.capacity} delegates
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-cream-50 p-8 card-luxury">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-sanctuary-900 text-xl">{current.name}</h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                <div className="flex items-center justify-between bg-cream-100 px-4 py-3">
                  <span className="flex items-center gap-2 font-sans text-[12px] text-sanctuary-500">
                    <Sun size={13} className="text-gold-500" /> Half Day
                  </span>
                  <span className="font-sans text-[13px] text-gold-600 font-medium">
                    KSh {current.half_day_price.toLocaleString()} / head
                  </span>
                </div>
                <div className="flex items-center justify-between bg-cream-100 px-4 py-3">
                  <span className="flex items-center gap-2 font-sans text-[12px] text-sanctuary-500">
                    <Sun size={13} className="text-gold-500" /> Full Day
                  </span>
                  <span className="font-sans text-[13px] text-gold-600 font-medium">
                    KSh {current.full_day_price.toLocaleString()} / head
                  </span>
                </div>
              </div>

              {current.description && (
                <p className="font-sans text-sanctuary-600 mb-6" style={{ fontSize: '15px' }}>
                  {current.description}
                </p>
              )}

              {current.features && current.features.length > 0 && (
                <ul className="space-y-3 mb-8">
                  {current.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 font-sans text-sanctuary-600" style={{ fontSize: '15px' }}>
                      <div className="w-1.5 h-1.5 bg-gold-500 rounded-full flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => goToBooking(current)}
                disabled={current.status !== 'Available'}
                className="btn-gold inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {current.status === 'Available' ? 'Book Conference Hall' : current.status}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="aspect-[1/0.8] overflow-hidden mb-8">
              <div key={current.id} className="aspect-[1/0.8] overflow-hidden mb-8 animate-fadeIn">
                <img
                  src={current.image || '/board-room1.jpeg'}
                  alt={current.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {amenities.map((amenity) => {
                const Icon = amenity.icon;
                return (
                  <div key={amenity.label} className="bg-cream-50 p-4 text-center card-luxury">
                    <Icon size={20} className="text-gold-500 mx-auto mb-2" />
                    <span className="font-sans text-[10px] text-sanctuary-600 tracking-wider uppercase">
                      {amenity.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}