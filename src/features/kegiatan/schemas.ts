import { z } from "zod";

const optText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null));

const optInt = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === "" || v === undefined || v === null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  });

/** Shared shape for penelitian & pengabdian (same columns, docs §3.3). */
export const kegiatanSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  no_sk: optText,
  no_kontrak: optText,
  skema: optText,
  tahun: optInt,
  bidang: optText,
  dana: optInt,
  sumber_dana: z.enum(["Internal", "Eksternal"]).nullable().optional(),
  laporan_akhir: optText,
});

export type KegiatanInput = z.input<typeof kegiatanSchema>;

export const kontribDosenSchema = z.object({
  nip_dosen: z.string().min(1, "Dosen wajib dipilih"),
  peran: z.enum(["ketua", "anggota"]),
});

export const kontribMahasiswaSchema = z.object({
  nim_mahasiswa: z.coerce.number().int().positive("Mahasiswa wajib dipilih"),
  peran: z.enum(["ketua", "anggota"]),
});
