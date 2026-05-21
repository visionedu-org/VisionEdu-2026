import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "visionedu_session";

function parseSession(request: NextRequest) {
  const raw = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const payload = JSON.parse(decodeURIComponent(raw)) as {
      role: "student" | "teacher";
      exp: number;
      token: string;
    };
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = parseSession(request);

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
