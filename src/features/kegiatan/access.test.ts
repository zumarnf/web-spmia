import { describe, expect, it } from "vitest";
import { canEditKegiatan } from "./access";

describe("canEditKegiatan", () => {
  it("admin can always edit", () => {
    expect(canEditKegiatan(true, null, 2)).toBe(true);
    expect(canEditKegiatan(true, 1, null)).toBe(true);
  });

  it("orphan (no ketua → null prodi) is editable by anyone", () => {
    expect(canEditKegiatan(false, 1, null)).toBe(true);
    expect(canEditKegiatan(false, null, null)).toBe(true);
  });

  it("editable when the ketua belongs to my prodi", () => {
    expect(canEditKegiatan(false, 1, 1)).toBe(true);
  });

  it("NOT editable when the ketua is another prodi (I am only an anggota)", () => {
    expect(canEditKegiatan(false, 1, 2)).toBe(false);
  });

  it("NOT editable when my prodi is unknown but a ketua exists", () => {
    expect(canEditKegiatan(false, null, 2)).toBe(false);
  });
});
