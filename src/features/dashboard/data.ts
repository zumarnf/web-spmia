import "server-only";
import { createClient } from "@/lib/supabase/server";

const TABLES = [
  "dosens",
  "mahasiswas",
  "penelitians",
  "pengabdians",
  "prestasis",
  "publikasis",
] as const;

export type DashboardStat = { table: (typeof TABLES)[number]; count: number };

/** Row counts for each domain table (dashboard summary). */
export async function getDashboardStats(): Promise<DashboardStat[]> {
  const supabase = await createClient();
  const results = await Promise.all(
    TABLES.map(async (table) => {
      const { count } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      return { table, count: count ?? 0 };
    }),
  );
  return results;
}
