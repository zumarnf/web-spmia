import "server-only";
import { createClient } from "@/lib/supabase/server";
import { buildMeta, buildSearchExpr, normalizeListParams } from "@/lib/query/list-query";
import type { ListParams, ListResult } from "@/types/api";
import type { Mahasiswa } from "@/types/database.types";

export type MahasiswaRow = Mahasiswa & { prodi: { name: string } | null };

const SEARCH_FIELDS = ["name"] as const;
const SORTABLE = new Set(["name", "nim", "angkatan"]);
const FILTERABLE = new Set(["id_prodi"]);

export async function getMahasiswaList(
  params: ListParams,
): Promise<ListResult<MahasiswaRow>> {
  const p = normalizeListParams(params);
  const supabase = await createClient();
  let query = supabase
    .from("mahasiswas")
    .select("*, prodi:prodis(name)", { count: "exact" });

  if (p.search) query = query.or(buildSearchExpr(SEARCH_FIELDS, p.search));
  if (p.field && p.value && FILTERABLE.has(p.field)) query = query.eq(p.field, p.value);
  query = query.order(SORTABLE.has(p.sort) ? p.sort : "name", {
    ascending: p.order === "asc",
  });

  const { data, count } = await query.range(p.from, p.to);
  return {
    data: (data as MahasiswaRow[]) ?? [],
    meta: buildMeta(count ?? 0, p.page, p.perPage),
  };
}

export async function getMahasiswaOptions(): Promise<{ nim: number; name: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("mahasiswas").select("nim, name").order("name");
  return (data as { nim: number; name: string }[]) ?? [];
}

export async function getMahasiswaByNim(nim: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mahasiswas")
    .select(
      `*, prodi:prodis(name, kode_prodi),
       penelitian:penelitian_mahasiswas(peran, penelitian:penelitians(id, judul, tahun)),
       pengabdian:pengabdian_mahasiswas(peran, pengabdian:pengabdians(id, judul, tahun)),
       prestasi:prestasi_mahasiswas(peran, prestasi:prestasis(id, nama_lomba, juara))`,
    )
    .eq("nim", nim)
    .single();
  return data;
}
