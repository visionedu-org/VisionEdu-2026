export const TEACHER_NAV_LINKS = [
  { href: "/teacher/dashboard", label: "Painel" },
  { href: "/teacher/turmas", label: "Turmas" },
  { href: "/teacher/conteudos/novo", label: "Novo material" },
  { href: "/teacher/diagnosticos/novo", label: "Novo diagnóstico" },
] as const;

export function isTeacherNavActive(pathname: string, href: string): boolean {
  if (href === "/teacher/dashboard") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
