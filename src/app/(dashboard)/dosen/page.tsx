import { PageHeader } from "@/components/layout/page-header";
import { getDosenList } from "@/features/dosen/data";
import { getProdiOptions } from "@/features/prodi/data";
import { DosenManager } from "@/features/dosen/components/dosen-manager";
import { getCurrentProfile } from "@/lib/auth/guard";
import { parseListSearchParams } from "@/lib/query/list-query";

export const metadata = { title: "Dosen · SPM Nexus" };

export default async function DosenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [{ data, meta }, prodiOptions, profile] = await Promise.all([
    getDosenList(parseListSearchParams(sp)),
    getProdiOptions(),
    getCurrentProfile(),
  ]);

  return (
    <>
      <PageHeader title="Dosen" description="Master data dosen & kontribusi Tridharma." />
      <DosenManager
        rows={data}
        meta={meta}
        isAdmin={profile?.role === "admin"}
        prodiOptions={prodiOptions}
        lockedProdiId={profile?.role === "admin" ? null : (profile?.id_prodi ?? null)}
      />
    </>
  );
}
