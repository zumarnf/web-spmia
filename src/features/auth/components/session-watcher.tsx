"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Real-time session guard for the authenticated area. When the Supabase session
 * ends — refresh token expired/revoked, or sign-out elsewhere — the browser
 * client emits SIGNED_OUT (autoRefresh fires in the background even while idle),
 * and we bounce the user to /login immediately instead of leaving a dead page on
 * screen. The server (middleware + requireUser + RLS) remains the real security
 * boundary; this is a UX layer only.
 */
export function SessionWatcher() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.replace("/login");
        router.refresh();
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return null;
}
