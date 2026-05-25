import { apiClient } from "@/lib/api-client";
import { AUTH_API } from "@/lib/api/auth-paths";
import type { AuthResponse } from "@/types/domain";
import type {
  LoginFormValues,
  RegisterStudentFormValues,
  RegisterTeacherFormValues,
} from "@/lib/validations/auth";

class AuthService {
  /** POST /api/v1/auth/login — role inferida pelo servidor a partir do cadastro */
  async login(email: string, password: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(AUTH_API.login, {
      email,
      password,
    });
  }

  async loginWithForm(values: LoginFormValues): Promise<AuthResponse> {
    return this.login(values.email, values.password);
  }

  /** POST /api/v1/auth/register — aluno */
  async registerStudent(
    values: RegisterStudentFormValues
  ): Promise<AuthResponse> {
    const { termsAccepted: _terms, ...payload } = values;
    void _terms;
    return apiClient.post<AuthResponse>(AUTH_API.register, {
      ...payload,
      role: "student",
    });
  }

  /** POST /api/v1/auth/register — professor */
  async registerTeacher(
    values: RegisterTeacherFormValues
  ): Promise<AuthResponse> {
    const { termsAccepted: _terms, ...payload } = values;
    void _terms;
    return apiClient.post<AuthResponse>(AUTH_API.register, {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      city: payload.city,
      role: "teacher",
      schools: payload.schools,
    });
  }

  /** POST /api/v1/auth/logout — limpa cookie httpOnly no servidor */
  async logout(): Promise<void> {
    await apiClient.post<{ ok: boolean }>(AUTH_API.logout, {});
  }
}

export const authService = new AuthService();
