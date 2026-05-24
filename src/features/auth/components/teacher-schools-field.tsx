"use client";

import {
  useFieldArray,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import type { RegisterTeacherFormValues } from "@/lib/validations/auth";
import { useCetiOptions } from "@/hooks/use-ceti-options";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CETI_SCHOOL_ID } from "@/mocks/data/ceti-seed";

type TeacherSchoolsFieldProps = {
  control: Control<RegisterTeacherFormValues>;
  register: UseFormRegister<RegisterTeacherFormValues>;
  errors?: FieldErrors<RegisterTeacherFormValues>["schools"];
};

export function TeacherSchoolsField({
  control,
  register,
  errors,
}: TeacherSchoolsFieldProps) {
  const { schools: schoolOptions, grades, getClasses } = useCetiOptions();

  const {
    fields: schoolFields,
    append: appendSchool,
    remove: removeSchool,
  } = useFieldArray({
    control,
    name: "schools",
  });

  const schools =
    useWatch({ control, name: "schools" }) ??
    ([] as RegisterTeacherFormValues["schools"]);
  const selectedSchoolIds = schools.map((s) => s.school_id);

  function availableSchoolsForIndex(index: number) {
    const currentId = selectedSchoolIds[index];
    return schoolOptions.filter(
      (s) => s.id === currentId || !selectedSchoolIds.includes(s.id)
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium">Escolas em que leciona</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            appendSchool({
              school_id: schoolOptions.find(
                (s) => !selectedSchoolIds.includes(s.id)
              )?.id ?? CETI_SCHOOL_ID,
              classes: [{ grade: "2", class_identifier: "A" }],
            })
          }
          disabled={
            schoolFields.length >= schoolOptions.length ||
            schoolFields.length >= 10
          }
        >
          Adicionar escola
        </Button>
      </div>

      {typeof errors === "object" && errors && !Array.isArray(errors) && (
        <p className="text-sm text-destructive">{String(errors.message ?? "")}</p>
      )}

      {schoolFields.map((schoolField, schoolIndex) => (
        <TeacherSchoolBlock
          key={schoolField.id}
          control={control}
          register={register}
          schoolIndex={schoolIndex}
          schoolOptions={availableSchoolsForIndex(schoolIndex)}
          grades={grades}
          getClasses={getClasses}
          canRemoveSchool={schoolFields.length > 1}
          onRemoveSchool={() => removeSchool(schoolIndex)}
          errors={Array.isArray(errors) ? errors[schoolIndex] : undefined}
        />
      ))}
    </div>
  );
}

type TeacherSchoolBlockProps = {
  control: Control<RegisterTeacherFormValues>;
  register: UseFormRegister<RegisterTeacherFormValues>;
  schoolIndex: number;
  schoolOptions: Array<{ id: string; name: string }>;
  grades: readonly string[];
  getClasses: ReturnType<typeof useCetiOptions>["getClasses"];
  canRemoveSchool: boolean;
  onRemoveSchool: () => void;
  errors?: FieldErrors<RegisterTeacherFormValues["schools"][number]>;
};

function TeacherSchoolBlock({
  control,
  register,
  schoolIndex,
  schoolOptions,
  grades,
  getClasses,
  canRemoveSchool,
  onRemoveSchool,
  errors,
}: TeacherSchoolBlockProps) {
  const schoolId =
    useWatch({
      control,
      name: `schools.${schoolIndex}.school_id`,
    }) ?? "";

  const {
    fields: classFields,
    append: appendClass,
    remove: removeClass,
  } = useFieldArray({
    control,
    name: `schools.${schoolIndex}.classes`,
  });

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-2">
          <Label htmlFor={`school-${schoolIndex}`}>Escola {schoolIndex + 1}</Label>
          <select
            id={`school-${schoolIndex}`}
            className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
            {...register(`schools.${schoolIndex}.school_id`)}
          >
            {schoolOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {errors?.school_id && (
            <p className="text-sm text-destructive">
              {String(errors.school_id.message)}
            </p>
          )}
        </div>
        {canRemoveSchool && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-6 shrink-0"
            onClick={onRemoveSchool}
          >
            Remover escola
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Turmas nesta escola
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendClass({ grade: "2", class_identifier: "B" })
            }
            disabled={classFields.length >= 6}
          >
            Adicionar turma
          </Button>
        </div>

        {errors?.classes?.message && (
          <p className="text-sm text-destructive">{errors.classes.message}</p>
        )}

        {classFields.map((classField, classIndex) => (
          <TeacherClassRow
            key={classField.id}
            control={control}
            register={register}
            schoolIndex={schoolIndex}
            classIndex={classIndex}
            schoolId={schoolId}
            grades={grades}
            getClasses={getClasses}
            canRemove={classFields.length > 1}
            onRemove={() => removeClass(classIndex)}
          />
        ))}
      </div>
    </div>
  );
}

type TeacherClassRowProps = {
  control: Control<RegisterTeacherFormValues>;
  register: UseFormRegister<RegisterTeacherFormValues>;
  schoolIndex: number;
  classIndex: number;
  schoolId: string;
  grades: readonly string[];
  getClasses: ReturnType<typeof useCetiOptions>["getClasses"];
  canRemove: boolean;
  onRemove: () => void;
};

function TeacherClassRow({
  control,
  register,
  schoolIndex,
  classIndex,
  schoolId,
  grades,
  getClasses,
  canRemove,
  onRemove,
}: TeacherClassRowProps) {
  const grade =
    useWatch({
      control,
      name: `schools.${schoolIndex}.classes.${classIndex}.grade`,
    }) ?? "2";
  const classOptions = getClasses(schoolId, grade);

  return (
    <div className="grid grid-cols-2 gap-2 rounded-md bg-muted/30 p-2">
      <div className="col-span-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Turma {classIndex + 1}
        </span>
        {canRemove && (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            Remover
          </Button>
        )}
      </div>
      <select
        className="min-h-11 rounded-lg border border-input bg-background px-2 text-sm"
        {...register(`schools.${schoolIndex}.classes.${classIndex}.grade`)}
      >
        {grades.map((g) => (
          <option key={g} value={g}>
            {g}º ano
          </option>
        ))}
      </select>
      <select
        className="min-h-11 rounded-lg border border-input bg-background px-2 text-sm"
        {...register(
          `schools.${schoolIndex}.classes.${classIndex}.class_identifier`
        )}
      >
        {classOptions.map((c) => (
          <option key={c.id} value={c.class_identifier}>
            Turma {c.class_identifier}
          </option>
        ))}
      </select>
    </div>
  );
}
