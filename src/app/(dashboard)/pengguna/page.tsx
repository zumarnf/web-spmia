import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { getProfileList } from "@/features/profiles/data";
import { getProdiOptions } from "@/features/prodi/data";
import { ProfilesManager } from "@/features/profiles/components/profiles-manager";
import { getCurrentProfile } from "@/lib/auth/guard";
import { parseListSearchParams } from "@/lib/query/list-query";

export const metadata = { title: "Pengguna · SPM Nexus" };

export default async function PenggunaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Admin-only screen. The layout already guards for login; this guards the role.
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") redirect("/home");

  const sp = await searchParams;
  const [{ data, meta }, prodiOptions] = await Promise.all([
    getProfileList(parseListSearchParams(sp)),
    getProdiOptions(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Administrasi"
        title="Pengguna"
        description="Kelola role dan program studi setiap pengguna."
      />
      <ProfilesManager rows={data} meta={meta} prodiOptions={prodiOptions} />
    </>
  );
}
