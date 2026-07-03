"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/layout/brand-mark";
import { NavList } from "@/components/layout/nav-list";

/**
 * Mobile navigation: a hamburger button (below `md`) that opens a slide-in
 * drawer holding the same nav as the desktop sidebar. Without this, the sidebar
 * is `hidden` on small screens and the user cannot reach other pages.
 *
 * Closes on: link tap, overlay click, Escape, and route change. Locks body
 * scroll while open. The desktop sidebar remains the nav from `md` upward.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close whenever the route changes (covers link taps and programmatic nav).
  // Adjusting state during render (React's recommended pattern) instead of in an
  // effect keeps it lint-clean and avoids an extra render.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  // While open: Escape closes, background scroll is locked, focus moves into the
  // drawer, and focus returns to the trigger on close.
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Buka menu navigasi"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" aria-hidden="true" />
      </Button>

      {open &&
        createPortal(
        <div
          className="fixed inset-0 z-40 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
        >
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm [animation:var(--animate-fade-in)]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col overflow-hidden overscroll-contain border-r border-border bg-surface shadow-floating [animation:var(--animate-slide-in-left)]">
            <div className="flex h-16 items-center justify-between gap-3 border-b border-border px-5">
              <div className="flex items-center gap-3">
                <BrandMark className="size-9" />
                <span className="flex flex-col leading-none">
                  <span className="font-semibold tracking-tight">SPM Nexus</span>
                  <span className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-muted-2">
                    Tridharma
                  </span>
                </span>
              </div>
              <Button
                ref={closeRef}
                variant="ghost"
                size="icon"
                aria-label="Tutup menu"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" aria-hidden="true" />
              </Button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
          </aside>
        </div>,
          document.body,
        )}
    </>
  );
}
