import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: don't remove this — it refreshes the auth token if expired.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("========== MIDDLEWARE ==========");
console.log("Path:", request.nextUrl.pathname);
console.log("User:", user);
console.log("Cookies:", request.cookies.getAll());

  const path = request.nextUrl.pathname;
  const isLoginRoute = path === '/equator-admin/login';

  // Protect every /equator-admin route except the login page itself.
  if (path.startsWith('/equator-admin') && !isLoginRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/equator-admin/login';
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile?.is_admin) {
      const url = request.nextUrl.clone();
      url.pathname = '/equator-admin/login';
      url.searchParams.set('error', 'not_authorized');
      return NextResponse.redirect(url);
    }
  }

  // If an already-authenticated admin lands on the login page, bounce them in.
  if (isLoginRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.is_admin) {
      const url = request.nextUrl.clone();
      url.pathname = '/equator-admin';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}