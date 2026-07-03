import { PageHeader } from "@/components/layout/page-header";
import { getProdiList } from "@/features/prodi/data";
import { ProdiManager } from "@/features/prodi/components/prodi-manager";
import { getCurrentProfile } from "@/lib/auth/guard";
import { parseListSearchParams } from "@/lib/query/list-query";

export const metadata = { title: "Program Studi · SPM Nexus" };

export default async function ProdiPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [{ data, meta }, profile] = await Promise.all([
    getProdiList(parseListSearchParams(sp)),
    getCurrentProfile(),
  ]);

  return (
    <>
      <PageHeader title="Program Studi" description="Master data program studi." />
      <ProdiManager rows={data} meta={meta} isAdmin={profile?.role === "admin"} />
    </>
  );
}
