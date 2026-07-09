"use server";
import { withAction } from "@/lib/action";
import { requireAdmin, requireUser } from "@/lib/auth/guard";
import { historyJabatanSchema } from "./schemas";
import type { ActionResult } from "@/types/api";

const PATH = "/jabatan";

export async function createHistoryJabatan(input: unknown): Promise<ActionResult<null>> {
  return withAction({
    guard: requireUser,
    revalidate: PATH,
    success: "Riwayat jabatan ditambahkan",
    run: async (supabase) => {
      const values = historyJabatanSchema.parse(input);
      const { error } = await supabase.from("history_jabatans").insert(values);
      if (error) return { ok: false, message: "Gagal menyimpan data" };
      return { ok: true, data: null };
    },
  });
}

export async function updateHistoryJabatan(
  id: number,
  input: unknown,
): Promise<ActionResult<null>> {
  return withAction({
    guard: requireUser,
    revalidate: PATH,
    success: "Riwayat jabatan diperbarui",
    run: async (supabase) => {
      const values = historyJabatanSchema.parse(input);
      const { error } = await supabase
        .from("history_jabatans")
        .update(values)
        .eq("id", id);
      if (error) return { ok: false, message: "Gagal memperbarui data" };
      return { ok: true, data: null };
    },
  });
}

export async function deleteHistoryJabatan(id: number): Promise<ActionResult<null>> {
  return withAction({
    guard: requireAdmin,
    revalidate: PATH,
    success: "Riwayat jabatan dihapus",
    run: async (supabase) => {
      const { error } = await supabase.from("history_jabatans").delete().eq("id", id);
      if (error) return { ok: false, message: "Gagal menghapus data" };
      return { ok: true, data: null };
    },
  });
}
