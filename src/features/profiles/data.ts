import "server-only";
import { createClient } from "@/lib/supabase/server";
import { buildMeta, buildSearchExpr, normalizeListParams } from "@/lib/query/list-query";
import type { ListParams, ListResult } from "@/types/api";
import type { Profile } from "@/types/database.types";

export type ProfileRow = Profile & { prodi: { name: string } | null };

const SEARCH_FIELDS = ["name", "username"] as const;
const SORTABLE = new Set(["name", "username", "role", "created_at"]);

// Admin-only: the profiles_self RLS policy lets admins read every row; a
// prodi user only ever sees their own, so this list is meaningful for admins.
export async function getProfileList(
  params: ListParams,
): Promise<ListResult<ProfileRow>> {
  const p = normalizeListParams(params);
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("*, prodi:prodis(name)", { count: "exact" });
  if (p.search) query = query.or(buildSearchExpr(SEARCH_FIELDS, p.search));
  query = query.order(SORTABLE.has(p.sort) ? p.sort : "name", {
    ascending: p.order === "asc",
  });
  const { data, count } = await query.range(p.from, p.to);
  return {
    data: (data as unknown as ProfileRow[]) ?? [],
    meta: buildMeta(count ?? 0, p.page, p.perPage),
  };
}
