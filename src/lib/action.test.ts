import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

// Mock the cross-cutting deps the wrapper composes.
const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (p: string) => revalidatePath(p) }));

const createClient = vi.fn(async () => ({ marker: "supabase" }));
vi.mock("@/lib/supabase/server", () => ({ createClient: () => createClient() }));

const reportError = vi.fn();
vi.mock("@/lib/monitoring/report", () => ({
  reportError: (e: unknown, c: unknown) => reportError(e, c),
}));

// redirect() halts execution by throwing NEXT_REDIRECT; mimic that in tests.
const redirect = vi.fn((p: string) => {
  throw new Error(`NEXT_REDIRECT:${p}`);
});
vi.mock("next/navigation", () => ({ redirect: (p: string) => redirect(p) }));

import { withAction } from "./action";

describe("withAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("runs the guard before creating the client", async () => {
    const order: string[] = [];
    const guard = vi.fn(async () => {
      order.push("guard");
    });
    createClient.mockImplementationOnce(async () => {
      order.push("client");
      return { marker: "supabase" };
    });

    await withAction({
      guard,
      success: "ok",
      run: async () => ({ ok: true, data: null }),
    });

    expect(order).toEqual(["guard", "client"]);
  });

  it("returns success with data and revalidates each path", async () => {
    const result = await withAction<{ id: number }>({
      revalidate: ["/a", "/b"],
      success: "Tersimpan",
      run: async () => ({ ok: true, data: { id: 1 } }),
    });

    expect(result).toEqual({ ok: true, data: { id: 1 }, message: "Tersimpan" });
    expect(revalidatePath).toHaveBeenCalledTimes(2);
    expect(revalidatePath).toHaveBeenCalledWith("/a");
    expect(revalidatePath).toHaveBeenCalledWith("/b");
  });

  it("short-circuits on a run failure without revalidating", async () => {
    const result = await withAction({
      revalidate: "/a",
      success: "ok",
      run: async () => ({ ok: false, message: "Gagal menyimpan data" }),
    });

    expect(result).toEqual({ ok: false, message: "Gagal menyimpan data" });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("maps a thrown ZodError and reports it", async () => {
    const result = await withAction({
      success: "ok",
      run: async () => {
        throw new ZodError([
          { code: "custom", message: "bad", path: ["name"], input: undefined },
        ]);
      },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toBe("Validasi gagal");
    expect(reportError).toHaveBeenCalledOnce();
    expect(reportError).toHaveBeenCalledWith(expect.any(ZodError), {
      source: "server-action",
    });
  });

  it("maps a thrown FORBIDDEN guard error to the admin message", async () => {
    const result = await withAction({
      guard: async () => {
        throw new Error("FORBIDDEN");
      },
      success: "ok",
      run: async () => ({ ok: true, data: null }),
    });

    expect(result).toEqual({
      ok: false,
      message: "Akses ditolak. Hanya admin yang diizinkan.",
    });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirects to /login when the guard reports UNAUTHENTICATED", async () => {
    await expect(
      withAction({
        guard: async () => {
          throw new Error("UNAUTHENTICATED");
        },
        success: "ok",
        run: async () => ({ ok: true, data: null }),
      }),
    ).rejects.toThrow("NEXT_REDIRECT:/login");

    expect(redirect).toHaveBeenCalledWith("/login");
    expect(reportError).toHaveBeenCalledOnce();
  });
});
