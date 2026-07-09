import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (p: string) => revalidatePath(p) }));
vi.mock("@/lib/monitoring/report", () => ({ reportError: vi.fn() }));

const requireUser = vi.fn(async () => ({ id: "u1", role: "user" }));
const requireAdmin = vi.fn(async () => ({ id: "a1", role: "admin" }));
vi.mock("@/lib/auth/guard", () => ({
  requireUser: () => requireUser(),
  requireAdmin: () => requireAdmin(),
}));

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

import { addPublikasiDosen } from "./actions";

const PATH = "/publikasi";

beforeEach(() => {
  vi.clearAllMocks();
  queues = {};
});

describe("addPublikasiDosen — single-ketua across pivots", () => {
  it("rejects a second ketua when the mahasiswa pivot already has one", async () => {
    queues["publikasi_dosens"] = [{ count: 0 }];
    queues["publikasi_mahasiswas"] = [{ count: 1 }];

    const result = await addPublikasiDosen(3, { nip_dosen: "1980", peran: "ketua" });

    expect(result).toEqual({
      ok: false,
      message: "Sudah ada ketua pada kegiatan ini — hanya boleh satu ketua.",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("inserts a ketua when none exists yet and revalidates /publikasi", async () => {
    queues["publikasi_dosens"] = [{ count: 0 }, { error: null }];
    queues["publikasi_mahasiswas"] = [{ count: 0 }];

    const result = await addPublikasiDosen(3, { nip_dosen: "1980", peran: "ketua" });

    expect(result).toEqual({
      ok: true,
      data: null,
      message: "Kontributor ditambahkan",
    });
    expect(revalidatePath).toHaveBeenCalledWith(PATH);
  });

  it("maps a duplicate (unique violation) on an anggota insert", async () => {
    queues["publikasi_dosens"] = [
      { error: { code: "23505", message: "duplicate key" } },
    ];

    const result = await addPublikasiDosen(3, { nip_dosen: "1980", peran: "anggota" });

    expect(result).toEqual({
      ok: false,
      message: "Kontributor ini sudah terdaftar pada kegiatan ini.",
    });
  });
});
