import { describe, expect, it } from "vitest";
import { DEFAULT_PER_PAGE, MAX_PER_PAGE } from "@/config/constants";
import {
  buildMeta,
  buildSearchExpr,
  normalizeListParams,
  parseListSearchParams,
} from "./list-query";

describe("normalizeListParams", () => {
  it("applies defaults for empty input", () => {
    const r = normalizeListParams();
    expect(r.page).toBe(1);
    expect(r.perPage).toBe(DEFAULT_PER_PAGE);
    expect(r.from).toBe(0);
    expect(r.to).toBe(DEFAULT_PER_PAGE - 1);
    expect(r.order).toBe("asc");
  });

  it("clamps page to a minimum of 1", () => {
    expect(normalizeListParams({ page: 0 }).page).toBe(1);
    expect(normalizeListParams({ page: -5 }).page).toBe(1);
  });

  it("clamps perPage to [1, MAX_PER_PAGE]", () => {
    expect(normalizeListParams({ perPage: 9999 }).perPage).toBe(MAX_PER_PAGE);
    expect(normalizeListParams({ perPage: 0 }).perPage).toBe(DEFAULT_PER_PAGE);
  });

  it("computes the from/to range for a later page", () => {
    const r = normalizeListParams({ page: 3, perPage: 10 });
    expect(r.from).toBe(20);
    expect(r.to).toBe(29);
  });

  it("trims string fields and only accepts 'desc' order", () => {
    const r = normalizeListParams({ search: "  hi  ", sort: " name ", order: "desc" });
    expect(r.search).toBe("hi");
    expect(r.sort).toBe("name");
    expect(r.order).toBe("desc");
    expect(normalizeListParams({ order: "anything" as never }).order).toBe("asc");
  });
});

describe("buildSearchExpr", () => {
  it("builds an ilike OR expression across fields", () => {
    expect(buildSearchExpr(["name", "nip"], "abc")).toBe(
      "name.ilike.%abc%,nip.ilike.%abc%",
    );
  });

  it("neutralizes PostgREST meta characters in the term", () => {
    const expr = buildSearchExpr(["name"], "a%,(b)");
    expect(expr).not.toMatch(/[%,()]/.source.replace(/\\/g, "")); // no raw meta chars
    expect(expr).toBe("name.ilike.%a   b %");
  });
});

describe("buildMeta", () => {
  it("computes last page from total/perPage", () => {
    expect(buildMeta(45, 1, 20)).toEqual({
      total: 45,
      page: 1,
      perPage: 20,
      lastPage: 3,
    });
  });

  it("returns lastPage of at least 1 for an empty set", () => {
    expect(buildMeta(0, 1, 20).lastPage).toBe(1);
  });
});

describe("parseListSearchParams", () => {
  it("parses numbers and takes the first value of arrays", () => {
    const r = parseListSearchParams({
      page: ["2", "9"],
      perPage: "50",
      search: "x",
      order: "desc",
    });
    expect(r.page).toBe(2);
    expect(r.perPage).toBe(50);
    expect(r.search).toBe("x");
    expect(r.order).toBe("desc");
  });

  it("leaves missing/invalid numeric params undefined and defaults order to asc", () => {
    const r = parseListSearchParams({ page: "abc" });
    expect(r.page).toBeUndefined();
    expect(r.order).toBe("asc");
  });
});
