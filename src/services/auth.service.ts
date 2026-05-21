import { apiClient } from "@/lib/api-client";
import type { AuthResponse, UserRole } from "@/types/domain";
import type {
  LoginFormValues,
  RegisterStudentFormValues,
  RegisterTeacherFormValues,
} from "@/lib/validations/auth";

export class AuthService {
  async login(
    email: string,
    password: string,
    role: UserRole
  ): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/api/v1/auth/login", {
      email,
      password,
      role,
    });
  }

  async loginWithForm(values: LoginFormValues): Promise<AuthResponse> {
    return this.login(values.email, values.password, values.role);
  }

  async registerStudent(
    values: RegisterStudentFormValues
  ): Promise<AuthResponse> {
    const { termsAccepted: _terms, ...payload } = values;
    void _terms;
    return apiClient.post<AuthResponse>("/api/v1/auth/register", {
      ...payload,
      role: "student",
    });
  }

  async registerTeacher(
    values: RegisterTeacherFormValues
  ): Promise<AuthResponse> {
    const { termsAccepted: _terms, ...payload } = values;
    void _terms;
    return apiClient.post<AuthResponse>("/api/v1/auth/register", {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: "teacher",
      classes: payload.classes,
    });
  }
}

export const authService = new AuthService();
