export function teacherClassKey(grade: string, classIdentifier: string): string {
  return `${grade}:${classIdentifier}`;
}

export function hasDuplicateTeacherClasses(
  classes: Array<{ grade: string; class_identifier: string }>
): boolean {
  const keys = classes.map((entry) =>
    teacherClassKey(entry.grade, entry.class_identifier)
  );
  return new Set(keys).size !== keys.length;
}
