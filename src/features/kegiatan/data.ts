import "server-only";
import { createClient } from "@/lib/supabase/server";
import { buildMeta, buildSearchExpr, normalizeListParams } from "@/lib/query/list-query";
import type { ListParams, ListResult } from "@/types/api";
import type { PeranKontrib, Penelitian } from "@/types/database.types";

export type KegiatanRow = Penelitian & {
  /** Ketua's name + prodi via SECURITY DEFINER computed fields (cross-prodi safe). */
  ketua_nama: string | null;
  ketua_prodi_id: number | null;
  /** `nama` is the per-pivot computed field: contributor name across prodi (guarded). */
  dosen: { id: number; peran: PeranKontrib; nama: string | null }[];
  mahasiswa: { id: number; peran: PeranKontrib; nama: string | null }[];
};

export type KegiatanTables = {
  table: "penelitians" | "pengabdians" | "publikasis";
  view: "penelitian_with_ketua" | "pengabdian_with_ketua" | "publikasi_with_ketua";
  dosenPivot: "penelitian_dosens" | "pengabdian_dosens" | "publikasi_dosens";
  mahasiswaPivot:
    | "penelitian_mahasiswas"
    | "pengabdian_mahasiswas"
    | "publikasi_mahasiswas";
  fk: "id_penelitian" | "id_pengabdian" | "id_publikasi";
};

const SEARCH_FIELDS = ["judul", "no_sk", "no_kontrak", "bidang", "skema"] as const;
const SORTABLE = new Set(["judul", "tahun", "dana", "created_at"]);
const FILTERABLE = new Set(["sumber_dana", "tahun"]);

function embed(t: KegiatanTables) {
  return `*, ketua_nama, ketua_prodi_id,
    dosen:${t.dosenPivot}(id, peran, nama),
    mahasiswa:${t.mahasiswaPivot}(id, peran, nama)`;
}

export async function getKegiatanList(
  t: KegiatanTables,
  params: ListParams,
): Promise<ListResult<KegiatanRow>> {
  const p = normalizeListParams(params);
  const supabase = await createClient();

  // "By ketua" search (FR-TBL-04): resolve matching ids via the dedicated view.
  let restrictIds: number[] | null = null;
  if (p.field === "ketua_name" || p.field === "ketua_prodi") {
    let vq = supabase.from(t.view).select("id");
    vq =
      p.field === "ketua_prodi"
        ? vq.eq("ketua_id_prodi", p.value)
        : vq.ilike("ketua_name", `%${p.value}%`);
    const { data: ids } = await vq;
    restrictIds = (ids ?? []).map((r) => (r as { id: number }).id);
    if (restrictIds.length === 0)
      return { data: [], meta: buildMeta(0, p.page, p.perPage) };
  }

  let query = supabase.from(t.table).select(embed(t), { count: "exact" });
  if (p.search) query = query.or(buildSearchExpr(SEARCH_FIELDS, p.search));
  if (restrictIds) query = query.in("id", restrictIds);
  else if (p.field && p.value && FILTERABLE.has(p.field))
    query = query.eq(p.field, p.value);
  query = query.order(SORTABLE.has(p.sort) ? p.sort : "judul", {
    ascending: p.order === "asc",
  });

  const { data, count } = await query.range(p.from, p.to);
  return {
    data: (data as unknown as KegiatanRow[]) ?? [],
    meta: buildMeta(count ?? 0, p.page, p.perPage),
  };
}

export async function getKegiatanById(t: KegiatanTables, id: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from(t.table)
    .select(
      `*,
      dosen:${t.dosenPivot}(id, peran, nama),
      mahasiswa:${t.mahasiswaPivot}(id, peran, nama)`,
    )
    .eq("id", id)
    .single();
  return data;
}

export const PENELITIAN_TABLES: KegiatanTables = {
  table: "penelitians",
  view: "penelitian_with_ketua",
  dosenPivot: "penelitian_dosens",
  mahasiswaPivot: "penelitian_mahasiswas",
  fk: "id_penelitian",
};

export const PENGABDIAN_TABLES: KegiatanTables = {
  table: "pengabdians",
  view: "pengabdian_with_ketua",
  dosenPivot: "pengabdian_dosens",
  mahasiswaPivot: "pengabdian_mahasiswas",
  fk: "id_pengabdian",
};
