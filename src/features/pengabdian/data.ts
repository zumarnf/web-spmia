import "server-only";
import {
  getKegiatanById,
  getKegiatanList,
  PENGABDIAN_TABLES as T,
} from "@/features/kegiatan/data";
import type { ListParams } from "@/types/api";

export function getPengabdianList(params: ListParams) {
  return getKegiatanList(T, params);
}
export function getPengabdianById(id: number) {
  return getKegiatanById(T, id);
}
