import { notFound } from "next/navigation";
import { getPenelitianById } from "@/features/penelitian/data";
import {
  addPenelitianDosen,
  addPenelitianMahasiswa,
  removePenelitianDosen,
  removePenelitianMahasiswa,
} from "@/features/penelitian/actions";
import { getDosenOptions } from "@/features/dosen/data";
import { getMahasiswaOptions } from "@/features/mahasiswa/data";
import { KegiatanDetailView } from "@/features/kegiatan/components/kegiatan-detail";
import { getCurrentProfile } from "@/lib/auth/guard";

export default async function PenelitianDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  const [data, dosenOptions, mahasiswaOptions, profile] = await Promise.all([
    getPenelitianById(numId),
    getDosenOptions(),
    getMahasiswaOptions(),
    getCurrentProfile(),
  ]);
  if (!data) notFound();

  return (
    <KegiatanDetailView
      title="Penelitian"
      backHref="/penelitian"
      data={data}
      isAdmin={profile?.role === "admin"}
      dosenOptions={dosenOptions}
      mahasiswaOptions={mahasiswaOptions}
      actions={{
        addDosen: addPenelitianDosen,
        addMahasiswa: addPenelitianMahasiswa,
        removeDosen: removePenelitianDosen,
        removeMahasiswa: removePenelitianMahasiswa,
      }}
    />
  );
}
