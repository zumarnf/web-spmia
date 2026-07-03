import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null));

export const dosenSchema = z.object({
  nip: z
    .string()
    .trim()
    .min(1, "NIP wajib diisi")
    .regex(/^\d+$/, "NIP hanya boleh berisi angka"),
  nidn: z.string().min(1, "NIDN wajib diisi"),
  name: z.string().min(1, "Nama wajib diisi"),
  id_prodi: z.coerce.number().int().positive("Program studi wajib dipilih"),
  status: z.enum(["Aktif", "Tidak aktif", "Eksternal"]).nullable().optional(),
  gelar_depan: optionalText,
  gelar_belakang: optionalText,
  pendidikan: optionalText,
  kode_dosen: optionalText,
});

export type DosenInput = z.input<typeof dosenSchema>;
