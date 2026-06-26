'use client'  
import { useState } from 'react';
import Image from 'next/image';
import { Phone, UtensilsCrossed, Clock, MapPin, ChefHat, Users, Coffee, Building2 } from 'lucide-react';

const menus = [
  {
    name: 'Continental Breakfast',
    items: ['Fresh tropical fruits', 'Eggs any style', 'Freshly baked bread', 'Kenyan tea & coffee', 'Fresh juices'],
    time: '7:00 AM - 10:00 AM',
    image: 'breakfast.avif'
  },
  {
    name: 'Lunch Buffet',
    items: ['Seasonal salads', 'Grilled meats & fish', 'Vegetarian options', 'Local Kenyan dishes', 'Fresh desserts'],
    time: '12:30 PM - 2:30 PM',
    image: 'roasted-meat2.jpeg',
  },
  {
    name: 'Dinner Service',
    items: ['Chef\'s special', 'Farm-to-table vegetables', 'Fresh catch of the day', 'Artisan breads', 'Decadent desserts'],
    time: '6:30 PM - 9:30 PM',
    image: 'dinner2.jfif',
  },
];

export default function Restaurant() {
  const [activeMenu, setActiveMenu] = useState(0);

  return (
    <section id="dining" className="py-28 bg-sanctuary-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <p className="section-label mb-4">Dining</p>
          <div className="section-divider mb-6" />
          <h2 className="font-serif text-sanctuary-900 mb-5" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', lineHeight: '1.15' }}>
            Nourishment for
            <br />
            <span className="text-gradient-gold">Body & Soul</span>
          </h2>
          <p className="font-sans text-sanctuary-600 max-w-xl mx-auto leading-relaxed" style={{ fontSize: '17px' }}>
            Farm-to-table dining that honors both the land and the fellowship of sharing a meal together.
            Our kitchen prepares wholesome meals to sustain you during your retreat.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="reveal reveal-right">
            
              <div className="aspect-[4/3] overflow-hidden">
                <div
                  key={activeMenu}
                  className="aspect-[1/0.8] overflow-hidden mb-8 animate-fadeIn"
                >
                  <img
                    src={menus[activeMenu].image}
                    alt={menus[activeMenu].name}
                    className="w-full h-full object-cover"
                  />
            
              </div>
              <div className="absolute -bottom-6 -right-0 bg-sanctuary-900 p-6 card-luxury">
                <div className="flex items-center gap-3 text-gold-400 mb-2">
                  <ChefHat size={20} />
                  <span className="font-serif text-lg text-cream-50">Farm-to-Table</span>
                </div>
                <p className="font-sans text-cream-100 text-[13px] leading-relaxed">
                  Fresh, locally sourced ingredients prepared with care
                </p>
              </div>
            </div>
          </div>

          <div className="reveal reveal-left">
            <div className="flex gap-2 mb-8">
              {menus.map((menu, i) => (
                <button
                  key={menu.name}
                  onClick={() => setActiveMenu(i)}
                  className={`flex-1 py-3 px-4 font-sans text-[11px] tracking-wider uppercase transition-all duration-300 cursor-none
                    ${activeMenu === i
                      ? 'bg-sanctuary-900 text-gold-400'
                      : 'bg-sanctuary-100 text-sanctuary-600 hover:bg-sanctuary-200'
                    }`}
                >
                  {menu.name.split(' ')[0]}
                </button>
              ))}
            </div>

            <div className="bg-cream-50 p-8 card-luxury">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-sanctuary-900 text-xl">{menus[activeMenu].name}</h3>
                <span className="flex items-center gap-1.5 font-sans text-[11px] text-sanctuary-400">
                  <Clock size={12} />{menus[activeMenu].time}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {menus[activeMenu].items.map((item) => (
                  <li key={item} className="flex items-center gap-3 font-sans text-sanctuary-600" style={{ fontSize: '15px' }}>
                    <UtensilsCrossed size={14} className="text-gold-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 mb-6 font-sans text-[12px] text-sanctuary-400">
                <MapPin size={14} />
                <span>Main Dining Hall & Outdoor Terrace</span>
              </div>
              <a
                href="tel:+254700123456"
                className="btn-gold inline-flex items-center gap-2"
              >
                <Phone size={14} />
                Call Now to Book Dining
              </a>
            </div>
          </div>
          {/* DINING HALL SECTION */}
        <div className="py-28 bg-sanctuary-50 overflow-hidden">
            {/* DINING HALL HEADER */}
            <div className="max-w-3xl mx-auto text-center mb-16">
              <p className="section-label mb-4">Dining Hall</p>


            <h3
              className="font-serif text-sanctuary-900"
              style={{
                fontSize: 'clamp(1.8rem,3vw,2.8rem)'
              }}
            >
              Elegant Dining
              <br />
              <span className="text-gradient-gold">
                In A Peaceful Setting
              </span>
            </h3>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Main Dining Hall Photo */}
            <div>
              <img
                src="/restaurant.webp"
                alt="Dining Hall"
                className="w-full h-[500px] object-cover rounded-xl shadow-lg"
              />
            </div>

            {/* Description */}
            <div>

              <p className="text-sanctuary-600 leading-relaxed mb-8">
                Our spacious dining hall provides a warm and
                welcoming atmosphere where guests gather to
                enjoy delicious meals, meaningful conversations,
                and moments of fellowship.
              </p>

              <div className="grid grid-cols-2 gap-4">

                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <Users
                    size={28}
                    className="text-gold-500 mb-3"
                  />
                  <h4 className="font-serif text-lg">
                    120+
                  </h4>
                  <p className="text-sm">
                    Seating Capacity
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <Coffee
                    size={28}
                    className="text-gold-500 mb-3"
                  />
                  <h4 className="font-serif text-lg">
                    Fresh Coffee
                  </h4>
                  <p className="text-sm">
                    Daily Service
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <Building2
                    size={28}
                    className="text-gold-500 mb-3"
                  />
                  <h4 className="font-serif text-lg">
                    Indoor Dining
                  </h4>
                  <p className="text-sm">
                    Spacious Hall
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <ChefHat
                    size={28}
                    className="text-gold-500 mb-3"
                  />
                  <h4 className="font-serif text-lg">
                    Local Cuisine
                  </h4>
                  <p className="text-sm">
                    Fresh Ingredients
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* DINING GALLERY */}
        <div>

          <div className="text-center mb-20">
            <h3 className="font-serif text-2xl text-sanctuary-900">
              Dining Gallery
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            <img
              src="/restaurant2.avif"
              alt=""
              className="h-72 w-full object-cover rounded-xl"
            />

            <img
              src="/event3.jpeg"
              alt=""
              className="h-72 w-full object-cover rounded-xl"
            />

             <img
              src="/couple-retreat.jfif"
              alt=""
              className="h-72 w-full object-cover rounded-xl"
            />

            



        </div>
        </div>
        </div>
      </div>
    </section>
  );
}
