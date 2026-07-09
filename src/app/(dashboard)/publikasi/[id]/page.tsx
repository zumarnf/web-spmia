import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { BackLink } from "@/components/common/back-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublikasiById } from "@/features/publikasi/data";
import {
  addPublikasiDosen,
  addPublikasiMahasiswa,
  removePublikasiDosen,
  removePublikasiMahasiswa,
} from "@/features/publikasi/actions";
import { getDosenOptions } from "@/features/dosen/data";
import { getMahasiswaOptions } from "@/features/mahasiswa/data";
import { KontribSection } from "@/features/kegiatan/components/kontrib-section";
import type { KontribItem, Option } from "@/features/kegiatan/components/kontrib-panel";
import { getCurrentProfile } from "@/lib/auth/guard";
import { safeHref } from "@/lib/url";

type Detail = {
  id: number;
  judul: string;
  tahun: number | null;
  doi: string | null;
  url: string | null;
  dosen: { id: number; peran: string; dosen: { name: string } | null }[];
  mahasiswa: { id: number; peran: string; mahasiswa: { name: string } | null }[];
};

export default async function PublikasiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  const [data, dosenOptions, mahasiswaOptions, profile] = await Promise.all([
    getPublikasiById(numId),
    getDosenOptions(),
    getMahasiswaOptions(),
    getCurrentProfile(),
  ]);
  if (!data) notFound();

  const p = data as Detail;
  const dosenItems: KontribItem[] = p.dosen.map((d) => ({
    id: d.id,
    peran: d.peran,
    name: d.dosen?.name ?? "-",
  }));
  const mhsItems: KontribItem[] = p.mahasiswa.map((m) => ({
    id: m.id,
    peran: m.peran,
    name: m.mahasiswa?.name ?? "-",
  }));
  const dosenOpts: Option[] = dosenOptions.map((d) => ({ value: d.nip, label: d.name }));
  const mhsOpts: Option[] = mahasiswaOptions.map((m) => ({ value: m.nim, label: m.name }));

  return (
    <>
      <PageHeader
        eyebrow="Publikasi"
        title={p.judul}
        description={p.tahun ? `Tahun ${p.tahun}` : undefined}
        actions={<BackLink href="/publikasi" />}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Ringkasan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col text-sm">
            <div className="flex items-start justify-between gap-4 border-b border-border/60 py-2.5">
              <span className="shrink-0 text-muted">DOI</span>
              <span className="break-words text-right font-medium">
                {p.doi || <span className="font-normal text-muted-2">—</span>}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-muted">Total Kontributor</span>
              <span className="font-semibold tabular">
                {dosenItems.length + mhsItems.length}
              </span>
            </div>
            {safeHref(p.url) && (
              <a
                href={safeHref(p.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-secondary underline-offset-4 hover:underline"
              >
                <ExternalLink className="size-4" /> Buka publikasi
              </a>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <KontribSection
            kegiatanId={p.id}
            dosenItems={dosenItems}
            mahasiswaItems={mhsItems}
            dosenOptions={dosenOpts}
            mahasiswaOptions={mhsOpts}
            isAdmin={profile?.role === "admin"}
            actions={{
              addDosen: addPublikasiDosen,
              addMahasiswa: addPublikasiMahasiswa,
              removeDosen: removePublikasiDosen,
              removeMahasiswa: removePublikasiMahasiswa,
            }}
          />
        </div>
      </div>
    </>
  );
}
