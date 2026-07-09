import { z } from "zod";
import { optUrl } from "@/lib/url";

const optText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null));

export const publikasiSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  tahun: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === "" || v == null) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    }),
  doi: optText,
  url: optUrl,
});

export type PublikasiInput = z.input<typeof publikasiSchema>;
