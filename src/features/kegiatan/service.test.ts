import { beforeEach, describe, expect, it, vi } from "vitest";

// --- Mocked cross-cutting deps -------------------------------------------------

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (p: string) => revalidatePath(p) }));

vi.mock("@/lib/monitoring/report", () => ({ reportError: vi.fn() }));

const requireUser = vi.fn(async () => ({ id: "u1", role: "user" }));
const requireAdmin = vi.fn(async () => ({ id: "a1", role: "admin" }));
vi.mock("@/lib/auth/guard", () => ({
  requireUser: () => requireUser(),
  requireAdmin: () => requireAdmin(),
}));

// A chainable, thenable Supabase stub. Each `from(table)` pulls the next queued
// result for that table; chain methods return the builder, terminal awaits resolve.
type QueryResult = { data?: unknown; error?: unknown; count?: number | null };

let queues: Record<string, QueryResult[]>;

function makeBuilder(result: QueryResult) {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  for (const m of ["select", "insert", "update", "delete", "eq", "in", "or", "order"]) {
    builder[m] = vi.fn(chain);
  }
  builder.single = vi.fn(async () => result);
  builder.range = vi.fn(async () => result);
  // Make the builder awaitable so chains ending in eq()/insert() resolve.
  builder.then = (resolve: (v: QueryResult) => unknown) => resolve(result);
  return builder;
}

const createClient = vi.fn(async () => ({
  from: vi.fn((table: string) => {
    const next = queues[table]?.shift();
    return makeBuilder(next ?? { data: null, error: null, count: 0 });
  }),
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: () => createClient() }));

import { PENELITIAN_TABLES as T } from "./data";
import {
  addKontribDosen,
  createKegiatan,
  deleteKegiatan,
} from "./service";

const PATH = "/penelitian";

beforeEach(() => {
  vi.clearAllMocks();
  queues = {};
});

describe("createKegiatan", () => {
  it("inserts valid input, returns the new id, revalidates", async () => {
    queues["penelitians"] = [{ data: { id: 42 }, error: null }];

    const result = await createKegiatan(T, PATH, { judul: "Riset A", tahun: "2024" });

    expect(requireUser).toHaveBeenCalledOnce();
    expect(result).toEqual({
      ok: true,
      data: { id: 42 },
      message: "Data berhasil ditambahkan",
    });
    expect(revalidatePath).toHaveBeenCalledWith(PATH);
  });

  it("fails validation when judul is empty (no DB call)", async () => {
    const result = await createKegiatan(T, PATH, { judul: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toBe("Validasi gagal");
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("returns a save error when the insert fails", async () => {
    queues["penelitians"] = [{ data: null, error: { code: "XX" } }];
    const result = await createKegiatan(T, PATH, { judul: "Riset A" });
    expect(result).toMatchObject({ ok: false, message: "Gagal menyimpan data" });
  });
});

describe("deleteKegiatan", () => {
  it("requires admin and deletes", async () => {
    queues["penelitians"] = [{ error: null }];
    const result = await deleteKegiatan(T, PATH, 7);
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(result).toEqual({ ok: true, data: null, message: "Data berhasil dihapus" });
  });

  it("maps a FORBIDDEN guard rejection to an access-denied result", async () => {
    requireAdmin.mockRejectedValueOnce(new Error("FORBIDDEN"));
    const result = await deleteKegiatan(T, PATH, 7);
    expect(result).toEqual({
      ok: false,
      message: "Akses ditolak. Hanya admin yang diizinkan.",
    });
  });
});

describe("addKontribDosen — single-ketua rule", () => {
  it("rejects a second ketua across the pivots", async () => {
    // hasKetua: dosen pivot count = 1 (already a ketua), mahasiswa pivot = 0.
    queues["penelitian_dosens"] = [{ count: 1 }];
    queues["penelitian_mahasiswas"] = [{ count: 0 }];

    const result = await addKontribDosen(T, PATH, 5, {
      nip_dosen: "1980",
      peran: "ketua",
    });

    expect(result).toEqual({
      ok: false,
      message: "Sudah ada ketua pada kegiatan ini — hanya boleh satu ketua.",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("inserts a ketua when none exists yet", async () => {
    queues["penelitian_dosens"] = [
      { count: 0 }, // hasKetua check on dosen pivot
      { error: null }, // the insert
    ];
    queues["penelitian_mahasiswas"] = [{ count: 0 }];

    const result = await addKontribDosen(T, PATH, 5, {
      nip_dosen: "1980",
      peran: "ketua",
    });

    expect(result).toEqual({
      ok: true,
      data: null,
      message: "Kontributor ditambahkan",
    });
    expect(revalidatePath).toHaveBeenCalledWith(PATH);
  });

  it("maps a unique-violation on insert to a duplicate-contributor message", async () => {
    // peran "anggota" skips the ketua check and inserts directly.
    queues["penelitian_dosens"] = [
      { error: { code: "23505", message: "duplicate key" } },
    ];

    const result = await addKontribDosen(T, PATH, 5, {
      nip_dosen: "1980",
      peran: "anggota",
    });

    expect(result).toEqual({
      ok: false,
      message: "Kontributor ini sudah terdaftar pada kegiatan ini.",
    });
  });
});
