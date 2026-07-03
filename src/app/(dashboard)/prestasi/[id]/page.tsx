import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/common/back-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPrestasiById } from "@/features/prestasi/data";
import {
  addPrestasiMahasiswa,
  removePrestasiMahasiswa,
} from "@/features/prestasi/actions";
import { getMahasiswaOptions } from "@/features/mahasiswa/data";
import {
  KontribPanel,
  type KontribItem,
} from "@/features/kegiatan/components/kontrib-panel";
import { getCurrentProfile } from "@/lib/auth/guard";

type Detail = {
  nama_lomba: string | null;
  juara: string | null;
  url_foto: string | null;
  url_sertifikat: string | null;
  mahasiswa: { id: number; peran: string; mahasiswa: { name: string } | null }[];
};

export default async function PrestasiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  const [data, mahasiswaOptions, profile] = await Promise.all([
    getPrestasiById(numId),
    getMahasiswaOptions(),
    getCurrentProfile(),
  ]);
  if (!data) notFound();

  const p = data as Detail;
  const items: KontribItem[] = p.mahasiswa.map((m) => ({
    id: m.id,
    peran: m.peran,
    name: m.mahasiswa?.name ?? "-",
  }));

  return (
    <>
      <PageHeader
        eyebrow="Prestasi"
        title={p.nama_lomba ?? "Prestasi"}
        description={p.juara ? `Juara: ${p.juara}` : undefined}
        actions={<BackLink href="/prestasi" />}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted">Juara</span>
              {p.juara ? <Badge variant="primary">{p.juara}</Badge> : <span>-</span>}
            </div>
            <a
              className="text-secondary underline-offset-2 hover:underline"
              href={p.url_sertifikat ?? "#"}
              aria-disabled={!p.url_sertifikat}
            >
              {p.url_sertifikat ? "Lihat sertifikat" : "Sertifikat belum ada"}
            </a>
            {p.url_foto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.url_foto}
                alt={`Foto prestasi ${p.nama_lomba ?? ""}`}
                className="mt-2 max-h-64 w-full rounded-lg border border-border object-cover"
              />
            )}
          </CardContent>
        </Card>
        <KontribPanel
          title="Mahasiswa"
          idField="nim_mahasiswa"
          items={items}
          options={mahasiswaOptions.map((m) => ({ value: m.nim, label: m.name }))}
          isAdmin={profile?.role === "admin"}
          onAdd={addPrestasiMahasiswa.bind(null, numId)}
          onRemove={removePrestasiMahasiswa}
        />
      </div>
    </>
  );
}
