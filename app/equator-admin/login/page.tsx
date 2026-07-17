'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notAuthorized = searchParams.get('error') === 'not_authorized';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setError(null);
  setLoading(true);

  console.log("1. Signing in...");

  const { data, error: signInError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  console.log("2. Sign in response", { data, signInError });

  if (signInError) {
    setError(signInError.message);
    setLoading(false);
    return;
  }

  console.log("3. Fetching profile...");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", data.user.id)
    .maybeSingle();

  console.log("4. Profile:", profile);
  console.log("5. Profile Error:", profileError);

  if (profileError) {
    setError(profileError.message);
    setLoading(false);
    return;
  }

  if (!profile?.is_admin) {
    await supabase.auth.signOut();
    setError("This account does not have admin access.");
    setLoading(false);
    return;
  }
  const session = await supabase.auth.getSession();
console.log("Session:", session);

const user = await supabase.auth.getUser();
console.log("User:", user);

  console.log("6. Redirecting...");
  console.log(document.cookie);
  router.push("/equator-admin");
  router.refresh();

  setLoading(false);
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-5"
      >
        <div>
          <h1 className="text-xl font-semibold text-white">Equator Admin</h1>
          <p className="text-sm text-slate-400 mt-1">Sign in to manage the resort.</p>
        </div>

        {notAuthorized && (
          <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
            That account doesn&apos;t have admin access.
          </div>
        )}
        {error && (
          <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm text-slate-300 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 transition-colors cursor-pointer"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}