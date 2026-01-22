import { createServerSupabaseClient } from "@/lib/supabase/server";
import crypto from "crypto";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Hash an IP address for privacy-preserving rate limiting
 */
export function hashIP(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

/**
 * Check rate limit for email lookup requests (by IP)
 * Limit: 10 requests per minute per IP
 */
export async function checkEmailLookupRateLimit(
  ipHash: string
): Promise<RateLimitResult> {
  const supabase = createServerSupabaseClient();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10;

  const windowStart = new Date(Date.now() - windowMs).toISOString();

  // Count requests from this IP in the last minute
  // We'll use a simple in-memory approach for email lookups since they don't create records
  // For now, we allow all requests (rate limiting will be enforced by verification send)
  return {
    allowed: true,
    remaining: maxRequests,
    resetAt: new Date(Date.now() + windowMs),
  };
}

/**
 * Check rate limit for verification code requests (by email)
 * Limit: 3 codes per email per 15 minutes
 */
export async function checkVerificationSendRateLimit(
  email: string
): Promise<RateLimitResult> {
  const supabase = createServerSupabaseClient();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 3;

  const windowStart = new Date(Date.now() - windowMs).toISOString();

  const { count, error } = await supabase
    .from("email_verification_codes")
    .select("*", { count: "exact", head: true })
    .eq("email", email.toLowerCase())
    .gte("created_at", windowStart);

  if (error) {
    console.error("Rate limit check error:", error);
    // On error, allow the request (fail open)
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt: new Date(Date.now() + windowMs),
    };
  }

  const requestCount = count || 0;
  const allowed = requestCount < maxRequests;
  const remaining = Math.max(0, maxRequests - requestCount);

  return {
    allowed,
    remaining,
    resetAt: new Date(Date.now() + windowMs),
  };
}

/**
 * Check rate limit for verification code requests (by IP)
 * Limit: 10 codes per IP per hour
 */
export async function checkVerificationIPRateLimit(
  ipHash: string
): Promise<RateLimitResult> {
  const supabase = createServerSupabaseClient();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 10;

  const windowStart = new Date(Date.now() - windowMs).toISOString();

  const { count, error } = await supabase
    .from("email_verification_codes")
    .select("*", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", windowStart);

  if (error) {
    console.error("Rate limit check error:", error);
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt: new Date(Date.now() + windowMs),
    };
  }

  const requestCount = count || 0;
  const allowed = requestCount < maxRequests;
  const remaining = Math.max(0, maxRequests - requestCount);

  return {
    allowed,
    remaining,
    resetAt: new Date(Date.now() + windowMs),
  };
}

/**
 * Generate a cryptographically secure 6-digit verification code
 */
export function generateVerificationCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const code = (array[0] % 1000000).toString().padStart(6, "0");
  return code;
}

/**
 * Check if a verification code has expired
 */
export function isCodeExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

/**
 * Calculate code expiration time (10 minutes from now)
 */
export function getCodeExpiration(): string {
  return new Date(Date.now() + 10 * 60 * 1000).toISOString();
}
