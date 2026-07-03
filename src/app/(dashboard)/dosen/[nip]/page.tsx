import { notFound } from "next/navigation";
import { FlaskConical, HeartHandshake, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/common/back-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDosenByNip } from "@/features/dosen/data";

type Item = { id: number; judul: string; tahun: number | null } | null;
type Kontrib = { peran: string; penelitian?: Item; pengabdian?: Item };
type History = { id: number; jabatan: { jabatan: string; sub_jabatan: string } | null };

export default async function DosenDetailPage({
  params,
}: {
  params: Promise<{ nip: string }>;
}) {
  const { nip } = await params;
  const dosen = await getDosenByNip(nip);
  if (!dosen) notFound();

  const d = dosen as Record<string, unknown> & {
    name: string;
    history: History[];
    penelitian: Kontrib[];
    pengabdian: Kontrib[];
    prodi: { name: string } | null;
  };

  const fullName = `${d.gelar_depan ? `${d.gelar_depan} ` : ""}${d.name}${
    d.gelar_belakang ? `, ${d.gelar_belakang}` : ""
  }`;
  const initials = String(d.name)
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <>
      <PageHeader
        eyebrow="Dosen"
        title={fullName}
        description={`NIP ${String(d.nip)} · NIDN ${String(d.nidn)}`}
        actions={<BackLink href="/dosen" />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4">
          <Card className="lg:sticky lg:top-20 lg:self-start">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/10 text-lg font-semibold text-primary ring-1 ring-inset ring-primary/15">
                  {initials || "?"}
                </span>
                <div className="min-w-0">
                  <p className="break-words font-semibold leading-tight">{d.name as string}</p>
                  <p className="mt-0.5 text-sm text-muted">{d.prodi?.name ?? "—"}</p>
                </div>
              </div>
              <dl className="mt-5 flex flex-col text-sm">
                <Row label="Status" value={(d.status as string) ?? "—"} />
                <Row label="Pendidikan" value={(d.pendidikan as string) ?? "—"} />
                <Row label="Kode Dosen" value={(d.kode_dosen as string) ?? "—"} />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Riwayat Jabatan</CardTitle>
              <Badge variant="neutral">{d.history.length}</Badge>
            </CardHeader>
            <CardContent>
              {d.history.length === 0 ? (
                <p className="rounded-[var(--radius-sm)] border border-dashed border-border px-3 py-5 text-center text-sm text-muted">
                  Belum ada data.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {d.history.map((h) => (
                    <li
                      key={h.id}
                      className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 py-2.5 text-sm"
                    >
                      <span className="min-w-0 break-words font-medium">
                        {h.jabatan?.jabatan ?? "—"}
                      </span>
                      <Badge variant="secondary">{h.jabatan?.sub_jabatan ?? "—"}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <KontribCard
            title="Penelitian"
            icon={FlaskConical}
            items={d.penelitian}
            pick="penelitian"
          />
          <KontribCard
            title="Pengabdian"
            icon={HeartHandshake}
            items={d.pengabdian}
            pick="pengabdian"
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
  pick,
}: {
  title: string;
  icon: LucideIcon;
  items: Kontrib[];
  pick: "penelitian" | "pengabdian";
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
            {items.map((k, i) => {
              const item = k[pick] ?? null;
              return (
                <li
                  key={i}
                  className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 py-3 text-sm"
                >
                  <span className="min-w-0 break-words leading-snug">
                    {item?.judul ?? "—"}
                    {item?.tahun && (
                      <span className="ml-1 text-muted-2">· {item.tahun}</span>
                    )}
                  </span>
                  <Badge variant={k.peran === "ketua" ? "primary" : "neutral"}>
                    {k.peran}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
