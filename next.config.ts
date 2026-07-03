import type { NextConfig } from "next";

// Supabase origin the browser connects to (REST + Realtime websocket).
function safeOrigin(url: string): string {
  try {
    return url ? new URL(url).origin : "";
  } catch {
    return "";
  }
}
const supabaseOrigin = safeOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
const supabaseWs = supabaseOrigin.replace(/^https:/, "wss:");

/**
 * Content Security Policy. Pragmatic (no per-request nonce) so the public
 * landing page stays statically generated: 'unsafe-inline' is required for
 * Next's hydration bootstrap and inline styles. That residual risk is low here
 * because the app renders no untrusted HTML (no dangerouslySetInnerHTML) — all
 * dynamic text goes through React's escaping. It still blocks the high-value
 * vectors: loading external scripts, framing (clickjacking), and rogue base/form
 * targets. Applied in production only, to avoid breaking dev HMR (eval/websocket).
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' ${supabaseOrigin} ${supabaseWs}`.trim(),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
]
  .filter(Boolean)
  .join("; ");

/** Baseline security headers applied to every response (security.md). */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // CSP only in production: dev needs eval/websocket for HMR.
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Content-Security-Policy", value: csp }]
    : []),
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
