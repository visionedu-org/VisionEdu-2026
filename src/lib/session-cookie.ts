import type { UserRole } from "@/types/domain";
import { SESSION_COOKIE_NAME } from "@/server/auth/jwt";

export { SESSION_COOKIE_NAME };

export interface SessionCookiePayload {
  token: string;
  role: UserRole;
  exp: number;
}

/**
 * Cookie httpOnly é definido pelo servidor em login/register (Set-Cookie).
 * Use authService.logout() para invalidar a sessão no servidor.
 */
export function setSessionCookie(_payload: SessionCookiePayload) {
  // noop — sessão no cookie é gerenciada pelas Route Handlers
}

export function clearSessionCookie() {
  // noop — use authService.logout()
}

export function readSessionCookie(): SessionCookiePayload | null {
  return null;
}
