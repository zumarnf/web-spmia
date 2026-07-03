"use server";
import { withAction } from "@/lib/action";
import { requireAdmin, requireUser } from "@/lib/auth/guard";
import { deleteErrorMessage } from "@/lib/errors";
import { prodiSchema } from "./schemas";
import type { ActionResult } from "@/types/api";
import type { Prodi } from "@/types/database.types";

export async function createProdi(input: unknown): Promise<ActionResult<Prodi>> {
  return withAction<Prodi>({
    guard: requireUser,
    revalidate: "/prodi",
    success: "Data berhasil ditambahkan",
    run: async (supabase) => {
      const values = prodiSchema.parse(input);
      const { data, error } = await supabase
        .from("prodis")
        .insert(values)
        .select()
        .single();
      if (error) return { ok: false, message: "Gagal menyimpan data" };
      return { ok: true, data: data as Prodi };
    },
  });
}

export async function updateProdi(
  id: number,
  input: unknown,
): Promise<ActionResult<Prodi>> {
  return withAction<Prodi>({
    guard: requireUser,
    revalidate: "/prodi",
    success: "Data berhasil diperbarui",
    run: async (supabase) => {
      const values = prodiSchema.parse(input);
      const { data, error } = await supabase
        .from("prodis")
        .update(values)
        .eq("id", id)
        .select()
        .single();
      if (error) return { ok: false, message: "Gagal memperbarui data" };
      return { ok: true, data: data as Prodi };
    },
  });
}

export async function deleteProdi(id: number): Promise<ActionResult<null>> {
  return withAction({
    guard: requireAdmin,
    revalidate: "/prodi",
    success: "Data berhasil dihapus",
    run: async (supabase) => {
      const { error } = await supabase.from("prodis").delete().eq("id", id);
      if (error) return { ok: false, message: deleteErrorMessage(error) };
      return { ok: true, data: null };
    },
  });
}
