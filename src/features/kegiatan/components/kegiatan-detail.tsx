import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/common/back-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";
import { KontribSection, type KontribActions } from "./kontrib-section";
import type { KontribItem, Option } from "./kontrib-panel";

type Kegiatan = {
  id: number;
  judul: string;
  no_sk: string | null;
  no_kontrak: string | null;
  skema: string | null;
  tahun: number | null;
  bidang: string | null;
  dana: number | null;
  sumber_dana: string | null;
  laporan_akhir: string | null;
  dosen: { id: number; peran: string; dosen: { name: string } | null }[];
  mahasiswa: { id: number; peran: string; mahasiswa: { name: string } | null }[];
};

export function KegiatanDetailView({
  title,
  backHref,
  data,
  isAdmin,
  dosenOptions,
  mahasiswaOptions,
  actions,
}: {
  title: string;
  backHref: string;
  data: unknown;
  isAdmin: boolean;
  dosenOptions: { nip: string; name: string }[];
  mahasiswaOptions: { nim: number; name: string }[];
  actions: KontribActions;
}) {
  const k = data as Kegiatan;

  const dosenItems: KontribItem[] = k.dosen.map((d) => ({
    id: d.id,
    peran: d.peran,
    name: d.dosen?.name ?? "-",
  }));
  const mhsItems: KontribItem[] = k.mahasiswa.map((m) => ({
    id: m.id,
    peran: m.peran,
    name: m.mahasiswa?.name ?? "-",
  }));
  const dosenOpts: Option[] = dosenOptions.map((d) => ({ value: d.nip, label: d.name }));
  const mhsOpts: Option[] = mahasiswaOptions.map((m) => ({
    value: m.nim,
    label: m.name,
  }));

  const totalKontrib = dosenItems.length + mhsItems.length;

  return (
    <>
      <PageHeader
        eyebrow={title}
        title={k.judul}
        description={
          [k.tahun ? `Tahun ${k.tahun}` : null, k.bidang]
            .filter(Boolean)
            .join(" · ") || undefined
        }
        actions={<BackLink href={backHref} />}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Ringkasan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col text-sm">
            <Info label="No. SK" value={k.no_sk} />
            <Info label="No. Kontrak" value={k.no_kontrak} />
            <Info label="Skema" value={k.skema} />
            <Info label="Bidang" value={k.bidang} />
            <Info label="Dana" value={formatRupiah(k.dana)} />
            <div className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-muted">Sumber Dana</span>
              {k.sumber_dana ? (
                <Badge variant="secondary">{k.sumber_dana}</Badge>
              ) : (
                <span className="text-muted-2">—</span>
              )}
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-muted">Total Kontributor</span>
              <span className="font-semibold tabular">{totalKontrib}</span>
            </div>
            {k.laporan_akhir && (
              <a
                href={k.laporan_akhir}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-secondary underline-offset-4 hover:underline"
              >
                <ExternalLink className="size-4" /> Lihat laporan akhir
              </a>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <KontribSection
            kegiatanId={k.id}
            dosenItems={dosenItems}
            mahasiswaItems={mhsItems}
            dosenOptions={dosenOpts}
            mahasiswaOptions={mhsOpts}
            isAdmin={isAdmin}
            actions={actions}
          />
        </div>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-2.5 last:border-0">
      <span className="shrink-0 text-muted">{label}</span>
      <span className="break-words text-right font-medium">
        {value || <span className="font-normal text-muted-2">—</span>}
      </span>
    </div>
  );
}
