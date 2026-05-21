import { BookOpen, GraduationCap, Sparkles } from "lucide-react";
import { HomeCtas } from "@/components/home-ctas";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#090d16] dark:to-[#0f172a]">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="block text-slate-900 dark:text-white">VisionEdu</span>
            <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent text-2xl mt-2">
              Piloto CETI Luiz Ubiraci de Carvalho
            </span>
          </h1>
          <p className="mt-3 text-base text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Recomposição de aprendizagem e acompanhamento pedagógico auxiliado por IA em conformidade com a Lei 15.100/2025.
          </p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="grid grid-cols-1 gap-4 text-left">
            <div className="flex items-start space-x-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Trilhas Customizadas</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Recomposição ativa das suas lacunas do Ensino Fundamental.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="p-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-500">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Tutor Socrático IA</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ajuda pedagógica interativa sem revelar respostas prontas.</p>
              </div>
            </div>
          </div>

          <HomeCtas />
        </div>

        <div className="text-xs text-slate-400 dark:text-slate-500">
          VisionEdu v1.1 • Secretaria da Educação do Estado do Piauí
        </div>
      </div>
    </div>
  );
}
