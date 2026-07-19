"use client";

import { useRouter } from "next/navigation";
import Navigation from '@/app/home/Navigation';
import Hero from '@/app/home/Hero';
import About from '@/app/home/About';
import Retreats from '@/app/home/Retreats';
import Rooms from '@/app/home/Rooms';
import Conferences from '@/app/home/Conference';
import Restaurant from '@/app/home/Restaurant';
import LatitudeZero from '@/app/home/LatitudeZero';
import Gallery from '@/app/home/Gallery';
import Blog from '@/app/home/Blog';
import Contact from '@/app/home/Contact';
import Footer from '@/app/home/Footer';


import AuthModal from '@/components/auth/AuthModal';


import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useAuth } from '@/hooks/useAuth';
import { useCursor } from '@/hooks/useCursor';
import { useScrollProgress } from '@/hooks/useScrollProgress';

export default function Page() {
  useScrollReveal();
  const router = useRouter();
  const {
    user,
    isAdmin,
    authOpen,
    setAuthOpen,
    adminOpen,
    setAdminOpen,
    bookNowOpen,
    setBookNowOpen,
    handleAuthSuccess,
    handleAdminOpen,
    signOut,
  } = useAuth();

  const { cursorDotRef, cursorOutlineRef } = useCursor();
  const scrollProgress = useScrollProgress();

  const openBookNow = () => {
  router.push("/rooms");
};

  return (
    <>
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      <div ref={cursorDotRef} className="cursor-dot" />
      <div ref={cursorOutlineRef} className="cursor-outline" />

      <Navigation
        onBookNow={openBookNow}
        user={user}
        isAdmin={isAdmin}
        onAdminOpen={handleAdminOpen}
        onSignOut={signOut}
        onSignIn={() => setAuthOpen(true)}
      />

      <main>
        <Hero onBookNow={openBookNow} />
        <About />
        <Retreats />
        <Rooms />
        <Conferences />
        <Restaurant />
        <LatitudeZero />
        <Gallery />
        <Blog />
        <Contact />
      </main>

      <Footer onBookNow={openBookNow} />

      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      
    </>
  );
}