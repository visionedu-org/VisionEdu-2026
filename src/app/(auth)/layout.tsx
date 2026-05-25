import { BrandLogo } from "@/components/layout/brand-logo";
import { AuthWavesPanel } from "@/features/auth/components/auth-waves-panel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col lg:min-h-screen lg:flex-row">
      <aside
        className="relative hidden overflow-hidden lg:flex lg:w-1/2"
        aria-hidden
      >
        <AuthWavesPanel />
      </aside>

      <div className="flex w-full flex-col bg-background lg:w-1/2">
        <div className="flex items-center justify-between px-6 py-5 lg:justify-end">
          <div className="lg:hidden">
            <BrandLogo href="/login" showBadge={false} size="sm" />
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10 lg:px-12">
          <div className="mb-8 hidden lg:block">
            <BrandLogo href="/login" showBadge={false} />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
