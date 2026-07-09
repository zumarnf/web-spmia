import { z } from "zod";

/**
 * Only http(s) URLs are safe to place in an href/src. Everything else —
 * `javascript:`, `data:`, `vbscript:`, relative junk — is rejected to stop
 * stored-XSS via link fields (NFR-SEC: user input crossing into the DOM).
 */
export function isSafeHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Render-time guard: return the URL only when it is http(s), else undefined.
 * Protects rows written before validation existed (validation guards new
 * writes only; this guards the output).
 */
export function safeHref(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return isSafeHttpUrl(value) ? value : undefined;
}

/**
 * Optional http(s) URL form field → trimmed string or null. Empty becomes null;
 * a non-http(s) scheme fails validation with a user-facing message.
 */
export const optUrl = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || isSafeHttpUrl(v), {
    message: "URL harus diawali http:// atau https://",
  });
