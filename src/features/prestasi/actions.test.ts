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

import { addPrestasiMahasiswa } from "./actions";

const PATH = "/prestasi";

beforeEach(() => {
  vi.clearAllMocks();
  queues = {};
});

describe("addPrestasiMahasiswa — single-ketua rule", () => {
  it("rejects a second ketua on the same prestasi (no insert)", async () => {
    // hasKetua check: one ketua already exists.
    queues["prestasi_mahasiswas"] = [{ count: 1 }];

    const result = await addPrestasiMahasiswa(5, {
      nim_mahasiswa: "1020",
      peran: "ketua",
    });

    expect(result).toEqual({
      ok: false,
      message: "Sudah ada ketua pada kegiatan ini — hanya boleh satu ketua.",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("inserts a ketua when none exists yet", async () => {
    queues["prestasi_mahasiswas"] = [
      { count: 0 }, // hasKetua check
      { error: null }, // the insert
    ];

    const result = await addPrestasiMahasiswa(5, {
      nim_mahasiswa: "1020",
      peran: "ketua",
    });

    expect(result).toEqual({
      ok: true,
      data: null,
      message: "Kontributor ditambahkan",
    });
    expect(revalidatePath).toHaveBeenCalledWith(PATH);
  });

  it("skips the ketua check for an anggota and maps a duplicate on insert", async () => {
    // peran "anggota" inserts directly; unique violation -> duplicate message.
    queues["prestasi_mahasiswas"] = [
      { error: { code: "23505", message: "duplicate key" } },
    ];

    const result = await addPrestasiMahasiswa(5, {
      nim_mahasiswa: "1020",
      peran: "anggota",
    });

    expect(result).toEqual({
      ok: false,
      message: "Kontributor ini sudah terdaftar pada kegiatan ini.",
    });
  });
});
