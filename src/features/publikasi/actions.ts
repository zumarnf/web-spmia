"use server";
import { withAction } from "@/lib/action";
import { requireAdmin, requireUser } from "@/lib/auth/guard";
import { publikasiSchema } from "./schemas";
import type { ActionResult } from "@/types/api";

export async function createPublikasi(input: unknown): Promise<ActionResult<null>> {
  return withAction({
    guard: requireUser,
    revalidate: "/publikasi",
    success: "Data berhasil ditambahkan",
    run: async (supabase) => {
      const values = publikasiSchema.parse(input);
      const { error } = await supabase.from("publikasis").insert(values);
      if (error) return { ok: false, message: "Gagal menyimpan data" };
      return { ok: true, data: null };
    },
  });
}

export async function updatePublikasi(
  id: number,
  input: unknown,
): Promise<ActionResult<null>> {
  return withAction({
    guard: requireUser,
    revalidate: "/publikasi",
    success: "Data berhasil diperbarui",
    run: async (supabase) => {
      const values = publikasiSchema.parse(input);
      const { error } = await supabase.from("publikasis").update(values).eq("id", id);
      if (error) return { ok: false, message: "Gagal memperbarui data" };
      return { ok: true, data: null };
    },
  });
}

export async function deletePublikasi(id: number): Promise<ActionResult<null>> {
  return withAction({
    guard: requireAdmin,
    revalidate: "/publikasi",
    success: "Data berhasil dihapus",
    run: async (supabase) => {
      const { error } = await supabase.from("publikasis").delete().eq("id", id);
      if (error) return { ok: false, message: "Gagal menghapus data" };
      return { ok: true, data: null };
    },
  });
}
