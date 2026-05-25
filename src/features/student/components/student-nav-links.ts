export const STUDENT_NAV_LINKS = [
  { href: "/student/dashboard", label: "Painel" },
  { href: "/student/questoes", label: "Questões" },
  { href: "/student/atividades", label: "Atividades" },
  { href: "/student/materiais", label: "Materiais" },
  { href: "/student/perfil", label: "Perfil" },
] as const;

export function isStudentNavActive(pathname: string, href: string): boolean {
  if (href === "/student/dashboard") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
