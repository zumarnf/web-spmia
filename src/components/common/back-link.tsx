import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Styled "back" link (renders an anchor, not nested in a button). */
export function BackLink({ href, label = "Kembali" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-base)] border border-border bg-surface px-4 text-sm font-medium hover:bg-foreground/5"
    >
      <ArrowLeft className="size-4" />
      {label}
    </Link>
  );
}
