"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerTeacherSchema,
  type RegisterTeacherFormValues,
} from "@/lib/validations/auth";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { useCetiOptions } from "@/hooks/use-ceti-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LegalConsentBlock } from "./legal-consent-block";
import { CETI_SCHOOL_ID } from "@/mocks/data/ceti-seed";

export function RegisterTeacherForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const { grades, getClasses } = useCetiOptions();
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const subjects = ['Matemática', 'Português', 'História', 'Geografia'];
  const schools = [{ id: CETI_SCHOOL_ID, name: 'CETI Luiz Ubiraci de Carvalho' }];
  const [rootError, setRootError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const form = useForm<RegisterTeacherFormValues>({
    resolver: zodResolver(registerTeacherSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      classes: [
        { school_id: CETI_SCHOOL_ID, grade: "2", class_identifier: "A" },
      ],
      termsAccepted: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "classes",
  });

  async function onSubmit(values: RegisterTeacherFormValues) {
    setRootError(null);
    try {
      const response = await authService.registerTeacher({
        ...values,
        termsAccepted: true,
      });
      setSession(response);
      router.push("/teacher/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setRootError(err.message);
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
        <h1 className="text-2xl font-bold">Cadastro de professor</h1>
        <p className="text-sm text-muted-foreground">
          Vincule as turmas que você leciona no piloto CETI
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" className="min-h-11" {...form.register("email")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" className="min-h-11" {...form.register("password")} />
        
        {/* Subject dropdown */}
        <div className="space-y-2">
          <Label htmlFor="subject">Matéria</Label>
          <select
            id="subject"
            className="min-h-11 rounded-lg border border-input px-2 text-sm"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="" disabled>Selecione uma matéria</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        
        {/* School dropdown */}
        <div className="space-y-2 mt-2">
          <Label htmlFor="school">Escola</Label>
          <select
            id="school"
            className="min-h-11 rounded-lg border border-input px-2 text-sm"
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
          >
            <option value="" disabled>Selecione uma escola</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Turmas lecionadas</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                school_id: CETI_SCHOOL_ID,
                grade: "2",
                class_identifier: "B",
              })
            }
            disabled={fields.length >= 6}
          >
            Adicionar outra turma
          </Button>
        </div>

        {fields.map((field, index) => {
          const grade = form.watch(`classes.${index}.grade`);
          const classOptions = getClasses(CETI_SCHOOL_ID, grade);
          return (
            <div
              key={field.id}
              className="grid grid-cols-2 gap-2 rounded-lg border border-border p-3"
            >
              <div className="col-span-2 flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">
                  Turma {index + 1}
                </span>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    Remover
                  </Button>
                )}
              </div>
              <select
                className="min-h-11 rounded-lg border border-input px-2 text-sm"
                {...form.register(`classes.${index}.grade`)}
              >
                {grades.map((g) => (
                  <option key={g} value={g}>
                    {g}º ano
                  </option>
                ))}
              </select>
              <select
                className="min-h-11 rounded-lg border border-input px-2 text-sm"
                {...form.register(`classes.${index}.class_identifier`)}
              >
                {classOptions.map((c) => (
                  <option key={c.id} value={c.class_identifier}>
                    Turma {c.class_identifier}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      <LegalConsentBlock
        checked={termsAccepted}
        onCheckedChange={(v) => {
          setTermsAccepted(v);
          form.setValue("termsAccepted", v, { shouldValidate: true });
        }}
        error={form.formState.errors.termsAccepted?.message}
      />

      <Button type="submit" className="w-full min-h-11" disabled={form.formState.isSubmitting}>
        Criar conta
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
