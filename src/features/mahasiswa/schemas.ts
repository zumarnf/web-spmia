import { z } from "zod";

export const mahasiswaSchema = z.object({
  nim: z.coerce.number().int().positive("NIM wajib berupa angka"),
  name: z.string().min(1, "Nama wajib diisi"),
  angkatan: z.coerce.number().int().min(1900, "Angkatan tidak valid"),
  id_prodi: z.coerce.number().int().positive("Program studi wajib dipilih"),
});

export type MahasiswaInput = z.input<typeof mahasiswaSchema>;
