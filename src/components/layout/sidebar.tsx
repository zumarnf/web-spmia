"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/layout/brand-mark";
import { NAV_GROUPS } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface/60 backdrop-blur-sm md:flex">
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <BrandMark className="size-9" />
        <span className="flex flex-col leading-none">
          <span className="font-semibold tracking-tight">SPM Nexus</span>
          <span className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-muted-2">
            Tridharma
          </span>
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-2">
              {group.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm transition-all duration-200",
                        active
                          ? "bg-primary/[0.08] font-medium text-primary"
                          : "text-foreground/75 hover:bg-foreground/[0.05] hover:text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-200",
                          active ? "opacity-100" : "opacity-0",
                        )}
                        aria-hidden="true"
                      />
                      <Icon
                        className={cn(
                          "size-4 transition-colors",
                          active ? "text-primary" : "text-muted group-hover:text-foreground",
                        )}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
