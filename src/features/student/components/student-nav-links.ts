export const STUDENT_NAV_LINKS = [
  { href: "/student/dashboard", label: "Painel" },
  { href: "/student/questoes", label: "Questões" },
  { href: "/student/materiais", label: "Materiais" },
] as const;

export function isStudentNavActive(pathname: string, href: string): boolean {
  if (href === "/student/dashboard") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
