import { z } from "zod";

const optText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null));

export const prestasiSchema = z.object({
  nama_lomba: optText,
  juara: optText,
  url_foto: optText,
  url_sertifikat: optText,
});

export type PrestasiInput = z.input<typeof prestasiSchema>;

export const prestasiMahasiswaSchema = z.object({
  nim_mahasiswa: z.coerce.number().int().positive("Mahasiswa wajib dipilih"),
  peran: z.enum(["ketua", "anggota"]),
});
