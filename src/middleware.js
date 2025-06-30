import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes
  const protectedPaths = ['/', '/library', '/recommendations', '/settings'];
  const authPaths = ['/auth/login', '/auth/signup'];

  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => req.nextUrl.pathname.startsWith(path));

  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (isAuthPath && session) {
    return NextResponse.redirect(new URL('/auth/profiles', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};