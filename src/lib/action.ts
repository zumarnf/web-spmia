import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toActionError } from "@/lib/errors";
import { reportError } from "@/lib/monitoring/report";
import type { ActionResult } from "@/types/api";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/** A failure short-circuit, or the success payload to wrap in ActionResult. */
type RunResult<TData> = { ok: false; message: string } | { ok: true; data: TData };

type WithActionOptions<TData> = {
  /** Auth guard to run first (requireUser / requireAdmin). Omit for public actions. */
  guard?: () => Promise<unknown>;
  /** Path(s) to revalidate after a successful mutation. */
  revalidate?: string | string[];
  /** Success message returned to the client. */
  success: string;
  /** Feature-specific logic: parse input, run the query, map specific errors. */
  run: (supabase: SupabaseServerClient) => Promise<RunResult<TData>>;
};

/**
 * Wrap a mutation Server Action with the shared cross-cutting concerns:
 * auth guard, Supabase client creation, error mapping (toActionError),
 * cache revalidation, and the ActionResult shape. The caller's `run` only
 * holds the logic unique to that action.
 */
export async function withAction<TData = null>(
  opts: WithActionOptions<TData>,
): Promise<ActionResult<TData>> {
  try {
    if (opts.guard) await opts.guard();
    const supabase = await createClient();
    const result = await opts.run(supabase);
    if (!result.ok) return result;

    if (opts.revalidate) {
      const paths = Array.isArray(opts.revalidate) ? opts.revalidate : [opts.revalidate];
      for (const path of paths) revalidatePath(path);
    }
    return { ok: true, data: result.data, message: opts.success };
  } catch (error) {
    // Capture for monitoring (ignored control-flow signals are filtered inside).
    reportError(error, { source: "server-action" });
    // Dead session: bounce to /login instead of a toast the user can't act on.
    // redirect() throws NEXT_REDIRECT, which Next propagates to the client
    // (complements the client-side SessionWatcher for the post-submit case).
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      redirect("/login");
    }
    return toActionError(error);
  }
}
