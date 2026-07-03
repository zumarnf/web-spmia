import "server-only";
import { createClient } from "@/lib/supabase/server";
import { buildMeta, buildSearchExpr, normalizeListParams } from "@/lib/query/list-query";
import type { ListParams, ListResult } from "@/types/api";
import type { Prodi } from "@/types/database.types";

const SEARCH_FIELDS = ["name", "kode_prodi"] as const;
const SORTABLE = new Set(["name", "kode_prodi", "created_at"]);
const FILTERABLE = new Set(["name", "kode_prodi"]);

export async function getProdiList(params: ListParams): Promise<ListResult<Prodi>> {
  const p = normalizeListParams(params);
  const supabase = await createClient();
  let query = supabase.from("prodis").select("*", { count: "exact" });

  if (p.search) query = query.or(buildSearchExpr(SEARCH_FIELDS, p.search));
  if (p.field && p.value && FILTERABLE.has(p.field))
    query = query.ilike(p.field, `%${p.value}%`);
  query = query.order(SORTABLE.has(p.sort) ? p.sort : "name", {
    ascending: p.order === "asc",
  });

  const { data, count } = await query.range(p.from, p.to);
  return {
    data: (data as Prodi[]) ?? [],
    meta: buildMeta(count ?? 0, p.page, p.perPage),
  };
}

export async function getProdiOptions(): Promise<Pick<Prodi, "id" | "name">[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("prodis").select("id, name").order("name");
  return data ?? [];
}

export async function getProdiById(id: number): Promise<Prodi | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("prodis").select("*").eq("id", id).single();
  return (data as Prodi) ?? null;
}
