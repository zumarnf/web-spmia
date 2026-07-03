import { PageHeader } from "@/components/layout/page-header";
import { getPublikasiList } from "@/features/publikasi/data";
import { PublikasiManager } from "@/features/publikasi/components/publikasi-manager";
import { getCurrentProfile } from "@/lib/auth/guard";
import { parseListSearchParams } from "@/lib/query/list-query";

export const metadata = { title: "Publikasi · SPM Nexus" };

export default async function PublikasiPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [{ data, meta }, profile] = await Promise.all([
    getPublikasiList(parseListSearchParams(sp)),
    getCurrentProfile(),
  ]);

  return (
    <>
      <PageHeader title="Publikasi" description="Daftar publikasi ilmiah." />
      <PublikasiManager rows={data} meta={meta} isAdmin={profile?.role === "admin"} />
    </>
  );
}
