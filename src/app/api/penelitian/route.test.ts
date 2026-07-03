import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const getCurrentProfile = vi.fn();
vi.mock("@/lib/auth/guard", () => ({ getCurrentProfile: () => getCurrentProfile() }));

const getPenelitianList = vi.fn();
vi.mock("@/features/penelitian/data", () => ({
  getPenelitianList: (p: unknown) => getPenelitianList(p),
}));

import { GET } from "./route";

function makeRequest(query = ""): NextRequest {
  return {
    nextUrl: { searchParams: new URLSearchParams(query) },
  } as unknown as NextRequest;
}

describe("GET /api/penelitian", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when there is no authenticated profile", async () => {
    getCurrentProfile.mockResolvedValueOnce(null);

    const res = await GET(makeRequest("page=1"));

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ message: "Unauthorized" });
    expect(getPenelitianList).not.toHaveBeenCalled();
  });

  it("returns 200 with data + meta for an authenticated user", async () => {
    getCurrentProfile.mockResolvedValueOnce({ id: "u1", role: "user" });
    const meta = { total: 1, page: 2, perPage: 50, lastPage: 1 };
    getPenelitianList.mockResolvedValueOnce({ data: [{ id: 1 }], meta });

    const res = await GET(makeRequest("page=2&perPage=50&search=abc"));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      message: "Data retrieved successfully",
      data: [{ id: 1 }],
      meta,
    });
  });

  it("forwards parsed list params to the data layer", async () => {
    getCurrentProfile.mockResolvedValueOnce({ id: "u1", role: "user" });
    getPenelitianList.mockResolvedValueOnce({ data: [], meta: {} });

    await GET(makeRequest("page=3&order=desc&search=x"));

    expect(getPenelitianList).toHaveBeenCalledWith(
      expect.objectContaining({ page: 3, order: "desc", search: "x" }),
    );
  });
});
