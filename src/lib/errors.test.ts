import { describe, expect, it } from "vitest";
import { z } from "zod";
import { deleteErrorMessage, kontribErrorMessage, toActionError } from "./errors";

describe("toActionError", () => {
  it("maps a ZodError to field errors", () => {
    const schema = z.object({ name: z.string().min(1, "wajib") });
    const err = schema.safeParse({ name: "" });
    if (err.success) throw new Error("expected parse to fail");

    const result = toActionError(err.error);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.message).toBe("Validasi gagal");
    expect(result.fieldErrors?.name).toContain("wajib");
  });

  it("maps UNAUTHENTICATED to a login message", () => {
    const result = toActionError(new Error("UNAUTHENTICATED"));
    expect(result).toEqual({
      ok: false,
      message: "Sesi tidak valid. Silakan login ulang.",
    });
  });

  it("maps FORBIDDEN to an admin-only message", () => {
    const result = toActionError(new Error("FORBIDDEN"));
    expect(result).toEqual({
      ok: false,
      message: "Akses ditolak. Hanya admin yang diizinkan.",
    });
  });

  it("falls back to a generic message for unknown errors", () => {
    expect(toActionError(new Error("boom"))).toEqual({
      ok: false,
      message: "Terjadi kesalahan. Coba lagi.",
    });
    expect(toActionError("not-an-error")).toEqual({
      ok: false,
      message: "Terjadi kesalahan. Coba lagi.",
    });
  });
});

describe("kontribErrorMessage", () => {
  it("detects the single-ketua unique violation", () => {
    const msg = kontribErrorMessage({
      code: "23505",
      message: 'duplicate key value violates unique constraint "one_ketua_idx"',
    });
    expect(msg).toBe("Sudah ada ketua pada kegiatan ini — hanya boleh satu ketua.");
  });

  it("treats other 23505 violations as a duplicate contributor", () => {
    const msg = kontribErrorMessage({ code: "23505", message: "duplicate key" });
    expect(msg).toBe("Kontributor ini sudah terdaftar pada kegiatan ini.");
  });

  it("maps a foreign-key violation (23503) to a not-found message", () => {
    const msg = kontribErrorMessage({ code: "23503", message: "fk violation" });
    expect(msg).toBe("Data yang dipilih tidak ditemukan. Muat ulang lalu coba lagi.");
  });

  it("falls back for unknown / null errors", () => {
    expect(kontribErrorMessage({ code: "99999" })).toBe(
      "Gagal menambah kontributor. Coba lagi.",
    );
    expect(kontribErrorMessage(null)).toBe("Gagal menambah kontributor. Coba lagi.");
  });
});

describe("deleteErrorMessage", () => {
  it("explains a foreign-key violation (23503) as still-in-use", () => {
    expect(deleteErrorMessage({ code: "23503", message: "fk violation" })).toBe(
      "Tidak bisa dihapus karena masih dipakai oleh data lain.",
    );
  });

  it("falls back to a generic delete message otherwise", () => {
    expect(deleteErrorMessage({ code: "23505" })).toBe("Gagal menghapus data");
    expect(deleteErrorMessage(null)).toBe("Gagal menghapus data");
  });
});
