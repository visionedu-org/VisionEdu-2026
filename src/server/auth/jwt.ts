import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { UserRole } from "@/types/domain";

export const SESSION_COOKIE_NAME = "visionedu_session";

export interface AccessTokenPayload extends JWTPayload {
  sub: string;
  role: UserRole;
  email: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export function expiresInForRole(role: UserRole): number {
  if (role === "student") {
    return Number(process.env.JWT_EXPIRES_IN_STUDENT ?? 28800);
  }
  return Number(process.env.JWT_EXPIRES_IN_TEACHER ?? 86400);
}

export async function signAccessToken(params: {
  userId: string;
  role: UserRole;
  email: string;
}): Promise<{ token: string; expiresIn: number }> {
  const expiresIn = expiresInForRole(params.role);
  const token = await new SignJWT({
    role: params.role,
    email: params.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(params.userId)
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .sign(getSecret());

  return { token, expiresIn };
}

export async function verifyAccessToken(
  token: string
): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sub = payload.sub;
    const role = payload.role as UserRole | undefined;
    const email = payload.email as string | undefined;

    if (!sub || !role || !email) return null;
    if (role !== "student" && role !== "teacher") return null;

    return { sub, role, email, iat: payload.iat, exp: payload.exp };
  } catch {
    return null;
  }
}

export function buildSessionCookieHeader(
  token: string,
  maxAgeSeconds: number
): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export function buildClearSessionCookieHeader(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
