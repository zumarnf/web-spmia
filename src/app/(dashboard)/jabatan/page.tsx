import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getHistoryList,
  getJabatanList,
  getJabatanOptions,
} from "@/features/jabatan/data";
import { getDosenOptions } from "@/features/dosen/data";
import { HistoryManager } from "@/features/jabatan/components/history-manager";
import { getCurrentProfile } from "@/lib/auth/guard";
import { parseListSearchParams } from "@/lib/query/list-query";

export const metadata = { title: "Jabatan · SPM Nexus" };

export default async function JabatanPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [jabatans, { data: history, meta }, dosenOptions, jabatanOptions, profile] =
    await Promise.all([
      getJabatanList(),
      getHistoryList(parseListSearchParams(sp)),
      getDosenOptions(),
      getJabatanOptions(),
      getCurrentProfile(),
    ]);

  return (
    <>
      <PageHeader
        title="Jabatan & Riwayat"
        description="Referensi jabatan dan riwayat jabatan dosen."
      />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jabatans.map((j) => (
          <Card key={j.id}>
            <CardHeader className="p-4">
              <CardTitle className="text-base">{j.jabatan}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Badge variant="secondary">{j.sub_jabatan}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      <h2 className="mb-3 text-lg font-semibold tracking-tight">Riwayat Jabatan</h2>
      <HistoryManager
        rows={history}
        meta={meta}
        isAdmin={profile?.role === "admin"}
        dosenOptions={dosenOptions}
        jabatanOptions={jabatanOptions}
      />
    </>
  );
}
