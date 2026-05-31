import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from '@/lib/i18n-config';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin routes: i18n bypassed, auth enforced (login page open)
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login' || pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }
    // Token check via NextAuth session cookie
    const sessionCookie =
      req.cookies.get('authjs.session-token') ??
      req.cookies.get('__Secure-authjs.session-token') ??
      req.cookies.get('next-auth.session-token') ??
      req.cookies.get('__Secure-next-auth.session-token');
    if (!sessionCookie) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Skip API + static
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
