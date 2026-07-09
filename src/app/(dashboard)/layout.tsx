import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { SessionWatcher } from "@/features/auth/components/session-watcher";
import { getCurrentProfile } from "@/lib/auth/guard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div className="flex min-h-dvh">
      <SessionWatcher />
      <Sidebar isAdmin={profile.role === "admin"} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar name={profile.name} role={profile.role} />
        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
