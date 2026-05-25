"use client";

import { useEffect, useMemo } from "react";
import {
  useFieldArray,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import { teacherClassKey } from "@/lib/teacher-class-key";
import { getAvailableMaterias } from "@/lib/materias-catalog";
import {
  defaultMateriasForClass,
  type TeacherClassAssignmentInput,
  type TeacherSchoolsPayload,
} from "@/lib/validations/teacher-assignments";
import type { TeacherDiscipline } from "@/lib/validations/teacher";
import { useCetiOptions } from "@/hooks/use-ceti-options";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CETI_SCHOOL_ID } from "@/mocks/data/ceti-seed";

export type TeacherAssignmentsFormValues = {
  schools: TeacherSchoolsPayload;
};

type TeacherSchoolsFieldProps = {
  control: Control<TeacherAssignmentsFormValues>;
  register: UseFormRegister<TeacherAssignmentsFormValues>;
  setValue: UseFormSetValue<TeacherAssignmentsFormValues>;
  errors?: FieldErrors<TeacherAssignmentsFormValues>["schools"];
};

function findFirstAvailableClass(
  schoolId: string,
  grades: readonly string[],
  getClasses: ReturnType<typeof useCetiOptions>["getClasses"],
  selected: Array<{ grade: string; class_identifier: string }>
): TeacherClassAssignmentInput | null {
  const selectedKeys = new Set(
    selected.map((entry) =>
      teacherClassKey(entry.grade, entry.class_identifier)
    )
  );

  for (const grade of grades) {
    for (const cls of getClasses(schoolId, grade)) {
      const key = teacherClassKey(grade, cls.class_identifier);
      if (!selectedKeys.has(key)) {
        return {
          grade: grade as "1" | "2" | "3",
          class_identifier: cls.class_identifier,
          materias: defaultMateriasForClass(schoolId, grade),
        };
      }
    }
  }

  return null;
}

export function TeacherSchoolsField({
  control,
  register,
  setValue,
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
    ([] as TeacherSchoolsPayload);
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
          onClick={() => {
            const nextSchoolId =
              schoolOptions.find((s) => !selectedSchoolIds.includes(s.id))
                ?.id ?? CETI_SCHOOL_ID;
            const nextClass = findFirstAvailableClass(
              nextSchoolId,
              grades,
              getClasses,
              []
            );
            appendSchool({
              school_id: nextSchoolId,
              classes: [
                nextClass ?? {
                  grade: "2",
                  class_identifier: "A",
                  materias: defaultMateriasForClass(nextSchoolId, "2"),
                },
              ],
            });
          }}
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
          setValue={setValue}
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
  control: Control<TeacherAssignmentsFormValues>;
  register: UseFormRegister<TeacherAssignmentsFormValues>;
  setValue: UseFormSetValue<TeacherAssignmentsFormValues>;
  schoolIndex: number;
  schoolOptions: Array<{ id: string; name: string }>;
  grades: readonly string[];
  getClasses: ReturnType<typeof useCetiOptions>["getClasses"];
  canRemoveSchool: boolean;
  onRemoveSchool: () => void;
  errors?: FieldErrors<TeacherSchoolsPayload[number]>;
};

function TeacherSchoolBlock({
  control,
  register,
  setValue,
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

  const schoolClasses =
    useWatch({
      control,
      name: `schools.${schoolIndex}.classes`,
    }) ?? [];

  const {
    fields: classFields,
    append: appendClass,
    remove: removeClass,
  } = useFieldArray({
    control,
    name: `schools.${schoolIndex}.classes`,
  });

  const nextAvailableClass = findFirstAvailableClass(
    schoolId,
    grades,
    getClasses,
    schoolClasses
  );

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
            onClick={() => {
              if (nextAvailableClass) {
                appendClass(nextAvailableClass);
              }
            }}
            disabled={!nextAvailableClass}
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
            setValue={setValue}
            register={register}
            schoolIndex={schoolIndex}
            classIndex={classIndex}
            schoolId={schoolId}
            grades={grades}
            getClasses={getClasses}
            siblingClasses={schoolClasses}
            canRemove={classFields.length > 1}
            onRemove={() => removeClass(classIndex)}
            errors={
              Array.isArray(errors?.classes)
                ? errors.classes[classIndex]
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}

type TeacherClassRowProps = {
  control: Control<TeacherAssignmentsFormValues>;
  register: UseFormRegister<TeacherAssignmentsFormValues>;
  setValue: UseFormSetValue<TeacherAssignmentsFormValues>;
  schoolIndex: number;
  classIndex: number;
  schoolId: string;
  grades: readonly string[];
  getClasses: ReturnType<typeof useCetiOptions>["getClasses"];
  siblingClasses: TeacherClassAssignmentInput[];
  canRemove: boolean;
  onRemove: () => void;
  errors?: FieldErrors<TeacherClassAssignmentInput>;
};

function TeacherClassRow({
  control,
  register,
  setValue,
  schoolIndex,
  classIndex,
  schoolId,
  grades,
  getClasses,
  siblingClasses,
  canRemove,
  onRemove,
  errors,
}: TeacherClassRowProps) {
  const grade =
    useWatch({
      control,
      name: `schools.${schoolIndex}.classes.${classIndex}.grade`,
    }) ?? "2";
  const classIdentifier =
    useWatch({
      control,
      name: `schools.${schoolIndex}.classes.${classIndex}.class_identifier`,
    }) ?? "A";
  const selectedMateriasRaw = useWatch({
    control,
    name: `schools.${schoolIndex}.classes.${classIndex}.materias`,
  });
  const selectedMaterias = useMemo(
    () => (selectedMateriasRaw ?? []) as TeacherDiscipline[],
    [selectedMateriasRaw]
  );

  const materiasPath =
    `schools.${schoolIndex}.classes.${classIndex}.materias` as const;

  const classOptions = getClasses(schoolId, grade).filter((cls) => {
    const isSelectedElsewhere = siblingClasses.some(
      (entry, index) =>
        index !== classIndex &&
        teacherClassKey(entry.grade, entry.class_identifier) ===
          teacherClassKey(grade, cls.class_identifier)
    );
    return !isSelectedElsewhere || cls.class_identifier === classIdentifier;
  });

  const availableMaterias = getAvailableMaterias(schoolId, grade);

  useEffect(() => {
    if (!schoolId || classOptions.length === 0) return;

    const isDuplicate = siblingClasses.some(
      (entry, index) =>
        index !== classIndex &&
        teacherClassKey(entry.grade, entry.class_identifier) ===
          teacherClassKey(grade, classIdentifier)
    );
    const isAvailable = classOptions.some(
      (cls) => cls.class_identifier === classIdentifier
    );

    if (isDuplicate || !isAvailable) {
      const fallback = classOptions[0];
      if (fallback && fallback.class_identifier !== classIdentifier) {
        setValue(
          `schools.${schoolIndex}.classes.${classIndex}.class_identifier`,
          fallback.class_identifier,
          { shouldValidate: true }
        );
      }
    }
  }, [
    schoolId,
    grade,
    classIdentifier,
    classOptions,
    siblingClasses,
    schoolIndex,
    classIndex,
    setValue,
  ]);

  useEffect(() => {
    if (!schoolId) return;
    const allowed = getAvailableMaterias(schoolId, grade);
    const compatible = selectedMaterias.filter((m) => allowed.includes(m));
    const next =
      compatible.length > 0
        ? compatible
        : defaultMateriasForClass(schoolId, grade);
    if (
      next.length !== selectedMaterias.length ||
      next.some((m, i) => m !== selectedMaterias[i])
    ) {
      setValue(materiasPath, next, { shouldValidate: true });
    }
  }, [schoolId, grade, selectedMaterias, materiasPath, setValue]);

  function toggleMateria(materia: TeacherDiscipline) {
    const exists = selectedMaterias.includes(materia);
    const next = exists
      ? selectedMaterias.filter((entry) => entry !== materia)
      : [...selectedMaterias, materia];
    if (next.length === 0) return;
    setValue(materiasPath, next, { shouldValidate: true });
  }

  return (
    <div className="space-y-2 rounded-md bg-muted/30 p-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Turma {classIndex + 1}
        </span>
        {canRemove && (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            Remover
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
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

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium text-muted-foreground">
          Matérias nesta turma
        </legend>
        <div className="flex flex-wrap gap-2">
          {availableMaterias.map((materia) => {
            const checked = selectedMaterias.includes(materia);
            return (
              <label
                key={materia}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm"
              >
                <input
                  type="checkbox"
                  className="size-4"
                  checked={checked}
                  onChange={() => toggleMateria(materia)}
                />
                {materia}
              </label>
            );
          })}
        </div>
        {errors?.materias && (
          <p className="text-sm text-destructive">
            {String(errors.materias.message)}
          </p>
        )}
      </fieldset>
    </div>
  );
}
