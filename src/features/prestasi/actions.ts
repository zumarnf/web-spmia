"use server";
import { withAction } from "@/lib/action";
import { requireAdmin, requireUser } from "@/lib/auth/guard";
import { kontribErrorMessage } from "@/lib/errors";
import { prestasiMahasiswaSchema, prestasiSchema } from "./schemas";
import type { ActionResult } from "@/types/api";

const PATH = "/prestasi";

export async function createPrestasi(
  input: unknown,
): Promise<ActionResult<{ id: number }>> {
  return withAction<{ id: number }>({
    guard: requireUser,
    revalidate: PATH,
    success: "Data berhasil ditambahkan",
    run: async (supabase) => {
      const values = prestasiSchema.parse(input);
      const { data, error } = await supabase
        .from("prestasis")
        .insert(values)
        .select("id")
        .single();
      if (error) return { ok: false, message: "Gagal menyimpan data" };
      return { ok: true, data: data as { id: number } };
    },
  });
}

export async function updatePrestasi(
  id: number,
  input: unknown,
): Promise<ActionResult<null>> {
  return withAction({
    guard: requireUser,
    revalidate: PATH,
    success: "Data berhasil diperbarui",
    run: async (supabase) => {
      const values = prestasiSchema.parse(input);
      const { error } = await supabase.from("prestasis").update(values).eq("id", id);
      if (error) return { ok: false, message: "Gagal memperbarui data" };
      return { ok: true, data: null };
    },
  });
}

export async function deletePrestasi(id: number): Promise<ActionResult<null>> {
  return withAction({
    guard: requireAdmin,
    revalidate: PATH,
    success: "Data berhasil dihapus",
    run: async (supabase) => {
      const { error } = await supabase.from("prestasis").delete().eq("id", id);
      if (error) return { ok: false, message: "Gagal menghapus data" };
      return { ok: true, data: null };
    },
  });
}

export async function addPrestasiMahasiswa(
  id: number,
  input: unknown,
): Promise<ActionResult<null>> {
  return withAction({
    guard: requireUser,
    revalidate: PATH,
    success: "Kontributor ditambahkan",
    run: async (supabase) => {
      const values = prestasiMahasiswaSchema.parse(input);
      const { error } = await supabase
        .from("prestasi_mahasiswas")
        .insert({ ...values, id_prestasi: id });
      if (error) return { ok: false, message: kontribErrorMessage(error) };
      return { ok: true, data: null };
    },
  });
}

export async function removePrestasiMahasiswa(
  pivotId: number,
): Promise<ActionResult<null>> {
  return withAction({
    guard: requireAdmin,
    revalidate: PATH,
    success: "Kontributor dihapus",
    run: async (supabase) => {
      const { error } = await supabase
        .from("prestasi_mahasiswas")
        .delete()
        .eq("id", pivotId);
      if (error) return { ok: false, message: "Gagal menghapus kontributor" };
      return { ok: true, data: null };
    },
  });
}
