import { PageHeader } from "@/components/layout/page-header";
import { getMahasiswaList } from "@/features/mahasiswa/data";
import { getProdiOptions } from "@/features/prodi/data";
import { MahasiswaManager } from "@/features/mahasiswa/components/mahasiswa-manager";
import { getCurrentProfile } from "@/lib/auth/guard";
import { parseListSearchParams } from "@/lib/query/list-query";

export const metadata = { title: "Mahasiswa · SPM Nexus" };

export default async function MahasiswaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [{ data, meta }, prodiOptions, profile] = await Promise.all([
    getMahasiswaList(parseListSearchParams(sp)),
    getProdiOptions(),
    getCurrentProfile(),
  ]);

  return (
    <>
      <PageHeader
        title="Mahasiswa"
        description="Master data mahasiswa & kontribusinya."
      />
      <MahasiswaManager
        rows={data}
        meta={meta}
        isAdmin={profile?.role === "admin"}
        prodiOptions={prodiOptions}
      />
    </>
  );
}
