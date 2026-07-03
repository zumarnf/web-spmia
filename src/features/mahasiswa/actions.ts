"use server";
import { withAction } from "@/lib/action";
import { requireAdmin, requireUser } from "@/lib/auth/guard";
import { deleteErrorMessage } from "@/lib/errors";
import { mahasiswaSchema } from "./schemas";
import type { ActionResult } from "@/types/api";

export async function createMahasiswa(input: unknown): Promise<ActionResult<null>> {
  return withAction({
    guard: requireUser,
    revalidate: "/mahasiswa",
    success: "Data berhasil ditambahkan",
    run: async (supabase) => {
      const values = mahasiswaSchema.parse(input);
      const { error } = await supabase.from("mahasiswas").insert(values);
      if (error)
        return { ok: false, message: "Gagal menyimpan data (NIM mungkin sudah ada)" };
      return { ok: true, data: null };
    },
  });
}

export async function updateMahasiswa(
  nim: number,
  input: unknown,
): Promise<ActionResult<null>> {
  return withAction({
    guard: requireUser,
    revalidate: "/mahasiswa",
    success: "Data berhasil diperbarui",
    run: async (supabase) => {
      const values = mahasiswaSchema.parse(input);
      const { error } = await supabase.from("mahasiswas").update(values).eq("nim", nim);
      if (error) return { ok: false, message: "Gagal memperbarui data" };
      return { ok: true, data: null };
    },
  });
}

export async function deleteMahasiswa(nim: number): Promise<ActionResult<null>> {
  return withAction({
    guard: requireAdmin,
    revalidate: "/mahasiswa",
    success: "Data berhasil dihapus",
    run: async (supabase) => {
      const { error } = await supabase.from("mahasiswas").delete().eq("nim", nim);
      if (error) return { ok: false, message: deleteErrorMessage(error) };
      return { ok: true, data: null };
    },
  });
}
