import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Define authentication paths that should redirect when user is logged in
  const authRoutes = ['/login', '/register'];
  
  // Check if the path is one of the auth routes
  const isAuthRoute = authRoutes.some(route => path === route || path.startsWith(route + '/'));
  
  // Get the token from cookies or localStorage
  const token = request.cookies.get('access')?.value || '';
  
  // If the user is logged in and trying to access auth pages, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Continue with the request
  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ['/login', '/register'],
};