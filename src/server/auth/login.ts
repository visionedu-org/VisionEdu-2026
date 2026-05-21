import { prisma } from "@/lib/prisma";
import type { AuthResponse, UserRole } from "@/types/domain";
import { verifyPassword } from "./password";
import { signAccessToken } from "./jwt";
import { cargoToRole } from "./cargo";
import { mapUserToDomain, userInclude } from "./user-mapper";

export class AuthLoginError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "AuthLoginError";
  }
}

export async function loginUser(params: {
  email: string;
  password: string;
  role?: UserRole;
}): Promise<AuthResponse> {
  const email = params.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    include: userInclude,
  });

  if (!user) {
    throw new AuthLoginError("E-mail ou senha incorretos", 401);
  }

  const valid = await verifyPassword(params.password, user.passwordHash);
  if (!valid) {
    throw new AuthLoginError("E-mail ou senha incorretos", 401);
  }

  const userRole = cargoToRole(user.cargo);

  if (params.role && userRole !== params.role) {
    throw new AuthLoginError(
      "Perfil não corresponde ao tipo de acesso selecionado",
      401
    );
  }

  const { token, expiresIn } = await signAccessToken({
    userId: user.id,
    role: userRole,
    email: user.email,
  });

  return {
    access_token: token,
    expires_in: expiresIn,
    user: mapUserToDomain(user),
  };
}
