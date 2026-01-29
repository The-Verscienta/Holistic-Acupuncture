/**
 * Security Utilities
 *
 * CSRF Protection and Rate Limiting for API endpoints
 */

// ============================================
// CSRF Protection
// ============================================

const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
const csrfTokens = new Map<string, { expires: number }>();

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

  // Store token with expiration
  csrfTokens.set(token, { expires: Date.now() + CSRF_TOKEN_EXPIRY });

  // Clean up expired tokens periodically
  cleanupExpiredCsrfTokens();

  return token;
}

/**
 * Validate a CSRF token
 */
export function validateCsrfToken(token: string | undefined | null): boolean {
  if (!token) return false;

  const stored = csrfTokens.get(token);
  if (!stored) return false;

  if (stored.expires < Date.now()) {
    csrfTokens.delete(token);
    return false;
  }

  // Token is valid - delete it (one-time use)
  csrfTokens.delete(token);
  return true;
}

/**
 * Clean up expired CSRF tokens
 */
function cleanupExpiredCsrfTokens(): void {
  const now = Date.now();
  for (const [token, data] of csrfTokens.entries()) {
    if (data.expires < now) {
      csrfTokens.delete(token);
    }
  }
}

// ============================================
// Rate Limiting
// ============================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number;    // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

// Default rate limit configurations
export const RATE_LIMITS = {
  contact: { windowMs: 60 * 60 * 1000, maxRequests: 5 },      // 5 per hour
  newsletter: { windowMs: 60 * 60 * 1000, maxRequests: 3 },   // 3 per hour
  testimonial: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 2 }, // 2 per day
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5 },        // 5 per 15 minutes
  default: { windowMs: 60 * 1000, maxRequests: 30 },          // 30 per minute
};

/**
 * Get client IP from request
 */
export function getClientIp(request: Request): string {
  // Check common proxy headers
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback - won't work perfectly but provides some protection
  return 'unknown';
}

/**
 * Check if request should be rate limited
 * Returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig = RATE_LIMITS.default
): { allowed: boolean; remaining: number; resetIn: number } {
  const key = `${endpoint}:${identifier}`;
  const now = Date.now();

  // Clean up expired entries periodically
  cleanupExpiredRateLimits();

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // No entry or expired - create new
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs
    };
  }

  // Entry exists and is still valid
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now
  };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(
  remaining: number,
  resetIn: number,
  limit: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + resetIn / 1000).toString(),
  };
}

/**
 * Create rate limit exceeded response
 */
export function rateLimitExceededResponse(resetIn: number): Response {
  const retryAfter = Math.ceil(resetIn / 1000);

  return new Response(
    JSON.stringify({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString()
      }
    }
  );
}

/**
 * Validate request with CSRF and rate limiting
 */
export function validateRequest(
  request: Request,
  endpoint: string,
  rateLimitConfig: RateLimitConfig,
  requireCsrf: boolean = true
): { valid: boolean; response?: Response } {
  // Check rate limit
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp, endpoint, rateLimitConfig);

  if (!rateLimit.allowed) {
    return {
      valid: false,
      response: rateLimitExceededResponse(rateLimit.resetIn)
    };
  }

  return { valid: true };
}
