import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import type { UserRole } from "@/types/database.types";

export function Topbar({ name, role }: { name: string; role: UserRole }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-surface/80 px-5 backdrop-blur">
      <div className="md:hidden font-semibold tracking-tight">SPM Nexus</div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <UserMenu name={name} role={role} />
      </div>
    </header>
  );
}
