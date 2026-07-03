import { BrandMark } from "@/components/layout/brand-mark";
import { NavList } from "@/components/layout/nav-list";

export function Sidebar() {
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
      <NavList />
    </aside>
  );
}
