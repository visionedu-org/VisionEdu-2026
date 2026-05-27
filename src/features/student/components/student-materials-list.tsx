"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { studentService } from "@/services/student.service";
import { ApiError } from "@/lib/api-client";
import { TEACHER_DISCIPLINES } from "@/lib/validations/teacher";
import type {
  MaterialContentType,
  StudentMaterialListItem,
} from "@/types/materials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CONTENT_TYPE_LABELS: Record<MaterialContentType, string> = {
  text: "Texto",
  video_link: "Vídeo",
  file: "Arquivo",
  questions: "Questões",
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

export function StudentMaterialsList() {
  const [discipline, setDiscipline] = useState("");
  const [contentType, setContentType] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  const [items, setItems] = useState<StudentMaterialListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      ...(discipline ? { discipline } : {}),
      ...(contentType
        ? { contentType: contentType as MaterialContentType }
        : {}),
      ...(debouncedQ ? { q: debouncedQ } : {}),
    }),
    [discipline, contentType, debouncedQ]
  );

  const hasActiveFilters = Boolean(discipline || contentType || debouncedQ);
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
        const data = await studentService.listMaterials({ page: 1, filters });
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
      const data = await studentService.listMaterials({ page: 1, filters });
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
      const data = await studentService.listMaterials({
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
      className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-2"
    >
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="student-materials-search">Buscar</Label>
        <Input
          id="student-materials-search"
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Título ou descrição"
          className="min-h-11"
          autoComplete="off"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="student-materials-discipline">Disciplina</Label>
        <select
          id="student-materials-discipline"
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
      <div className="space-y-2">
        <Label htmlFor="student-materials-type">Tipo</Label>
        <select
          id="student-materials-type"
          className={SELECT_CLASS}
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
        >
          <option value="">Todos os tipos</option>
          {(Object.keys(CONTENT_TYPE_LABELS) as MaterialContentType[]).map(
            (type) => (
              <option key={type} value={type}>
                {CONTENT_TYPE_LABELS[type]}
              </option>
            )
          )}
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
              className="h-20 animate-pulse rounded-xl bg-muted"
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
              ? "Nenhum material encontrado"
              : "Nenhum material disponível"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Ajuste a busca ou os filtros e tente novamente."
              : "Quando seu professor enviar conteúdos para sua turma, eles aparecerão aqui."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filterControls}
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <li key={item.id} className="h-full">
            <Link
              href={`/student/materiais/${item.id}`}
              className="flex h-full min-h-11 flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex items-center gap-2 font-semibold leading-snug">
              {item.title}
              {item.isNew && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                  Novo
                </span>
              )}
            </span>
              <span className="text-sm text-muted-foreground">
                {item.discipline} · {CONTENT_TYPE_LABELS[item.contentType]}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatSentAt(item.sentAt)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {hasMore && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full sm:w-auto"
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
