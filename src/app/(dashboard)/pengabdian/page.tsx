import { PageHeader } from "@/components/layout/page-header";
import { getPengabdianList } from "@/features/pengabdian/data";
import {
  addPengabdianDosen,
  addPengabdianMahasiswa,
  createPengabdian,
  deletePengabdian,
  removePengabdianDosen,
  removePengabdianMahasiswa,
  updatePengabdian,
} from "@/features/pengabdian/actions";
import { getDosenOptions } from "@/features/dosen/data";
import { getMahasiswaOptions } from "@/features/mahasiswa/data";
import { KegiatanManager } from "@/features/kegiatan/components/kegiatan-manager";
import { getCurrentProfile } from "@/lib/auth/guard";
import { parseListSearchParams } from "@/lib/query/list-query";

export const metadata = { title: "Pengabdian · SPM Nexus" };

export default async function PengabdianPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [{ data, meta }, dosenOptions, mahasiswaOptions, profile] = await Promise.all([
    getPengabdianList(parseListSearchParams(sp)),
    getDosenOptions(),
    getMahasiswaOptions(),
    getCurrentProfile(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Tridharma"
        title="Pengabdian"
        description="Data pengabdian kepada masyarakat beserta kontributornya."
      />
      <KegiatanManager
        rows={data}
        meta={meta}
        isAdmin={profile?.role === "admin"}
        myProdiId={profile?.id_prodi ?? null}
        basePath="/pengabdian"
        dosenOptions={dosenOptions}
        mahasiswaOptions={mahasiswaOptions}
        kontribActions={{
          addDosen: addPengabdianDosen,
          addMahasiswa: addPengabdianMahasiswa,
          removeDosen: removePengabdianDosen,
          removeMahasiswa: removePengabdianMahasiswa,
        }}
        onCreate={createPengabdian}
        onUpdate={updatePengabdian}
        onDelete={deletePengabdian}
      />
    </>
  );
}
