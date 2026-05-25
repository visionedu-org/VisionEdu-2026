import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/components/register-form";
import { Spinner } from "@/components/ui/spinner";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner size="lg" label="Carregando formulário" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
