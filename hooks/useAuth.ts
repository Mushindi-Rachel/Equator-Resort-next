import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [bookNowOpen, setBookNowOpen] = useState(false);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle();

    setIsAdmin(data?.is_admin === true);
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      setUser(session?.user ?? null);

      if (session?.user) {
        await checkAdmin(session.user.id);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          await checkAdmin(session.user.id);
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    if (isAdmin) setAdminOpen(true);
  };

  const handleAdminOpen = () => {
    if (isAdmin) {
      setAdminOpen(true);
    } else {
      setAuthOpen(true);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
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
  };
}