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

import { updateHistoryJabatan } from "./actions";

const PATH = "/jabatan";

beforeEach(() => {
  vi.clearAllMocks();
  queues = {};
});

describe("updateHistoryJabatan", () => {
  it("updates a valid row and revalidates", async () => {
    queues["history_jabatans"] = [{ error: null }];
    const result = await updateHistoryJabatan(7, {
      nip_dosen: "1980",
      id_jabatan: "2",
    });
    expect(requireUser).toHaveBeenCalledOnce();
    expect(result).toEqual({
      ok: true,
      data: null,
      message: "Riwayat jabatan diperbarui",
    });
    expect(revalidatePath).toHaveBeenCalledWith(PATH);
  });

  it("fails validation when the dosen is missing (no DB call)", async () => {
    const result = await updateHistoryJabatan(7, { nip_dosen: "", id_jabatan: "2" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toBe("Validasi gagal");
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
