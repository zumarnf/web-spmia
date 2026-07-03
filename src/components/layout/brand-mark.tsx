import { cn } from "@/lib/utils";

/**
 * SPM Nexus logomark.
 *
 * Concept (brandkit: monogram + metaphor): the letter "N" of Nexus drawn as a
 * connected node network — four nodes joined by the left stroke, diagonal, and
 * right stroke of an "N". It reads as both a letter and a hub-and-spoke graph,
 * expressing connection (nexus) and structured quality assurance (SPM).
 *
 * Uses currentColor so it inherits theme/foreground color anywhere.
 */
export function BrandGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="SPM Nexus"
      className={className}
    >
      {/* N strokes */}
      <path
        d="M9 23V9L23 23V9"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Network nodes at the N vertices */}
      <circle cx="9" cy="9" r="3" fill="currentColor" />
      <circle cx="23" cy="23" r="3" fill="currentColor" />
      <circle cx="9" cy="23" r="2.1" fill="currentColor" opacity="0.55" />
      <circle cx="23" cy="9" r="2.1" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

/**
 * The logomark inside a branded tile — used in the sidebar, login, and topbar.
 */
export function BrandMark({
  className,
  glyphClassName,
}: {
  className?: string;
  glyphClassName?: string;
}) {
  return (
    <span
      className={cn(
        "relative grid place-items-center overflow-hidden rounded-[var(--radius-sm)] bg-primary text-primary-foreground shadow-[var(--shadow-primary)]",
        className,
      )}
    >
      {/* subtle highlight so the tile feels dimensional, not flat */}
      <span
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 to-transparent"
        aria-hidden="true"
      />
      <BrandGlyph className={cn("relative size-[60%]", glyphClassName)} />
    </span>
  );
}
