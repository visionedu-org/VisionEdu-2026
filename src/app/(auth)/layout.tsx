// Fase 2+ layout de Autenticação
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col justify-center bg-slate-50 dark:bg-slate-950">
      {children}
    </div>
  );
}
