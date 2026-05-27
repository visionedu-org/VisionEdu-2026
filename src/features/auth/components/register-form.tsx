"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerStudentSchema,
  registerTeacherSchema,
  type RegisterStudentFormValues,
  type RegisterTeacherFormValues,
} from "@/lib/validations/auth";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { useCetiOptions } from "@/hooks/use-ceti-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RoleSelector } from "./role-selector";
import { LegalConsentBlock } from "./legal-consent-block";
import { ActivityCitySelect } from "./activity-city-select";
import {
  TeacherSchoolsField,
  type TeacherAssignmentsFormValues,
} from "./teacher-schools-field";
import { defaultMateriasForClass } from "@/lib/validations/teacher-assignments";
import { DEFAULT_ACTIVITY_CITY } from "@/lib/constants/activity-cities";
import {
  getDefaultSchoolIdForCity,
  isSchoolInActivityCity,
} from "@/lib/constants/schools-by-city";
import { dashboardPathForRole } from "@/lib/auth-routes";
import type { UserRole } from "@/types/domain";

function parseRoleParam(value: string | null): UserRole {
  return value === "teacher" ? "teacher" : "student";
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);

  const role = parseRoleParam(searchParams.get("role"));
  const [rootError, setRootError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const studentForm = useForm<RegisterStudentFormValues>({
    resolver: zodResolver(registerStudentSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      city: DEFAULT_ACTIVITY_CITY,
      school_id: getDefaultSchoolIdForCity(DEFAULT_ACTIVITY_CITY),
      grade: "2",
      class_identifier: "A",
      termsAccepted: false,
    },
  });

  const teacherForm = useForm<RegisterTeacherFormValues>({
    resolver: zodResolver(registerTeacherSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      city: DEFAULT_ACTIVITY_CITY,
      schools: [
        {
          school_id: getDefaultSchoolIdForCity(DEFAULT_ACTIVITY_CITY),
          classes: [
            {
              grade: "2",
              class_identifier: "A",
              materias: defaultMateriasForClass(
                getDefaultSchoolIdForCity(DEFAULT_ACTIVITY_CITY),
                "2"
              ),
            },
          ],
        },
      ],
      termsAccepted: false,
    },
  });

  const activeForm = role === "student" ? studentForm : teacherForm;

  const studentCity =
    useWatch({ control: studentForm.control, name: "city" }) ??
    DEFAULT_ACTIVITY_CITY;
  const teacherCity =
    useWatch({ control: teacherForm.control, name: "city" }) ??
    DEFAULT_ACTIVITY_CITY;

  const {
    schools: studentSchools,
    grades,
    getClasses,
    defaultSchoolId: studentDefaultSchoolId,
  } = useCetiOptions(studentCity);

  const schoolId =
    useWatch({ control: studentForm.control, name: "school_id" }) ??
    studentDefaultSchoolId;
  const grade =
    useWatch({ control: studentForm.control, name: "grade" }) ?? "2";
  const classes = getClasses(schoolId, grade);

  useEffect(() => {
    if (!isSchoolInActivityCity(schoolId, studentCity)) {
      studentForm.setValue("school_id", studentDefaultSchoolId, {
        shouldValidate: true,
      });
    }
  }, [studentCity, schoolId, studentDefaultSchoolId, studentForm]);

  useEffect(() => {
    const currentSchools = teacherForm.getValues("schools");
    const allValid = currentSchools.every((entry) =>
      isSchoolInActivityCity(entry.school_id, teacherCity)
    );
    if (allValid) return;

    const nextSchoolId = getDefaultSchoolIdForCity(teacherCity);
    teacherForm.setValue(
      "schools",
      [
        {
          school_id: nextSchoolId,
          classes: [
            {
              grade: "2",
              class_identifier: "A",
              materias: defaultMateriasForClass(nextSchoolId, "2"),
            },
          ],
        },
      ],
      { shouldValidate: true }
    );
  }, [teacherCity, teacherForm]);

  function handleRoleChange(nextRole: UserRole) {
    setRootError(null);
    setTermsAccepted(false);
    router.replace(`/register?role=${nextRole}`, { scroll: false });
  }

  async function onSubmitStudent(values: RegisterStudentFormValues) {
    setRootError(null);
    try {
      const response = await authService.registerStudent({
        ...values,
        termsAccepted: true,
      });
      setSession(response);
      router.push(dashboardPathForRole("student"));
    } catch (err) {
      handleRegisterError(err, studentForm.setError, values);
    }
  }

  async function onSubmitTeacher(values: RegisterTeacherFormValues) {
    setRootError(null);
    try {
      const response = await authService.registerTeacher({
        ...values,
        termsAccepted: true,
      });
      setSession(response);
      router.push(dashboardPathForRole("teacher"));
    } catch (err) {
      handleRegisterError(err, teacherForm.setError, values);
    }
  }

  function handleRegisterError(
    err: unknown,
    setError: (...args: any[]) => void,
    values: RegisterStudentFormValues | RegisterTeacherFormValues
  ) {
    if (err instanceof ApiError) {
      setRootError(err.message);
      if (err.fieldErrors) {
        Object.entries(err.fieldErrors).forEach(([field, message]) => {
          if (field in values) {
            setError(field as keyof typeof values, { message });
          } else if (field === "schools" || field.startsWith("schools.")) {
            setError("schools" as never, { message });
          }
        });
      }
    } else {
      setRootError("Não foi possível concluir o cadastro.");
    }
  }

  const isSubmitting = activeForm.formState.isSubmitting;
  const formErrors = activeForm.formState.errors;

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Criar conta</h1>
        <p className="text-sm text-muted-foreground">
          {role === "student"
            ? "Cadastro de aluno"
            : "Cadastro de professor — informe escolas e turmas em que você leciona"}
        </p>
      </div>

      {rootError && (
        <Alert variant="destructive">
          <AlertDescription>{rootError}</AlertDescription>
        </Alert>
      )}

      <RoleSelector value={role} onChange={handleRoleChange} />

      {role === "student" ? (
        <form
          onSubmit={studentForm.handleSubmit(onSubmitStudent)}
          className="space-y-4"
          noValidate
        >
          <RegisterCommonFields
            register={studentForm.register}
            errors={studentForm.formState.errors}
          />

          <ActivityCitySelect
            role={role as "student" | "teacher"}
            value={studentCity}
            onChange={(v) => {
              studentForm.setValue(
                "city",
                v as RegisterStudentFormValues["city"],
                { shouldValidate: true }
              );
            }}
            onBlur={() => studentForm.trigger("city")}
            error={formErrors.city?.message}
          />

          <div className="space-y-2">
            <Label htmlFor="school">Escola</Label>
            <select
              id="school"
              className="flex min-h-11 w-full rounded-xl border border-transparent bg-input px-4 text-sm shadow-fluent-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
              {...studentForm.register("school_id")}
            >
              {studentSchools.map((s) => (
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
                className="flex min-h-11 w-full rounded-xl border border-transparent bg-input px-4 text-sm shadow-fluent-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                {...studentForm.register("grade")}
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
                className="flex min-h-11 w-full rounded-xl border border-transparent bg-input px-4 text-sm shadow-fluent-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                {...studentForm.register("class_identifier")}
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
              studentForm.setValue("termsAccepted", v, { shouldValidate: true });
            }}
            error={formErrors.termsAccepted?.message}
          />

          <SubmitSection isSubmitting={isSubmitting} />
        </form>
      ) : (
        <form
          onSubmit={teacherForm.handleSubmit(onSubmitTeacher)}
          className="space-y-4"
          noValidate
        >
          <RegisterCommonFields
            register={teacherForm.register}
            errors={teacherForm.formState.errors}
          />

          <ActivityCitySelect
            value={teacherCity}
            role={role as "student" | "teacher"}
            onChange={(v) =>
              teacherForm.setValue("city", v as RegisterTeacherFormValues["city"], {
                shouldValidate: true,
              })
            }
            onBlur={() => teacherForm.trigger("city")}
            error={formErrors.city?.message}
          />

          <TeacherSchoolsField
            activityCity={teacherCity}
            control={
              teacherForm.control as unknown as Control<TeacherAssignmentsFormValues>
            }
            register={teacherForm.register as never}
            setValue={teacherForm.setValue as never}
            errors={(formErrors as any).schools}
          />

          <LegalConsentBlock
            checked={termsAccepted}
            onCheckedChange={(v) => {
              setTermsAccepted(v);
              teacherForm.setValue("termsAccepted", v, { shouldValidate: true });
            }}
            error={formErrors.termsAccepted?.message}
          />

          <SubmitSection isSubmitting={isSubmitting} />
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}

function RegisterCommonFields({
  register,
  errors,
}: {
  // Formulários student/teacher possuem valores diferentes.
  // Usamos `any` aqui para evitar duplicação de componente/tipos genéricos.
  register: any;
  errors: any;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <Input id="name" placeholder="Seu nome completo" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="Digite seu e-mail"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
    </>
  );
}

function SubmitSection({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
      {isSubmitting ? "Cadastrando…" : "Criar conta"}
    </Button>
  );
}
