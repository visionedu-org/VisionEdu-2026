import type { AuthResponse } from "@/types/domain";
import { buildSessionCookieHeader } from "./jwt";

export function jsonWithSessionCookie(
  body: AuthResponse,
  status = 200
): Response {
  const headers = new Headers({
    "Content-Type": "application/json",
  });
  headers.append(
    "Set-Cookie",
    buildSessionCookieHeader(body.access_token, body.expires_in)
  );

  return new Response(JSON.stringify(body), { status, headers });
}
