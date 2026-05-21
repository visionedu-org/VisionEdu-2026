import type { UserRole } from "@/types/domain";

export const SESSION_COOKIE_NAME = "visionedu_session";

export interface SessionCookiePayload {
  token: string;
  role: UserRole;
  exp: number;
}

export function setSessionCookie(payload: SessionCookiePayload) {
  if (typeof document === "undefined") return;
  const maxAge = Math.max(0, Math.floor((payload.exp - Date.now()) / 1000));
  const value = encodeURIComponent(JSON.stringify(payload));
  document.cookie = `${SESSION_COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function readSessionCookie(): SessionCookiePayload | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split("=").slice(1).join("=")));
  } catch {
    return null;
  }
}
