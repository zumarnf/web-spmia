import { PageHeader } from "@/components/layout/page-header";
import { getPrestasiList } from "@/features/prestasi/data";
import { getMahasiswaOptions } from "@/features/mahasiswa/data";
import { PrestasiManager } from "@/features/prestasi/components/prestasi-manager";
import { getCurrentProfile } from "@/lib/auth/guard";
import { parseListSearchParams } from "@/lib/query/list-query";

export const metadata = { title: "Prestasi · SPM Nexus" };

export default async function PrestasiPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [{ data, meta }, mahasiswaOptions, profile] = await Promise.all([
    getPrestasiList(parseListSearchParams(sp)),
    getMahasiswaOptions(),
    getCurrentProfile(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Capaian"
        title="Prestasi"
        description="Prestasi mahasiswa beserta kontributor yang terlibat."
      />
      <PrestasiManager
        rows={data}
        meta={meta}
        isAdmin={profile?.role === "admin"}
        myProdiId={profile?.id_prodi ?? null}
        mahasiswaOptions={mahasiswaOptions}
      />
    </>
  );
}
