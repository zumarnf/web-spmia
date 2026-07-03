import "server-only";
import { createClient } from "@/lib/supabase/server";
import { buildMeta, buildSearchExpr, normalizeListParams } from "@/lib/query/list-query";
import type { ListParams, ListResult } from "@/types/api";
import type { PeranKontrib, Prestasi } from "@/types/database.types";

export type PrestasiRow = Prestasi & {
  mahasiswa: {
    id: number;
    peran: PeranKontrib;
    mahasiswa: { nim: number; name: string } | null;
  }[];
};

const SEARCH_FIELDS = ["nama_lomba", "juara"] as const;
const SORTABLE = new Set(["nama_lomba", "juara", "created_at"]);

export async function getPrestasiList(
  params: ListParams,
): Promise<ListResult<PrestasiRow>> {
  const p = normalizeListParams(params);
  const supabase = await createClient();
  let query = supabase
    .from("prestasis")
    .select(`*, mahasiswa:prestasi_mahasiswas(id, peran, mahasiswa:mahasiswas(nim, name))`, {
      count: "exact",
    });
  if (p.search) query = query.or(buildSearchExpr(SEARCH_FIELDS, p.search));
  query = query.order(SORTABLE.has(p.sort) ? p.sort : "created_at", {
    ascending: p.order === "asc",
  });
  const { data, count } = await query.range(p.from, p.to);
  return {
    data: (data as unknown as PrestasiRow[]) ?? [],
    meta: buildMeta(count ?? 0, p.page, p.perPage),
  };
}

export async function getPrestasiById(id: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("prestasis")
    .select(
      `*, mahasiswa:prestasi_mahasiswas(id, peran, mahasiswa:mahasiswas(nim, name))`,
    )
    .eq("id", id)
    .single();
  return data;
}
