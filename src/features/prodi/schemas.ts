import { z } from "zod";

export const prodiSchema = z.object({
  name: z.string().min(1, "Nama prodi wajib diisi"),
  kode_prodi: z.string().min(1, "Kode prodi wajib diisi"),
});

export type ProdiInput = z.infer<typeof prodiSchema>;
