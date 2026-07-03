import { z } from "zod";

export const historyJabatanSchema = z.object({
  nip_dosen: z.string().min(1, "Dosen wajib dipilih"),
  id_jabatan: z.coerce.number().int().positive("Jabatan wajib dipilih"),
});

export type HistoryJabatanInput = z.infer<typeof historyJabatanSchema>;
