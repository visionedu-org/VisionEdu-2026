"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { teacherService } from "@/services/teacher.service";
import { ApiError } from "@/lib/api-client";
import { TEACHER_DISCIPLINES } from "@/lib/validations/teacher";
import { useTeacherClassOptions } from "@/hooks/use-teacher-class-options";
import type { MaterialContentType, MaterialListItem } from "@/types/materials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CONTENT_TYPE_LABELS: Record<MaterialContentType, string> = {
  text: "Texto",
  video_link: "Link de vídeo",
  file: "Arquivo",
};

const SELECT_CLASS =
  "flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm";
const SEARCH_DEBOUNCE_MS = 300;

function formatSentAt(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

function formatClassLabels(labels: string[]): string {
  if (labels.length === 0) return "—";
  return labels.join(", ");
}

function useTeacherClassFilterOptions() {
  const { assignedClasses } = useTeacherClassOptions();

  return useMemo(
    () =>
      assignedClasses.map((match) => ({
        id: match.id,
        label: match.label,
      })),
    [assignedClasses]
  );
}

export function MaterialsList() {
  const classOptions = useTeacherClassFilterOptions();
  const [classId, setClassId] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  const [items, setItems] = useState<MaterialListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      ...(classId ? { classId } : {}),
      ...(discipline ? { discipline } : {}),
      ...(debouncedQ ? { q: debouncedQ } : {}),
    }),
    [classId, discipline, debouncedQ]
  );

  const hasActiveFilters = Boolean(classId || discipline || debouncedQ);
  const hasMore = page < totalPages;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQ(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      setLoading(true);
      setError(null);

      try {
        const data = await teacherService.listMaterials({ page: 1, filters });
        if (cancelled) return;
        setItems(data.items);
        setPage(data.page);
        setTotalPages(data.totalPages);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Não foi possível carregar os materiais."
        );
        setItems([]);
        setTotalPages(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadInitial();
    return () => {
      cancelled = true;
    };
  }, [filters]);

  async function handleRetry() {
    setLoading(true);
    setError(null);
    try {
      const data = await teacherService.listMaterials({ page: 1, filters });
      setItems(data.items);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar os materiais."
      );
      setItems([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadMore() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await teacherService.listMaterials({
        page: page + 1,
        filters,
      });
      setPage(data.page);
      setTotalPages(data.totalPages);
      setItems((prev) => [...prev, ...data.items]);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar mais materiais."
      );
    } finally {
      setLoadingMore(false);
    }
  }

  const filterControls = (
    <section
      aria-label="Filtros de materiais"
      className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div className="space-y-2 sm:col-span-2 lg:col-span-1">
        <Label htmlFor="materials-search">Buscar</Label>
        <Input
          id="materials-search"
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Título ou descrição"
          className="min-h-11"
          autoComplete="off"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="materials-class">Turma</Label>
        <select
          id="materials-class"
          className={SELECT_CLASS}
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
        >
          <option value="">Todas as turmas</option>
          {classOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="materials-discipline">Disciplina</Label>
        <select
          id="materials-discipline"
          className={SELECT_CLASS}
          value={discipline}
          onChange={(e) => setDiscipline(e.target.value)}
        >
          <option value="">Todas as disciplinas</option>
          {TEACHER_DISCIPLINES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
    </section>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {filterControls}
        <div className="space-y-3" role="status" aria-live="polite">
          <p className="sr-only">Carregando materiais…</p>
          {[1, 2, 3].map((key) => (
            <div
              key={key}
              className="h-24 animate-pulse rounded-xl border border-border bg-muted/40"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        {filterControls}
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <p>{error}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-3 min-h-11"
            onClick={() => void handleRetry()}
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        {filterControls}
        <div
          className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center"
          role="status"
        >
          <p className="font-medium">
            {hasActiveFilters
              ? "Nenhum material encontrado com esses filtros"
              : "Nenhum material enviado ainda"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Ajuste a busca ou os filtros e tente novamente."
              : "Envie textos, links de vídeo ou arquivos para suas turmas."}
          </p>
          {!hasActiveFilters && (
            <Link href="/teacher/conteudos/novo" className="mt-4 inline-block">
              <Button className="min-h-11">Criar primeiro material</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filterControls}
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <article className="rounded-xl border border-border bg-background p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-1">
                  <h2 className="font-semibold leading-snug">
                    <Link
                      href={`/teacher/materiais/${item.id}`}
                      className="text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {item.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {item.discipline}
                  </p>
                  <dl className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Turma</dt>
                      <dd>{formatClassLabels(item.classLabels)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Enviado em</dt>
                      <dd>{formatSentAt(item.sentAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Tipo</dt>
                      <dd>{CONTENT_TYPE_LABELS[item.contentType]}</dd>
                    </div>
                  </dl>
                </div>
                <Link
                  href={`/teacher/materiais/${item.id}`}
                  className="shrink-0"
                >
                  <Button variant="outline" className="min-h-11 w-full sm:w-auto">
                    Detalhe e histórico
                  </Button>
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>
      {hasMore && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={loadingMore}
            onClick={() => void handleLoadMore()}
            aria-busy={loadingMore}
          >
            {loadingMore ? "Carregando…" : "Carregar mais"}
          </Button>
        </div>
      )}
    </div>
  );
}
