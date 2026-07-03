import Link from "next/link";
import {
  GraduationCap,
  Users,
  FlaskConical,
  HeartHandshake,
  Trophy,
  BookOpenText,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getDashboardStats } from "@/features/dashboard/data";

export const metadata = { title: "Beranda · SPM Nexus" };

type Meta = {
  label: string;
  icon: LucideIcon;
  href: string;
  group: string;
  caption: string;
};

const META: Record<string, Meta> = {
  dosens: {
    label: "Dosen",
    icon: GraduationCap,
    href: "/dosen",
    group: "Sumber Daya",
    caption: "Tenaga pendidik terdaftar",
  },
  mahasiswas: {
    label: "Mahasiswa",
    icon: Users,
    href: "/mahasiswa",
    group: "Sumber Daya",
    caption: "Mahasiswa aktif & alumni",
  },
  penelitians: {
    label: "Penelitian",
    icon: FlaskConical,
    href: "/penelitian",
    group: "Tridharma",
    caption: "Kegiatan penelitian",
  },
  pengabdians: {
    label: "Pengabdian",
    icon: HeartHandshake,
    href: "/pengabdian",
    group: "Tridharma",
    caption: "Pengabdian kepada masyarakat",
  },
  prestasis: {
    label: "Prestasi",
    icon: Trophy,
    href: "/prestasi",
    group: "Capaian",
    caption: "Prestasi mahasiswa",
  },
  publikasis: {
    label: "Publikasi",
    icon: BookOpenText,
    href: "/publikasi",
    group: "Capaian",
    caption: "Karya ilmiah terpublikasi",
  },
};

export default async function HomePage() {
  const stats = await getDashboardStats();
  const total = stats.reduce((sum, s) => sum + (s.count ?? 0), 0);

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Beranda"
        description="Ringkasan data Tridharma Perguruan Tinggi dalam satu pandangan."
      />

      {/* Headline metric — breaks the uniform card grid with one featured surface. */}
      <section className="relative mb-5 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-card sm:p-8 [animation:var(--animate-fade-in)]">
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-2">
          Total entitas terkelola
        </p>
        <p className="mt-2 text-5xl font-semibold tracking-tight tabular">{total}</p>
        <p className="mt-2 max-w-[48ch] text-sm text-muted">
          Mencakup data dosen, mahasiswa, serta seluruh kegiatan dan capaian Tridharma
          yang tercatat dalam sistem.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const meta = META[stat.table];
          if (!meta) return null;
          const Icon = meta.icon;
          return (
            <Link
              key={stat.table}
              href={meta.href}
              className="group rounded-[var(--radius-base)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Card className="relative h-full overflow-hidden p-6 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-elevated group-hover:border-border-strong">
                <div className="flex items-start justify-between">
                  <span className="grid size-12 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
                    <Icon className="size-6" />
                  </span>
                  <ArrowUpRight className="size-4 text-muted-2 transition-all duration-200 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <p className="mt-5 text-3xl font-semibold tracking-tight tabular">
                  {stat.count}
                </p>
                <p className="mt-1 text-sm font-medium">{meta.label}</p>
                <p className="mt-0.5 text-xs text-muted">{meta.caption}</p>
              </Card>
            </Link>
          );
        })}
      </section>
    </>
  );
}
