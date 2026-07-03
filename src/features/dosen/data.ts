import "server-only";
import { createClient } from "@/lib/supabase/server";
import { buildMeta, buildSearchExpr, normalizeListParams } from "@/lib/query/list-query";
import type { ListParams, ListResult } from "@/types/api";
import type { Dosen } from "@/types/database.types";

export type DosenRow = Dosen & { prodi: { name: string } | null };

const SEARCH_FIELDS = ["name", "nidn", "kode_dosen"] as const;
const SORTABLE = new Set(["name", "nidn", "nip", "status"]);
const FILTERABLE = new Set(["id_prodi", "status"]);

export async function getDosenList(params: ListParams): Promise<ListResult<DosenRow>> {
  const p = normalizeListParams(params);
  const supabase = await createClient();
  let query = supabase.from("dosens").select("*, prodi:prodis(name)", { count: "exact" });

  if (p.search) query = query.or(buildSearchExpr(SEARCH_FIELDS, p.search));
  if (p.field && p.value && FILTERABLE.has(p.field)) query = query.eq(p.field, p.value);
  query = query.order(SORTABLE.has(p.sort) ? p.sort : "name", {
    ascending: p.order === "asc",
  });

  const { data, count } = await query.range(p.from, p.to);
  return {
    data: (data as DosenRow[]) ?? [],
    meta: buildMeta(count ?? 0, p.page, p.perPage),
  };
}

export async function getDosenOptions(): Promise<{ nip: string; name: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("dosens").select("nip, name").order("name");
  return (data as { nip: string; name: string }[]) ?? [];
}

export async function getDosenByNip(nip: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dosens")
    .select(
      `*, prodi:prodis(name, kode_prodi),
       history:history_jabatans(id, jabatan:jabatans(jabatan, sub_jabatan)),
       penelitian:penelitian_dosens(peran, penelitian:penelitians(id, judul, tahun)),
       pengabdian:pengabdian_dosens(peran, pengabdian:pengabdians(id, judul, tahun))`,
    )
    .eq("nip", nip)
    .single();
  return data;
}
