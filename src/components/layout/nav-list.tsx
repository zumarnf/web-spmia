"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "@/config/navigation";
import { cn } from "@/lib/utils";

/**
 * Shared navigation list rendered by both the desktop sidebar and the mobile
 * drawer. `onNavigate` lets the mobile drawer close itself when a link is tapped.
 */
export function NavList({
  onNavigate,
  isAdmin = false,
}: {
  onNavigate?: () => void;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();

  // Hide admin-only items from non-admins; drop groups left empty as a result.
  const groups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((it) => !it.adminOnly || isAdmin),
  })).filter((g) => g.items.length > 0);

  return (
    <nav className="flex-1 overflow-y-auto p-3">
      {groups.map((group) => (
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
                    onClick={onNavigate}
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
                      aria-hidden="true"
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
  );
}
