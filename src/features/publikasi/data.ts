import "server-only";
import { createClient } from "@/lib/supabase/server";
import { buildMeta, buildSearchExpr, normalizeListParams } from "@/lib/query/list-query";
import { getKegiatanById, type KegiatanTables } from "@/features/kegiatan/data";
import type { ListParams, ListResult } from "@/types/api";
import type { PeranKontrib, Publikasi } from "@/types/database.types";

export const PUBLIKASI_TABLES: KegiatanTables = {
  table: "publikasis",
  view: "publikasi_with_ketua",
  dosenPivot: "publikasi_dosens",
  mahasiswaPivot: "publikasi_mahasiswas",
  fk: "id_publikasi",
};

export type PublikasiRow = Publikasi & {
  dosen: {
    id: number;
    peran: PeranKontrib;
    dosen: { nip: string; name: string } | null;
  }[];
  mahasiswa: {
    id: number;
    peran: PeranKontrib;
    mahasiswa: { nim: number; name: string } | null;
  }[];
};

const SEARCH_FIELDS = ["judul", "doi"] as const;
const SORTABLE = new Set(["judul", "tahun"]);

export async function getPublikasiList(
  params: ListParams,
): Promise<ListResult<PublikasiRow>> {
  const p = normalizeListParams(params);
  const supabase = await createClient();
  let query = supabase
    .from("publikasis")
    .select(
      `*,
      dosen:publikasi_dosens(id, peran, dosen:dosens(nip, name)),
      mahasiswa:publikasi_mahasiswas(id, peran, mahasiswa:mahasiswas(nim, name))`,
      { count: "exact" },
    );
  if (p.search) query = query.or(buildSearchExpr(SEARCH_FIELDS, p.search));
  query = query.order(SORTABLE.has(p.sort) ? p.sort : "judul", {
    ascending: p.order === "asc",
  });
  const { data, count } = await query.range(p.from, p.to);
  return {
    data: (data as unknown as PublikasiRow[]) ?? [],
    meta: buildMeta(count ?? 0, p.page, p.perPage),
  };
}

export function getPublikasiById(id: number) {
  return getKegiatanById(PUBLIKASI_TABLES, id);
}
