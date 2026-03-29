import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login'];
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export async function proxy(request: NextRequest) {
  // Demo mode: skip all auth checks — the client handles demo session
  if (DEMO_MODE) {
    return NextResponse.next();
  }

  // Production mode: validate Supabase session
  const { createMiddlewareSupabaseClient } = await import(
    '@/lib/supabase/middleware'
  );
  const { supabase, response } = createMiddlewareSupabaseClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Not authenticated and trying to access protected route → redirect to login
  if (!user && !isPublicRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated and on login page → redirect to service-orders
  if (user && pathname === '/login') {
    const ordersUrl = request.nextUrl.clone();
    ordersUrl.pathname = '/service-orders';
    return NextResponse.redirect(ordersUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
