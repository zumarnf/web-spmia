"use server";
import { withAction } from "@/lib/action";
import { getCurrentProfile, requireAdmin } from "@/lib/auth/guard";
import { profileUpdateSchema } from "./schemas";
import type { ActionResult } from "@/types/api";

const PATH = "/pengguna";

/** Admin-only: change a user's role and program studi. */
export async function updateProfile(
  id: string,
  input: unknown,
): Promise<ActionResult<null>> {
  return withAction({
    guard: requireAdmin,
    revalidate: PATH,
    success: "Pengguna diperbarui",
    run: async (supabase) => {
      const values = profileUpdateSchema.parse(input);
      // Safety: an admin must not demote their own account and risk locking
      // everyone out of user management.
      const me = await getCurrentProfile();
      if (me?.id === id && values.role !== "admin")
        return {
          ok: false,
          message: "Tidak bisa menurunkan role admin akun Anda sendiri.",
        };
      const { error } = await supabase.from("profiles").update(values).eq("id", id);
      if (error) return { ok: false, message: "Gagal memperbarui pengguna" };
      return { ok: true, data: null };
    },
  });
}
