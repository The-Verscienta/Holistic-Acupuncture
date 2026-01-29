/**
 * Authentication Utilities
 *
 * Simple cookie-based authentication for admin routes.
 * Uses a single admin password stored in environment variable.
 */

const COOKIE_NAME = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate the admin password
 */
export function validatePassword(password: string): boolean {
  const adminPassword = import.meta.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD environment variable not set');
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  if (password.length !== adminPassword.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < password.length; i++) {
    result |= password.charCodeAt(i) ^ adminPassword.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Create session cookie value with expiration
 */
export function createSession(): { token: string; expires: Date } {
  const token = generateSessionToken();
  const expires = new Date(Date.now() + SESSION_DURATION);
  return { token, expires };
}

/**
 * Session storage (in-memory for simplicity)
 * In production, consider using Redis or database
 */
const sessions = new Map<string, { expires: Date }>();

export function storeSession(token: string, expires: Date): void {
  // Clean up expired sessions
  const now = Date.now();
  for (const [key, value] of sessions.entries()) {
    if (value.expires.getTime() < now) {
      sessions.delete(key);
    }
  }

  sessions.set(token, { expires });
}

export function validateSession(token: string | undefined): boolean {
  if (!token) return false;

  const session = sessions.get(token);
  if (!session) return false;

  if (session.expires.getTime() < Date.now()) {
    sessions.delete(token);
    return false;
  }

  return true;
}

export function destroySession(token: string): void {
  sessions.delete(token);
}

/**
 * Parse cookies from request header
 */
export function parseCookies(cookieHeader: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name && rest.length > 0) {
      cookies[name] = rest.join('=');
    }
  });

  return cookies;
}

/**
 * Get session token from request
 */
export function getSessionFromRequest(request: Request): string | undefined {
  const cookies = parseCookies(request.headers.get('cookie'));
  return cookies[COOKIE_NAME];
}

/**
 * Check if request is authenticated
 */
export function isAuthenticated(request: Request): boolean {
  const token = getSessionFromRequest(request);
  return validateSession(token);
}

/**
 * Create Set-Cookie header for session
 */
export function createSessionCookie(token: string, expires: Date): string {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Expires=${expires.toUTCString()}`;
}

/**
 * Create Set-Cookie header to clear session
 */
export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export { COOKIE_NAME };
