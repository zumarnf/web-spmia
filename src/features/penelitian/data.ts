import "server-only";
import {
  getKegiatanById,
  getKegiatanList,
  PENELITIAN_TABLES as T,
} from "@/features/kegiatan/data";
import type { ListParams } from "@/types/api";

export function getPenelitianList(params: ListParams) {
  return getKegiatanList(T, params);
}
export function getPenelitianById(id: number) {
  return getKegiatanById(T, id);
}
