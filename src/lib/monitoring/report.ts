/**
 * Centralized error monitoring entry point.
 *
 * Every captured error funnels through `reportError` so the project has a single
 * place to plug in an external sink (Sentry, Logtail, an HTTP endpoint, …) later
 * without touching call sites. For now it emits a structured log line and, when
 * `MONITORING_WEBHOOK_URL` is set, forwards a JSON payload to that endpoint.
 *
 * Safe to import from both server and client code: it has no server-only deps.
 */

export type ErrorSeverity = "fatal" | "error" | "warning";

export type ErrorContext = {
  /** Where the error was caught, e.g. "server-action", "api-route", "request". */
  source?: string;
  /** Severity used for triage/filtering. */
  severity?: ErrorSeverity;
  /** Arbitrary structured tags (route, userId, feature, …). */
  tags?: Record<string, string | number | boolean | null | undefined>;
};

type ReportPayload = {
  timestamp: string;
  severity: ErrorSeverity;
  source: string;
  name: string;
  message: string;
  stack?: string;
  tags?: ErrorContext["tags"];
};

/** Normalize any thrown value into a name/message/stack triple. */
function describe(error: unknown): Pick<ReportPayload, "name" | "message" | "stack"> {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return { name: "NonError", message: String(error) };
}

/**
 * Expected, user-facing control-flow errors that are not real failures.
 * These are thrown to short-circuit auth and should not pollute monitoring.
 */
const IGNORED_MESSAGES = new Set(["UNAUTHENTICATED", "FORBIDDEN"]);

function isIgnored(error: unknown): boolean {
  return error instanceof Error && IGNORED_MESSAGES.has(error.message);
}

/** Fire-and-forget forward to an external sink, if configured. */
function forward(payload: ReportPayload): void {
  const url =
    typeof process !== "undefined" ? process.env.MONITORING_WEBHOOK_URL : undefined;
  if (!url) return;

  // Never let monitoring break the request; swallow transport errors.
  void fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}

/**
 * Capture an error for monitoring. Returns the structured payload (handy in tests).
 * Returns `null` when the error is an ignored control-flow signal.
 */
export function reportError(
  error: unknown,
  context: ErrorContext = {},
): ReportPayload | null {
  if (isIgnored(error)) return null;

  const payload: ReportPayload = {
    timestamp: new Date().toISOString(),
    severity: context.severity ?? "error",
    source: context.source ?? "unknown",
    ...describe(error),
    tags: context.tags,
  };

  // Structured single-line log so log aggregators can parse it.
  console.error("[monitoring]", JSON.stringify(payload));
  forward(payload);

  return payload;
}
