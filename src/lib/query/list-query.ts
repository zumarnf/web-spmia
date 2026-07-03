import { DEFAULT_PER_PAGE, MAX_PER_PAGE } from "@/config/constants";
import type { ListMeta, ListParams } from "@/types/api";

export type NormalizedListParams = {
  page: number;
  perPage: number;
  from: number;
  to: number;
  search: string;
  field: string;
  value: string;
  sort: string;
  order: "asc" | "desc";
};

/** Normalize raw list params into safe paging/sort values (FR-TBL-01..05). */
export function normalizeListParams(params: ListParams = {}): NormalizedListParams {
  const page = Math.max(1, Number(params.page) || 1);
  const perPage = Math.min(
    MAX_PER_PAGE,
    Math.max(1, Number(params.perPage) || DEFAULT_PER_PAGE),
  );
  const from = (page - 1) * perPage;
  return {
    page,
    perPage,
    from,
    to: from + perPage - 1,
    search: params.search?.trim() ?? "",
    field: params.field?.trim() ?? "",
    value: params.value?.trim() ?? "",
    sort: params.sort?.trim() ?? "",
    order: params.order === "desc" ? "desc" : "asc",
  };
}

/** Build a PostgREST `.or()` expression for a global ilike search across fields. */
export function buildSearchExpr(fields: readonly string[], term: string): string {
  const safe = term.replace(/[%,()]/g, " ");
  return fields.map((f) => `${f}.ilike.%${safe}%`).join(",");
}

/** Compute pagination meta from a total row count. */
export function buildMeta(total: number, page: number, perPage: number): ListMeta {
  return { total, page, perPage, lastPage: Math.max(1, Math.ceil(total / perPage)) };
}

/** Parse a URLSearchParams-like object into ListParams. */
export function parseListSearchParams(
  sp: Record<string, string | string[] | undefined>,
): ListParams {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return {
    page: Number(one(sp.page)) || undefined,
    perPage: Number(one(sp.perPage)) || undefined,
    search: one(sp.search),
    field: one(sp.field),
    value: one(sp.value),
    sort: one(sp.sort),
    order: one(sp.order) === "desc" ? "desc" : "asc",
  };
}
