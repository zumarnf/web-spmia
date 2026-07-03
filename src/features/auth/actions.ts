"use server";
import { redirect } from "next/navigation";
import { withAction } from "@/lib/action";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "./schemas";
import type { ActionResult } from "@/types/api";

/** Authenticate with email + password (FR-AUTH-01/02). */
export async function signIn(input: unknown): Promise<ActionResult<null>> {
  return withAction({
    success: "Login berhasil",
    run: async (supabase) => {
      const { email, password } = loginSchema.parse(input);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      // Generic message: do not reveal which field is wrong (FR-AUTH-01).
      if (error) return { ok: false, message: "Kredensial salah." };
      return { ok: true, data: null };
    },
  });
}

/** Revoke the session and return to the login page (FR-AUTH-03). */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
