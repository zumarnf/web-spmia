import { describe, expect, it } from "vitest";
import { dosenSchema } from "./schemas";

const valid = {
  nip: "198001012005011001",
  nidn: "0101018001",
  name: "Budi Santoso",
  id_prodi: "3",
};

describe("dosenSchema", () => {
  it("accepts a valid payload and coerces id_prodi to a number", () => {
    const r = dosenSchema.parse(valid);
    expect(r.id_prodi).toBe(3);
    expect(typeof r.id_prodi).toBe("number");
  });

  it("rejects a non-numeric NIP", () => {
    const r = dosenSchema.safeParse({ ...valid, nip: "ABC123" });
    expect(r.success).toBe(false);
    if (!r.success)
      expect(r.error.flatten().fieldErrors.nip).toContain(
        "NIP hanya boleh berisi angka",
      );
  });

  it("rejects empty required fields", () => {
    const r = dosenSchema.safeParse({ ...valid, nidn: "", name: "" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const fe = r.error.flatten().fieldErrors;
      expect(fe.nidn).toBeDefined();
      expect(fe.name).toBeDefined();
    }
  });

  it("rejects a non-positive id_prodi", () => {
    expect(dosenSchema.safeParse({ ...valid, id_prodi: "0" }).success).toBe(false);
  });

  it("transforms blank optional text fields to null", () => {
    const r = dosenSchema.parse({ ...valid, gelar_depan: "  ", pendidikan: "S3" });
    expect(r.gelar_depan).toBeNull();
    expect(r.pendidikan).toBe("S3");
  });
});
