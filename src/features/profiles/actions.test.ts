import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (p: string) => revalidatePath(p) }));
vi.mock("@/lib/monitoring/report", () => ({ reportError: vi.fn() }));

const requireAdmin = vi.fn(async () => ({ id: "a1", role: "admin" }));
const getCurrentProfile = vi.fn(async () => ({ id: "a1", role: "admin" }));
vi.mock("@/lib/auth/guard", () => ({
  requireAdmin: () => requireAdmin(),
  getCurrentProfile: () => getCurrentProfile(),
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

import { updateProfile } from "./actions";

const PATH = "/pengguna";

beforeEach(() => {
  vi.clearAllMocks();
  queues = {};
});

describe("updateProfile", () => {
  it("promotes another user to admin and revalidates", async () => {
    queues["profiles"] = [{ error: null }];
    const result = await updateProfile("u2", { role: "admin", id_prodi: "2" });
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(result).toEqual({ ok: true, data: null, message: "Pengguna diperbarui" });
    expect(revalidatePath).toHaveBeenCalledWith(PATH);
  });

  it("blocks an admin from demoting their own account (no DB write)", async () => {
    getCurrentProfile.mockResolvedValueOnce({ id: "a1", role: "admin" });
    const result = await updateProfile("a1", { role: "prodi", id_prodi: "1" });
    expect(result).toEqual({
      ok: false,
      message: "Tidak bisa menurunkan role admin akun Anda sendiri.",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects an invalid role", async () => {
    const result = await updateProfile("u2", { role: "superuser" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toBe("Validasi gagal");
  });
});
