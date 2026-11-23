import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AdminSecure2026!";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@slideshow.internal";
const ADMIN_SECRET = process.env.ADMIN_SESSION_SECRET || "visitor-slideshow-admin-session-secret-salt-2026";

interface SessionPayload {
  role: "admin";
  email: string;
  iat: number;
  exp: number;
}

/**
 * Validates provided password against configured admin password using timing-safe comparison.
 */
export function verifyAdminCredentials(password: string, email?: string): boolean {
  if (!password) return false;

  // If email is provided, check matching email
  if (email && email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return false;
  }

  const expectedBuffer = Buffer.from(ADMIN_PASSWORD);
  const providedBuffer = Buffer.from(password);

  if (expectedBuffer.length !== providedBuffer.length) {
    // Constant time dummy comparison to mitigate timing attacks
    crypto.timingSafeEqual(expectedBuffer, expectedBuffer);
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

/**
 * Signs and generates a cryptographic session token.
 */
export function createSessionToken(email: string = ADMIN_EMAIL): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    role: "admin",
    email,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(payloadBase64)
    .digest("base64url");

  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies the integrity and validity of an admin session token.
 */
export function verifySessionToken(token: string): { valid: boolean; email?: string } {
  if (!token || typeof token !== "string") {
    return { valid: false };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false };
  }

  const [payloadBase64, providedSig] = parts;

  // Verify HMAC signature using timing safe equal
  const expectedSig = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(payloadBase64)
    .digest("base64url");

  const providedSigBuf = Buffer.from(providedSig);
  const expectedSigBuf = Buffer.from(expectedSig);

  if (providedSigBuf.length !== expectedSigBuf.length) {
    return { valid: false };
  }

  if (!crypto.timingSafeEqual(providedSigBuf, expectedSigBuf)) {
    return { valid: false };
  }

  try {
    const payloadStr = Buffer.from(payloadBase64, "base64url").toString("utf-8");
    const payload: SessionPayload = JSON.parse(payloadStr);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return { valid: false }; // Expired
    }

    if (payload.role !== "admin") {
      return { valid: false };
    }

    return { valid: true, email: payload.email };
  } catch {
    return { valid: false };
  }
}

/**
 * Attaches the authenticated admin HttpOnly cookie to a NextResponse.
 */
export function setAdminCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Clears the admin session cookie from a NextResponse.
 */
export function clearAdminCookie(response: NextResponse): void {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Verifies admin authentication on API routes from NextRequest.
 */
export function verifyAdminApiRequest(request: NextRequest): { authenticated: boolean; email?: string } {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return { authenticated: false };
  }

  const result = verifySessionToken(token);
  return { authenticated: result.valid, email: result.email };
}

/**
 * Verifies admin authentication in Next.js Server Components.
 */
export async function getAdminServerSession(): Promise<{ authenticated: boolean; email?: string }> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return { authenticated: false };
    const result = verifySessionToken(token);
    return { authenticated: result.valid, email: result.email };
  } catch {
    return { authenticated: false };
  }
}

export function getAdminEmail(): string {
  return ADMIN_EMAIL;
}
