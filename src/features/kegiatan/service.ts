import "server-only";
import { withAction } from "@/lib/action";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireUser } from "@/lib/auth/guard";
import { kontribErrorMessage } from "@/lib/errors";
import { kegiatanSchema, kontribDosenSchema, kontribMahasiswaSchema } from "./schemas";
import type { KegiatanTables } from "./data";
import type { ActionResult } from "@/types/api";

/**
 * A kegiatan may have at most ONE ketua total, across both the dosen and the
 * mahasiswa pivots. The per-table partial unique indexes only guard each table
 * in isolation, so we additionally check the other pivot before inserting a
 * ketua here (NFR cross-table single-ketua rule).
 */
async function kegiatanHasKetua(
  supabase: Awaited<ReturnType<typeof createClient>>,
  t: KegiatanTables,
  id: number,
): Promise<boolean> {
  const [dosen, mahasiswa] = await Promise.all([
    supabase
      .from(t.dosenPivot)
      .select("id", { count: "exact", head: true })
      .eq(t.fk, id)
      .eq("peran", "ketua"),
    supabase
      .from(t.mahasiswaPivot)
      .select("id", { count: "exact", head: true })
      .eq(t.fk, id)
      .eq("peran", "ketua"),
  ]);
  return (dosen.count ?? 0) + (mahasiswa.count ?? 0) > 0;
}

const ONE_KETUA_MSG = "Sudah ada ketua pada kegiatan ini — hanya boleh satu ketua.";

/** Shared CRUD + contributor logic for penelitian & pengabdian. */
export async function createKegiatan(
  t: KegiatanTables,
  path: string,
  input: unknown,
): Promise<ActionResult<{ id: number }>> {
  return withAction<{ id: number }>({
    guard: requireUser,
    revalidate: path,
    success: "Data berhasil ditambahkan",
    run: async (supabase) => {
      const values = kegiatanSchema.parse(input);
      const { data, error } = await supabase
        .from(t.table)
        .insert(values)
        .select("id")
        .single();
      if (error) return { ok: false, message: "Gagal menyimpan data" };
      return { ok: true, data: data as { id: number } };
    },
  });
}

export async function updateKegiatan(
  t: KegiatanTables,
  path: string,
  id: number,
  input: unknown,
): Promise<ActionResult<null>> {
  return withAction({
    guard: requireUser,
    revalidate: path,
    success: "Data berhasil diperbarui",
    run: async (supabase) => {
      const values = kegiatanSchema.parse(input);
      const { error } = await supabase.from(t.table).update(values).eq("id", id);
      if (error) return { ok: false, message: "Gagal memperbarui data" };
      return { ok: true, data: null };
    },
  });
}

export async function deleteKegiatan(
  t: KegiatanTables,
  path: string,
  id: number,
): Promise<ActionResult<null>> {
  return withAction({
    guard: requireAdmin,
    revalidate: path,
    success: "Data berhasil dihapus",
    run: async (supabase) => {
      const { error } = await supabase.from(t.table).delete().eq("id", id);
      if (error) return { ok: false, message: "Gagal menghapus data" };
      return { ok: true, data: null };
    },
  });
}

export async function addKontribDosen(
  t: KegiatanTables,
  path: string,
  id: number,
  input: unknown,
): Promise<ActionResult<null>> {
  return withAction({
    guard: requireUser,
    revalidate: path,
    success: "Kontributor ditambahkan",
    run: async (supabase) => {
      const values = kontribDosenSchema.parse(input);
      if (values.peran === "ketua" && (await kegiatanHasKetua(supabase, t, id)))
        return { ok: false, message: ONE_KETUA_MSG };
      const { error } = await supabase.from(t.dosenPivot).insert({ ...values, [t.fk]: id });
      if (error) return { ok: false, message: kontribErrorMessage(error) };
      return { ok: true, data: null };
    },
  });
}

export async function addKontribMahasiswa(
  t: KegiatanTables,
  path: string,
  id: number,
  input: unknown,
): Promise<ActionResult<null>> {
  return withAction({
    guard: requireUser,
    revalidate: path,
    success: "Kontributor ditambahkan",
    run: async (supabase) => {
      const values = kontribMahasiswaSchema.parse(input);
      if (values.peran === "ketua" && (await kegiatanHasKetua(supabase, t, id)))
        return { ok: false, message: ONE_KETUA_MSG };
      const { error } = await supabase
        .from(t.mahasiswaPivot)
        .insert({ ...values, [t.fk]: id });
      if (error) return { ok: false, message: kontribErrorMessage(error) };
      return { ok: true, data: null };
    },
  });
}

export async function removeKontribDosen(
  t: KegiatanTables,
  path: string,
  pivotId: number,
): Promise<ActionResult<null>> {
  return withAction({
    guard: requireAdmin,
    revalidate: path,
    success: "Kontributor dihapus",
    run: async (supabase) => {
      const { error } = await supabase.from(t.dosenPivot).delete().eq("id", pivotId);
      if (error) return { ok: false, message: "Gagal menghapus kontributor" };
      return { ok: true, data: null };
    },
  });
}

export async function removeKontribMahasiswa(
  t: KegiatanTables,
  path: string,
  pivotId: number,
): Promise<ActionResult<null>> {
  return withAction({
    guard: requireAdmin,
    revalidate: path,
    success: "Kontributor dihapus",
    run: async (supabase) => {
      const { error } = await supabase.from(t.mahasiswaPivot).delete().eq("id", pivotId);
      if (error) return { ok: false, message: "Gagal menghapus kontributor" };
      return { ok: true, data: null };
    },
  });
}
