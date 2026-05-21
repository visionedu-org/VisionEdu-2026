import { buildClearSessionCookieHeader } from "@/server/auth/jwt";

export async function POST() {
  const headers = new Headers({ "Content-Type": "application/json" });
  headers.append("Set-Cookie", buildClearSessionCookieHeader());
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
