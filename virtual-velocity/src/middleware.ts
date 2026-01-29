import { defineMiddleware } from 'astro:middleware';
import { isAuthenticated } from './lib/auth';

/**
 * Middleware to protect admin routes
 *
 * Redirects unauthenticated users to login page
 * Allows access to login/logout API routes
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Allow login and logout routes
  if (pathname === '/admin/login' || pathname === '/api/auth/login' || pathname === '/api/auth/logout') {
    return next();
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated(context.request)) {
      return context.redirect('/admin/login');
    }
  }

  // Protect admin API endpoints (GET requests for data retrieval)
  if (pathname.startsWith('/api/') && context.request.method === 'GET') {
    // Only protect GET endpoints that return sensitive data
    const protectedEndpoints = ['/api/contact', '/api/testimonial', '/api/newsletter'];
    if (protectedEndpoints.some(ep => pathname.startsWith(ep))) {
      if (!isAuthenticated(context.request)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Unauthorized' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }
  }

  return next();
});
