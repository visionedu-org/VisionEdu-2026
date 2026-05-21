"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerStudentSchema,
  type RegisterStudentFormValues,
} from "@/lib/validations/auth";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { useCetiOptions } from "@/hooks/use-ceti-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LegalConsentBlock } from "./legal-consent-block";
import { ActivityCitySelect } from "./activity-city-select";
import { DEFAULT_ACTIVITY_CITY } from "@/lib/constants/activity-cities";

export function RegisterStudentForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const { schools, grades, getClasses, defaultSchoolId } = useCetiOptions();
  const [rootError, setRootError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const form = useForm<RegisterStudentFormValues>({
    resolver: zodResolver(registerStudentSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      city: DEFAULT_ACTIVITY_CITY,
      school_id: defaultSchoolId,
      grade: "2",
      class_identifier: "A",
      termsAccepted: false,
    },
  });

  const schoolId = form.watch("school_id");
  const grade = form.watch("grade");
  const classes = getClasses(schoolId, grade);

  async function onSubmit(values: RegisterStudentFormValues) {
    setRootError(null);
    try {
      const response = await authService.registerStudent({
        ...values,
        termsAccepted: true,
      });
      setSession(response);
      router.push("/student/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setRootError(err.message);
        if (err.fieldErrors) {
          Object.entries(err.fieldErrors).forEach(([field, message]) => {
            if (field in values) {
              form.setError(field as keyof RegisterStudentFormValues, {
                message,
              });
            }
          });
        }
      } else {
        setRootError("Não foi possível concluir o cadastro.");
      }
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full max-w-md space-y-4 mx-auto"
      noValidate
    >
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Cadastro de aluno</h1>
        <p className="text-sm text-muted-foreground">
          Piloto CETI Luiz Ubiraci de Carvalho
        </p>
      </div>

      {rootError && (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {rootError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <Input id="name" className="min-h-11" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" className="min-h-11" {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" className="min-h-11" {...form.register("password")} />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        )}
      </div>

      <ActivityCitySelect
        value={form.watch("city")}
        onChange={(v) =>
          form.setValue("city", v as RegisterStudentFormValues["city"], {
            shouldValidate: true,
          })
        }
        onBlur={() => form.trigger("city")}
        error={form.formState.errors.city?.message}
      />

      <div className="space-y-2">
        <Label htmlFor="school">Escola</Label>
        <select
          id="school"
          className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          {...form.register("school_id")}
        >
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="grade">Série</Label>
          <select
            id="grade"
            className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
            {...form.register("grade")}
          >
            {grades.map((g) => (
              <option key={g} value={g}>
                {g}º ano
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="class">Turma</Label>
          <select
            id="class"
            className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
            {...form.register("class_identifier")}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.class_identifier}>
                Turma {c.class_identifier}
              </option>
            ))}
          </select>
        </div>
      </div>

      <LegalConsentBlock
        showMinorNotice
        showLei15100
        checked={termsAccepted}
        onCheckedChange={(v) => {
          setTermsAccepted(v);
          form.setValue("termsAccepted", v, { shouldValidate: true });
        }}
        error={form.formState.errors.termsAccepted?.message}
      />

      <Button type="submit" className="w-full min-h-11" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Cadastrando…" : "Criar conta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="text-primary font-medium underline-offset-2 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
