import { notFound } from "next/navigation";
import { FlaskConical, HeartHandshake, Trophy, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/common/back-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMahasiswaByNim } from "@/features/mahasiswa/data";

type Kontrib = {
  peran: string;
  penelitian?: { judul: string } | null;
  pengabdian?: { judul: string } | null;
  prestasi?: { nama_lomba: string | null } | null;
};

export default async function MahasiswaDetailPage({
  params,
}: {
  params: Promise<{ nim: string }>;
}) {
  const { nim } = await params;
  const data = await getMahasiswaByNim(Number(nim));
  if (!data) notFound();

  const m = data as Record<string, unknown> & {
    name: string;
    nim: number;
    angkatan: number;
    prodi: { name: string } | null;
    penelitian: Kontrib[];
    pengabdian: Kontrib[];
    prestasi: Kontrib[];
  };

  const initials = m.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();

  const totalKontrib = m.penelitian.length + m.pengabdian.length + m.prestasi.length;

  return (
    <>
      <PageHeader
        eyebrow="Mahasiswa"
        title={m.name}
        description={`NIM ${String(m.nim)} · Angkatan ${m.angkatan}`}
        actions={<BackLink href="/mahasiswa" />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Profile — sticky on wide screens so context stays visible. */}
        <Card className="lg:sticky lg:top-20 lg:self-start">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/10 text-lg font-semibold text-primary ring-1 ring-inset ring-primary/15">
                {initials || "?"}
              </span>
              <div className="min-w-0">
                <p className="break-words font-semibold leading-tight">{m.name}</p>
                <p className="mt-0.5 text-sm text-muted">Angkatan {m.angkatan}</p>
              </div>
            </div>
            <dl className="mt-5 flex flex-col text-sm">
              <Row label="NIM" value={String(m.nim)} />
              <Row label="Program Studi" value={m.prodi?.name ?? "—"} />
              <Row label="Total Kontribusi" value={String(totalKontrib)} />
            </dl>
          </CardContent>
        </Card>

        {/* Contributions — full width, wrapping titles, never truncated. */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <KontribCard
            title="Penelitian"
            icon={FlaskConical}
            items={m.penelitian}
            render={(k) => k.penelitian?.judul}
          />
          <KontribCard
            title="Pengabdian"
            icon={HeartHandshake}
            items={m.pengabdian}
            render={(k) => k.pengabdian?.judul}
          />
          <KontribCard
            title="Prestasi"
            icon={Trophy}
            items={m.prestasi}
            render={(k) => k.prestasi?.nama_lomba}
          />
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-2.5 last:border-0">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="break-words text-right font-medium">{value}</dd>
    </div>
  );
}

function KontribCard({
  title,
  icon: Icon,
  items,
  render,
}: {
  title: string;
  icon: LucideIcon;
  items: Kontrib[];
  render: (k: Kontrib) => string | null | undefined;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-4 text-primary" /> {title}
        </CardTitle>
        <Badge variant="neutral">{items.length}</Badge>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="rounded-[var(--radius-sm)] border border-dashed border-border px-3 py-5 text-center text-sm text-muted">
            Belum ada {title.toLowerCase()}.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((k, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 py-3 text-sm"
              >
                <span className="min-w-0 break-words leading-snug">
                  {render(k) ?? "—"}
                </span>
                <Badge variant={k.peran === "ketua" ? "primary" : "neutral"}>
                  {k.peran}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
