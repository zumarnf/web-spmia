import "server-only";
import { createClient } from "@/lib/supabase/server";
import { buildMeta, buildSearchExpr, normalizeListParams } from "@/lib/query/list-query";
import type { ListParams, ListResult } from "@/types/api";
import type { Publikasi } from "@/types/database.types";

const SEARCH_FIELDS = ["judul", "doi"] as const;
const SORTABLE = new Set(["judul", "tahun"]);

export async function getPublikasiList(
  params: ListParams,
): Promise<ListResult<Publikasi>> {
  const p = normalizeListParams(params);
  const supabase = await createClient();
  let query = supabase.from("publikasis").select("*", { count: "exact" });
  if (p.search) query = query.or(buildSearchExpr(SEARCH_FIELDS, p.search));
  query = query.order(SORTABLE.has(p.sort) ? p.sort : "judul", {
    ascending: p.order === "asc",
  });
  const { data, count } = await query.range(p.from, p.to);
  return {
    data: (data as Publikasi[]) ?? [],
    meta: buildMeta(count ?? 0, p.page, p.perPage),
  };
}
