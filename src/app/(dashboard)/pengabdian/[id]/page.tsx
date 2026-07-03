import { notFound } from "next/navigation";
import { getPengabdianById } from "@/features/pengabdian/data";
import {
  addPengabdianDosen,
  addPengabdianMahasiswa,
  removePengabdianDosen,
  removePengabdianMahasiswa,
} from "@/features/pengabdian/actions";
import { getDosenOptions } from "@/features/dosen/data";
import { getMahasiswaOptions } from "@/features/mahasiswa/data";
import { KegiatanDetailView } from "@/features/kegiatan/components/kegiatan-detail";
import { getCurrentProfile } from "@/lib/auth/guard";

export default async function PengabdianDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  const [data, dosenOptions, mahasiswaOptions, profile] = await Promise.all([
    getPengabdianById(numId),
    getDosenOptions(),
    getMahasiswaOptions(),
    getCurrentProfile(),
  ]);
  if (!data) notFound();

  return (
    <KegiatanDetailView
      title="Pengabdian"
      backHref="/pengabdian"
      data={data}
      isAdmin={profile?.role === "admin"}
      dosenOptions={dosenOptions}
      mahasiswaOptions={mahasiswaOptions}
      actions={{
        addDosen: addPengabdianDosen,
        addMahasiswa: addPengabdianMahasiswa,
        removeDosen: removePengabdianDosen,
        removeMahasiswa: removePengabdianMahasiswa,
      }}
    />
  );
}
