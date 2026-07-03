import { describe, expect, it } from "vitest";
import {
  kegiatanSchema,
  kontribDosenSchema,
  kontribMahasiswaSchema,
} from "./schemas";

describe("kegiatanSchema", () => {
  it("requires a non-empty judul", () => {
    const r = kegiatanSchema.safeParse({ judul: "" });
    expect(r.success).toBe(false);
  });

  it("coerces numeric strings and blanks to null for optional int fields", () => {
    const r = kegiatanSchema.parse({ judul: "Riset A", tahun: "2024", dana: "" });
    expect(r.tahun).toBe(2024);
    expect(r.dana).toBeNull();
  });

  it("turns non-finite numeric input into null", () => {
    const r = kegiatanSchema.parse({ judul: "Riset A", tahun: "abc" });
    expect(r.tahun).toBeNull();
  });

  it("rejects an invalid sumber_dana enum value", () => {
    const r = kegiatanSchema.safeParse({ judul: "Riset A", sumber_dana: "Hibah" });
    expect(r.success).toBe(false);
  });

  it("normalizes blank optional text to null", () => {
    const r = kegiatanSchema.parse({ judul: "Riset A", no_sk: "  ", skema: "Dasar" });
    expect(r.no_sk).toBeNull();
    expect(r.skema).toBe("Dasar");
  });
});

describe("kontribDosenSchema", () => {
  it("accepts a valid dosen contributor", () => {
    expect(
      kontribDosenSchema.parse({ nip_dosen: "1980", peran: "ketua" }),
    ).toEqual({ nip_dosen: "1980", peran: "ketua" });
  });

  it("rejects an unknown peran", () => {
    expect(
      kontribDosenSchema.safeParse({ nip_dosen: "1980", peran: "reviewer" }).success,
    ).toBe(false);
  });
});

describe("kontribMahasiswaSchema", () => {
  it("coerces nim_mahasiswa to a positive integer", () => {
    const r = kontribMahasiswaSchema.parse({ nim_mahasiswa: "123", peran: "anggota" });
    expect(r.nim_mahasiswa).toBe(123);
  });

  it("rejects a non-positive nim", () => {
    expect(
      kontribMahasiswaSchema.safeParse({ nim_mahasiswa: "0", peran: "anggota" }).success,
    ).toBe(false);
  });
});
