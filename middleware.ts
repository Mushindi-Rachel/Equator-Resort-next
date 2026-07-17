import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Only run middleware on the admin routes — no need to touch
     * every request on the public site.
     */
    '/equator-admin/:path*',
  ],
};