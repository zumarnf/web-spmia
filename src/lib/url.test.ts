import { describe, expect, it } from "vitest";
import { isSafeHttpUrl, safeHref, optUrl } from "./url";

describe("isSafeHttpUrl", () => {
  it("accepts http and https", () => {
    expect(isSafeHttpUrl("http://example.com")).toBe(true);
    expect(isSafeHttpUrl("https://example.com/a?b=1")).toBe(true);
    expect(isSafeHttpUrl("HTTPS://EXAMPLE.COM")).toBe(true);
  });

  it("rejects javascript/data/other schemes and junk", () => {
    expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeHttpUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isSafeHttpUrl("vbscript:msgbox(1)")).toBe(false);
    expect(isSafeHttpUrl("mailto:a@b.com")).toBe(false);
    expect(isSafeHttpUrl("//evil.com")).toBe(false);
    expect(isSafeHttpUrl("not a url")).toBe(false);
  });
});

describe("safeHref", () => {
  it("returns the URL when http(s)", () => {
    expect(safeHref("https://example.com")).toBe("https://example.com");
  });

  it("returns undefined for unsafe or empty values", () => {
    expect(safeHref("javascript:alert(1)")).toBeUndefined();
    expect(safeHref(null)).toBeUndefined();
    expect(safeHref(undefined)).toBeUndefined();
    expect(safeHref("")).toBeUndefined();
  });
});

describe("optUrl", () => {
  it("keeps a valid http(s) URL (trimmed)", () => {
    expect(optUrl.parse("  https://example.com  ")).toBe("https://example.com");
  });

  it("maps empty / undefined to null", () => {
    expect(optUrl.parse("")).toBeNull();
    expect(optUrl.parse(undefined)).toBeNull();
  });

  it("rejects a javascript: URL", () => {
    const result = optUrl.safeParse("javascript:alert(1)");
    expect(result.success).toBe(false);
  });
});
