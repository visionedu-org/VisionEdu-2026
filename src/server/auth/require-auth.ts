/**
 * Autenticação JWT para Route Handlers (`/api/v1/*`).
 *
 * @example
 * ```ts
 * const { userId } = await requireTeacher(request);
 * ```
 */
import type { UserRole } from "@/types/domain";
import {
  SESSION_COOKIE_NAME,
  verifyAccessToken,
} from "@/server/auth/jwt";

export class AuthRequiredError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "AuthRequiredError";
  }
}

export interface AuthenticatedRequest {
  userId: string;
  role: UserRole;
}

function extractBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

function extractCookieToken(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name !== SESSION_COOKIE_NAME) continue;
    const raw = rest.join("=");
    if (!raw) return null;
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  return null;
}

function extractToken(request: Request): string | null {
  return extractBearerToken(request) ?? extractCookieToken(request);
}

export async function requireAuth(request: Request): Promise<AuthenticatedRequest> {
  const token = extractToken(request);
  if (!token) {
    throw new AuthRequiredError(401, "unauthorized", "Autenticação necessária");
  }

  const payload = await verifyAccessToken(token);
  if (!payload?.sub || !payload.role) {
    throw new AuthRequiredError(401, "unauthorized", "Sessão inválida ou expirada");
  }

  return { userId: payload.sub, role: payload.role };
}

export async function requireTeacher(request: Request): Promise<AuthenticatedRequest> {
  const auth = await requireAuth(request);
  if (auth.role !== "teacher") {
    throw new AuthRequiredError(
      403,
      "forbidden",
      "Acesso permitido apenas para professores"
    );
  }
  return auth;
}

export async function requireStudent(request: Request): Promise<AuthenticatedRequest> {
  const auth = await requireAuth(request);
  if (auth.role !== "student") {
    throw new AuthRequiredError(
      403,
      "forbidden",
      "Acesso permitido apenas para estudantes"
    );
  }
  return auth;
}

/** Leitura de provas/questões ENEM (professor ou estudante autenticado). */
export async function requireStudentOrTeacher(
  request: Request
): Promise<AuthenticatedRequest> {
  const auth = await requireAuth(request);
  if (auth.role !== "student" && auth.role !== "teacher") {
    throw new AuthRequiredError(
      403,
      "forbidden",
      "Acesso permitido apenas para estudantes ou professores"
    );
  }
  return auth;
}
