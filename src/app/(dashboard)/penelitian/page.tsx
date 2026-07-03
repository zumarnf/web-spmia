import { PageHeader } from "@/components/layout/page-header";
import { getPenelitianList } from "@/features/penelitian/data";
import {
  addPenelitianDosen,
  addPenelitianMahasiswa,
  createPenelitian,
  deletePenelitian,
  removePenelitianDosen,
  removePenelitianMahasiswa,
  updatePenelitian,
} from "@/features/penelitian/actions";
import { getDosenOptions } from "@/features/dosen/data";
import { getMahasiswaOptions } from "@/features/mahasiswa/data";
import { KegiatanManager } from "@/features/kegiatan/components/kegiatan-manager";
import { getCurrentProfile } from "@/lib/auth/guard";
import { parseListSearchParams } from "@/lib/query/list-query";

export const metadata = { title: "Penelitian · SPM Nexus" };

export default async function PenelitianPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [{ data, meta }, dosenOptions, mahasiswaOptions, profile] = await Promise.all([
    getPenelitianList(parseListSearchParams(sp)),
    getDosenOptions(),
    getMahasiswaOptions(),
    getCurrentProfile(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Tridharma"
        title="Penelitian"
        description="Data penelitian beserta dosen dan mahasiswa yang terlibat."
      />
      <KegiatanManager
        rows={data}
        meta={meta}
        isAdmin={profile?.role === "admin"}
        basePath="/penelitian"
        dosenOptions={dosenOptions}
        mahasiswaOptions={mahasiswaOptions}
        kontribActions={{
          addDosen: addPenelitianDosen,
          addMahasiswa: addPenelitianMahasiswa,
          removeDosen: removePenelitianDosen,
          removeMahasiswa: removePenelitianMahasiswa,
        }}
        onCreate={createPenelitian}
        onUpdate={updatePenelitian}
        onDelete={deletePenelitian}
      />
    </>
  );
}
