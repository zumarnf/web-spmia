"use server";
import { withAction } from "@/lib/action";
import { requireAdmin, requireUser } from "@/lib/auth/guard";
import { deleteErrorMessage } from "@/lib/errors";
import { dosenSchema } from "./schemas";
import type { ActionResult } from "@/types/api";

export async function createDosen(input: unknown): Promise<ActionResult<null>> {
  return withAction({
    guard: requireUser,
    revalidate: "/dosen",
    success: "Data berhasil ditambahkan",
    run: async (supabase) => {
      const values = dosenSchema.parse(input);
      const { error } = await supabase.from("dosens").insert(values);
      if (error)
        return { ok: false, message: "Gagal menyimpan data (NIP/NIDN mungkin sudah ada)" };
      return { ok: true, data: null };
    },
  });
}

export async function updateDosen(
  nip: string,
  input: unknown,
): Promise<ActionResult<null>> {
  return withAction({
    guard: requireUser,
    revalidate: "/dosen",
    success: "Data berhasil diperbarui",
    run: async (supabase) => {
      const values = dosenSchema.parse(input);
      const { error } = await supabase.from("dosens").update(values).eq("nip", nip);
      if (error) return { ok: false, message: "Gagal memperbarui data" };
      return { ok: true, data: null };
    },
  });
}

export async function deleteDosen(nip: string): Promise<ActionResult<null>> {
  return withAction({
    guard: requireAdmin,
    revalidate: "/dosen",
    success: "Data berhasil dihapus",
    run: async (supabase) => {
      const { error } = await supabase.from("dosens").delete().eq("nip", nip);
      if (error) return { ok: false, message: deleteErrorMessage(error) };
      return { ok: true, data: null };
    },
  });
}
