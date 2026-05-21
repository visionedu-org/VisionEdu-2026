import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifyAccessToken,
} from "@/server/auth/jwt";

function getTokenFromCookie(request: NextRequest): string | null {
  const raw = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

async function parseSession(request: NextRequest) {
  const token = getTokenFromCookie(request);
  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload?.sub || !payload.role) return null;

  const expMs = payload.exp ? payload.exp * 1000 : 0;
  if (expMs && Date.now() > expMs) return null;

  return {
    role: payload.role as "student" | "teacher",
    token,
    exp: expMs,
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await parseSession(request);

  const isAuthRoute =
    pathname === "/login" ||
    pathname.startsWith("/register/") ||
    pathname === "/termos" ||
    pathname === "/privacidade";

  const isStudentRoute = pathname.startsWith("/student");
  const isTeacherRoute = pathname.startsWith("/teacher");

  if (session && isAuthRoute) {
    const dest =
      session.role === "student" ? "/student/dashboard" : "/teacher/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (!session && (isStudentRoute || isTeacherRoute)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isStudentRoute && session.role !== "student") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (session && isTeacherRoute && session.role !== "teacher") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register/:path*",
    "/termos",
    "/privacidade",
    "/student/:path*",
    "/teacher/:path*",
    "/unauthorized",
  ],
};
