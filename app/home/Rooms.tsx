'use client';

import { Eye } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const rooms = [
  {
    id: "standard-single",
    name: "Standard Single",
    price: 4500,
    size: "25 m²",
    image: "/single-standard-room.webp?auto=compress&cs=tinysrgb&w=800",
    category: "Standard",
    badge: "",
  },
  {
    id: "standard-double",
    name: "Standard Double",
    price: 5500,
    size: "30 m²",
    image: "/double-standard-room.webp?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "deluxe-single",
    name: "Deluxe Single",
    price: 6000,
    size: "35 m²",
    image: "/single-deluxe-room.avif?auto=compress&cs=tinysrgb&w=800",
    category: "Deluxe",
    badge: "",
  },
  {
    id: "deluxe-double",
    name: "Deluxe Double",
    price: 7000,
    size: "45 m²",
    image: "/doble-deluxe-room.jpeg?auto=compress&cs=tinysrgb&w=800",
    category: "Deluxe",
    badge: "Family Pick",
  },
  {
    id: "equator-suite",
    name: "Equator Suite Double",
    price: 16000,
    size: "80 m²",
    image: "/exec-room.webp?auto=compress&cs=tinysrgb&w=800",
    category: "Suite",
    badge: "Signature",
  },
];
export default function Rooms() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('room');
    if (id) setRoomId(id);
  }, [searchParams]);

  const goToBooking = (id: string) => {
    router.push(`/booking?room=${id}`);
  };


  return (
    <section id="rooms" className="py-28 bg-sanctuary-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <p className="section-label mb-4">Accommodations</p>
          <div className="section-divider mb-6" />
          <h2 className="font-serif text-sanctuary-900 mb-5" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', lineHeight: '1.15' }}>
            Rooms &amp; <span className="text-gradient-gold">Suites</span>
          </h2>
          <p className="font-sans text-sanctuary-600 max-w-xl mx-auto leading-relaxed" style={{ fontSize: '17px' }}>
            Excellent accommodation fitted with state-of-the-art ensuite facilities,
            free WiFi and Smart TV. Ideal for quiet reflection, fasting and prayer.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <div key={room.id} className="reveal reveal-scale bg-white card-luxury group">
              <div className="img-overlay aspect-[4/3] overflow-hidden relative">
                <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                {room.badge && (
                  <div className="absolute top-4 left-4 z-20 bg-gold-500 text-sanctuary-900 px-3 py-1">
                    <span className="font-sans text-[10px] font-bold tracking-widest uppercase">{room.badge}</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="section-label mb-1" style={{ fontSize: '10px' }}>{room.category} &middot; {room.size}</p>
                    <h3 className="font-serif text-sanctuary-900 text-xl">{room.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-[11px] text-sanctuary-400 uppercase tracking-wider">from</p>
                    <p className="font-display text-sanctuary-900 text-2xl">KSh {room.price.toLocaleString()}</p>
                    <p className="font-sans text-[11px] text-sanctuary-400">BB (Bed & Breakfast)</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Eye size={12} className="text-gold-500" />
                  <span className="font-sans text-[12px] text-sanctuary-500">Serene View</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {['Free WiFi', 'Smart TV', 'Breakfast Included', 'Hot Shower', 'Room Service'].map(a => (
                    <span key={a} className="bg-sanctuary-50 text-sanctuary-600 font-sans text-[10px] px-2 py-0.5">&#10003; {a}</span>
                  ))}
                </div>

                <button
                onClick={() => goToBooking(room.id)}
                className="btn-gold w-full justify-center text-[11px] py-3"
              >
                  Reserve This Room
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
