import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const AUTH_COOKIE_NAME = 'auth_token';
const JWT_SECRET =
  process.env.JWT_SECRET || 'trading_masterclass_pro_fallback_secret_key_2026';

const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets, favicon, Next.js internals, and public API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/lessons/') ||
    pathname.startsWith('/public/') ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  let decodedUser: { id: number; role: string; status: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      decodedUser = {
        id: Number(payload.id),
        role: String(payload.role),
        status: String(payload.status),
      };
    } catch {
      decodedUser = null;
    }
  }

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isAdminPath = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isProtectedApi = pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/');

  // If already logged in & active and visits login or register -> redirect to home
  if (isAuthPage) {
    if (decodedUser && decodedUser.status === 'active') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Public auth API endpoints
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // If not logged in or invalid token
  if (!decodedUser || decodedUser.status !== 'active') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: 'Yêu cầu đăng nhập hoặc tài khoản chưa kích hoạt.' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only protection
  if (isAdminPath) {
    if (decodedUser.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, message: 'Quyền truy cập bị từ chối: Yêu cầu quyền Quản trị viên.' },
          { status: 403 }
        );
      }
      // Redirect regular users to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Forward user headers to downstream routes
  const response = NextResponse.next();
  response.headers.set('x-user-id', String(decodedUser.id));
  response.headers.set('x-user-role', decodedUser.role);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
