import type { MaterialListFilters } from "@/types/materials";

export function buildMaterialsListQuery(params?: {
  page?: number;
  pageSize?: number;
  filters?: MaterialListFilters;
}): string {
  const search = new URLSearchParams();

  if (params?.page !== undefined) {
    search.set("page", String(params.page));
  }
  if (params?.pageSize !== undefined) {
    search.set("pageSize", String(params.pageSize));
  }

  const filters = params?.filters;
  if (filters?.classId) search.set("classId", filters.classId);
  if (filters?.discipline) search.set("discipline", filters.discipline);
  if (filters?.contentType) search.set("contentType", filters.contentType);
  if (filters?.dateFrom) search.set("dateFrom", filters.dateFrom);
  if (filters?.dateTo) search.set("dateTo", filters.dateTo);
  if (filters?.q) search.set("q", filters.q);

  return search.toString();
}
