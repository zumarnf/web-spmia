"use client";
import { LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/actions";
import type { UserRole } from "@/types/database.types";

export function UserMenu({ name, role }: { name: string; role: UserRole }) {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium leading-tight">{name}</p>
        <Badge variant={role === "admin" ? "primary" : "secondary"}>{role}</Badge>
      </div>
      <form action={signOut}>
        <Button type="submit" variant="outline" size="sm">
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Keluar</span>
        </Button>
      </form>
    </div>
  );
}
