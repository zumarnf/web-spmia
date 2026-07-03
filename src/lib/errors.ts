import { ZodError } from "zod";
import type { ActionResult } from "@/types/api";

/** Map known errors to a safe, user-facing ActionResult (NFR-SEC-06). */
export function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    return {
      ok: false,
      message: "Validasi gagal",
      fieldErrors: error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  if (error instanceof Error) {
    if (error.message === "UNAUTHENTICATED")
      return { ok: false, message: "Sesi tidak valid. Silakan login ulang." };
    if (error.message === "FORBIDDEN")
      return { ok: false, message: "Akses ditolak. Hanya admin yang diizinkan." };
  }

  return { ok: false, message: "Terjadi kesalahan. Coba lagi." };
}

type PgError = { code?: string; message?: string; details?: string } | null;

/**
 * Message for a failed delete. A foreign-key violation (23503) means the row is
 * still referenced elsewhere, so tell the user that instead of a vague failure.
 */
export function deleteErrorMessage(error: PgError): string {
  if (error?.code === "23503")
    return "Tidak bisa dihapus karena masih dipakai oleh data lain.";
  return "Gagal menghapus data";
}

/**
 * Turn a Supabase/Postgres error into a specific contributor message.
 * Distinguishes a duplicate contributor from the single-ketua rule and FK issues,
 * instead of a misleading catch-all "duplikat" message.
 */
export function kontribErrorMessage(error: PgError): string {
  const text = `${error?.message ?? ""} ${error?.details ?? ""}`;
  if (error?.code === "23505") {
    if (/one_ketua/i.test(text))
      return "Sudah ada ketua pada kegiatan ini — hanya boleh satu ketua.";
    return "Kontributor ini sudah terdaftar pada kegiatan ini.";
  }
  if (error?.code === "23503")
    return "Data yang dipilih tidak ditemukan. Muat ulang lalu coba lagi.";
  return "Gagal menambah kontributor. Coba lagi.";
}
