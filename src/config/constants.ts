import type { DosenStatus, PeranKontrib, SumberDana } from "@/types/database.types";

export const DOSEN_STATUS: DosenStatus[] = ["Aktif", "Tidak aktif", "Eksternal"];
export const SUMBER_DANA: SumberDana[] = ["Internal", "Eksternal"];
export const PERAN_KONTRIB: PeranKontrib[] = ["ketua", "anggota"];

export const DEFAULT_PER_PAGE = 20;
export const PER_PAGE_OPTIONS = [10, 20, 50, 100];
export const MAX_PER_PAGE = Math.max(...PER_PAGE_OPTIONS);
