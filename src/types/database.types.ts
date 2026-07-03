// Hand-authored DB types mirroring supabase/migrations (docs/03-SDD §3.3).
// In a live project, regenerate with: supabase gen types typescript.

export type UserRole = "admin" | "prodi";
export type DosenStatus = "Aktif" | "Tidak aktif" | "Eksternal";
export type SumberDana = "Internal" | "Eksternal";
export type PeranKontrib = "ketua" | "anggota";

export type Profile = {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  id_prodi: number | null;
  created_at: string;
  updated_at: string;
};

export type Prodi = {
  id: number;
  name: string;
  kode_prodi: string;
  created_at: string;
  updated_at: string;
};

export type Dosen = {
  // NIP is 18 digits — stored/handled as text to avoid JS number precision loss.
  nip: string;
  nidn: string;
  name: string;
  status: DosenStatus | null;
  gelar_depan: string | null;
  gelar_belakang: string | null;
  pendidikan: string | null;
  kode_dosen: string | null;
  id_prodi: number;
  created_at: string;
  updated_at: string;
};

export type Mahasiswa = {
  nim: number;
  name: string;
  angkatan: number;
  id_prodi: number;
  created_at: string;
  updated_at: string;
};

export type Jabatan = {
  id: number;
  jabatan: string;
  sub_jabatan: string;
};

export type HistoryJabatan = {
  id: number;
  nip_dosen: number;
  id_jabatan: number;
  created_at: string;
  updated_at: string;
};

export type Penelitian = {
  id: number;
  no_sk: string | null;
  no_kontrak: string | null;
  judul: string;
  skema: string | null;
  tahun: number | null;
  bidang: string | null;
  dana: number | null;
  sumber_dana: SumberDana | null;
  laporan_akhir: string | null;
  created_at: string;
  updated_at: string;
};

export type Pengabdian = Penelitian; // identical column shape

export type Prestasi = {
  id: number;
  nama_lomba: string | null;
  juara: string | null;
  url_foto: string | null;
  url_sertifikat: string | null;
  created_at: string;
  updated_at: string;
};

export type Publikasi = {
  id: number;
  judul: string;
  tahun: number | null;
  doi: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
};

export type KontribDosen = {
  id: number;
  nip_dosen: string;
  peran: PeranKontrib;
};

export type KontribMahasiswa = {
  id: number;
  nim_mahasiswa: number;
  peran: PeranKontrib;
};
