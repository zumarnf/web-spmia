import { z } from "zod";

export const profileUpdateSchema = z.object({
  role: z.enum(["admin", "prodi"]),
  id_prodi: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === "" || v == null) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    }),
});

export type ProfileUpdateInput = z.input<typeof profileUpdateSchema>;
