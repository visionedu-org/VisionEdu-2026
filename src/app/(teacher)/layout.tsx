// Fase 2+ layout do Professor
export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      {children}
    </div>
  );
}
