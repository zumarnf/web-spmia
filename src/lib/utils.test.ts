import { describe, expect, it } from "vitest";
import { cn, formatRupiah } from "./utils";

describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("de-duplicates conflicting Tailwind classes (last wins)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("formatRupiah", () => {
  it("returns '-' for null or undefined", () => {
    expect(formatRupiah(null)).toBe("-");
    expect(formatRupiah(undefined)).toBe("-");
  });

  it("formats zero", () => {
    // id-ID currency uses a non-breaking space after the symbol.
    expect(formatRupiah(0)).toMatch(/^Rp\s?0$/);
  });

  it("formats a thousands amount without decimals", () => {
    const out = formatRupiah(1500000);
    expect(out).toContain("Rp");
    expect(out).toContain("1.500.000");
    expect(out).not.toContain(",");
  });
});
