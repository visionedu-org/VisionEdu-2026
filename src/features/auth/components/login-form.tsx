"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleSelector } from "./role-selector";
import type { UserRole } from "@/types/domain";

const LOGIN_ROLE_KEY = "visionedu_login_role";

function safeNextPath(next: string | null, role: UserRole): string | null {
  if (!next || !next.startsWith("/")) return null;
  if (role === "student" && next.startsWith("/student")) return next;
  if (role === "teacher" && next.startsWith("/teacher")) return next;
  return null;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "student",
    },
  });

  const role = useWatch({ control: form.control, name: "role" }) ?? "student";

  useEffect(() => {
    const stored = sessionStorage.getItem(LOGIN_ROLE_KEY) as UserRole | null;
    if (stored === "student" || stored === "teacher") {
      form.setValue("role", stored);
      sessionStorage.removeItem(LOGIN_ROLE_KEY);
    }
  }, [form]);

  const registerPath =
    role === "teacher" ? "/register/teacher" : "/register/student";

  async function onSubmit(values: LoginFormValues) {
    setRootError(null);
    try {
      const response = await authService.loginWithForm(values);
      setSession(response);
      const next = safeNextPath(searchParams.get("next"), values.role);
      router.push(
        next ??
          (values.role === "student"
            ? "/student/dashboard"
            : "/teacher/dashboard")
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setRootError(err.message);
        form.setError("email", { message: " " });
        form.setError("password", { message: " " });
      } else {
        setRootError("Não foi possível entrar. Tente novamente.");
      }
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full max-w-md space-y-5 mx-auto"
      noValidate
    >
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-foreground">Entrar</h1>
        <p className="text-sm text-muted-foreground">
          Acesse sua conta VisionEdu — Secretaria da Educação do Piauí
        </p>
      </div>

      {rootError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {rootError}
        </div>
      )}

      <RoleSelector
        value={role}
        onChange={(r) =>
          form.setValue("role", r as LoginFormValues["role"], {
            shouldValidate: true,
          })
        }
      />

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          className="min-h-11"
          aria-invalid={!!form.formState.errors.email}
          {...form.register("email")}
        />
        {form.formState.errors.email?.message &&
          form.formState.errors.email.message.trim() && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          className="min-h-11"
          aria-invalid={!!form.formState.errors.password}
          {...form.register("password")}
        />
        {form.formState.errors.password?.message && (
          <p className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full min-h-11" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Entrando…" : "Entrar"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link href={registerPath} className="text-primary font-medium underline-offset-2 hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
