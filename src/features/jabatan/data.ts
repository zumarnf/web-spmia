import "server-only";
import { createClient } from "@/lib/supabase/server";
import { buildMeta, normalizeListParams } from "@/lib/query/list-query";
import type { ListParams, ListResult } from "@/types/api";
import type { Jabatan } from "@/types/database.types";

export type HistoryRow = {
  id: number;
  nip_dosen: string;
  id_jabatan: number;
  dosen: { name: string } | null;
  jabatan: { jabatan: string; sub_jabatan: string } | null;
};

export async function getJabatanList(): Promise<Jabatan[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("jabatans").select("*").order("jabatan");
  return (data as Jabatan[]) ?? [];
}

export async function getJabatanOptions(): Promise<{ id: number; label: string }[]> {
  const data = await getJabatanList();
  return data.map((j) => ({ id: j.id, label: `${j.jabatan} — ${j.sub_jabatan}` }));
}

export async function getHistoryList(
  params: ListParams,
): Promise<ListResult<HistoryRow>> {
  const p = normalizeListParams(params);
  const supabase = await createClient();
  const { data, count } = await supabase
    .from("history_jabatans")
    .select(
      "id, nip_dosen, id_jabatan, dosen:dosens(name), jabatan:jabatans(jabatan, sub_jabatan)",
      { count: "exact" },
    )
    .order("id", { ascending: p.order === "asc" })
    .range(p.from, p.to);
  return {
    data: (data as unknown as HistoryRow[]) ?? [],
    meta: buildMeta(count ?? 0, p.page, p.perPage),
  };
}
