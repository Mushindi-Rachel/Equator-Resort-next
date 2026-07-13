'use client';

import { Eye } from 'lucide-react';
import Image from "next/image";
import { useRouter} from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase";

interface RoomCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  badge: string | null;
  bb_price: number;
  hb_price: number;
  fb_price: number;
  bo_price: number;
  day_rest_price: number;
  display_order: number;
}
const amenities = [
    "Free WiFi",
    "Smart TV",
    "Breakfast Included",
    "Hot Shower",
    "Room Service",
];

export default function Rooms() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<RoomCategory[]>([]);

useEffect(() => {
  loadCategories();
}, []);

async function loadCategories() {
  setLoading(true);

  try {
    const { data, error } = await supabase
      .from("room_categories")
      .select("*")
      .order("display_order");

    if (error) throw error;

    setCategories(data ?? []);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}

    const goToBooking = (categoryId: string) => {
  router.push(`/booking?category=${categoryId}`);
};
if (loading) {
  return (
    <section className="py-28">
      <div className="text-center">
        Loading rooms...
      </div>
    </section>
  );
}

console.log(categories);

  return (
    <section id="rooms" className="py-28 bg-sanctuary-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
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
          {categories.map((category) => (
            <div key={category.id} className="bg-white card-luxury group">
              <div className="img-overlay aspect-[4/3] overflow-hidden relative">
                <Image
  src={category.image}
  alt={category.name}
  fill
  unoptimized
  className="object-cover"
/>
                {category.badge && (
                  <div className="absolute top-4 left-4 z-20 bg-gold-500 text-sanctuary-900 px-3 py-1">
                    <span className="font-sans text-[10px] font-bold tracking-widest uppercase">{category.badge}</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-serif text-xl text-sanctuary-900">
  {category.name}
</h3>

{/* <p className="mt-2 text-sm text-sanctuary-600 line-clamp-3">
  {category.description}
</p> */}
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-[11px] text-sanctuary-400 uppercase tracking-wider">from</p>
                    <p className="font-display text-sanctuary-900 text-2xl">KSh {(category.bb_price ?? 0).toLocaleString()}</p>
                    <p className="font-sans text-[11px] text-sanctuary-400">BB (Bed & Breakfast)</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Eye size={12} className="text-gold-500" />
                  <span className="font-sans text-[12px] text-sanctuary-500">Serene View</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {amenities.map((a) => (
                    <span key={a} className="bg-sanctuary-50 text-sanctuary-600 font-sans text-[10px] px-2 py-0.5">&#10003; {a}</span>
                  ))}
                </div>

                <button
                onClick={() => goToBooking(category.id)}
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
