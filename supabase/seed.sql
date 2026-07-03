-- Reference seed data (parity with legacy Laravel seeders).
-- Re-runnable: resets data + identity sequences, then inserts.
-- FKs are resolved via subselects so it never depends on hardcoded ids.
-- Note: app users are provisioned via Supabase Auth + a matching profiles row.

truncate
  prodis, dosens, mahasiswas, jabatans, history_jabatans,
  penelitians, penelitian_dosens, penelitian_mahasiswas,
  pengabdians, pengabdian_dosens, pengabdian_mahasiswas,
  prestasis, prestasi_mahasiswas, publikasis
  restart identity cascade;

insert into prodis (name, kode_prodi) values
  ('Teknik Informatika', 'TIF'),
  ('Sistem Informasi', 'SIF'),
  ('Bisnis Digital', 'BDG');

insert into jabatans (jabatan, sub_jabatan) values
  ('Ketua Program Studi', 'Kaprodi'),
  ('Sekretaris Program Studi', 'Sekprodi'),
  ('Dosen', 'Pengajar');

insert into dosens (nip, nidn, name, status, id_prodi, pendidikan) values
  ('198001012005011001', '0401018001', 'Andi Wijaya', 'Aktif',
   (select id from prodis where kode_prodi = 'TIF'), 'S3'),
  ('198203152008012002', '0415038202', 'Siti Rahma', 'Aktif',
   (select id from prodis where kode_prodi = 'SIF'), 'S2');

insert into mahasiswas (nim, name, angkatan, id_prodi) values
  (102012300001, 'Budi Santoso', 2023,
   (select id from prodis where kode_prodi = 'TIF')),
  (102012300002, 'Citra Lestari', 2023,
   (select id from prodis where kode_prodi = 'SIF'));

insert into penelitians (judul, tahun, bidang, dana, sumber_dana) values
  ('Optimasi Model NLP Bahasa Indonesia', 2024, 'AI', 50000000, 'Internal');

insert into penelitian_dosens (nip_dosen, id_penelitian, peran) values
  ('198001012005011001',
   (select id from penelitians where judul = 'Optimasi Model NLP Bahasa Indonesia'),
   'ketua');

insert into pengabdians (no_sk, no_kontrak, judul, tahun, sumber_dana) values
  ('SK/001/2024', 'KONTRAK/001/2024', 'Pelatihan Literasi Digital UMKM', 2024, 'Eksternal');

insert into pengabdian_dosens (nip_dosen, id_pengabdian, peran) values
  ('198203152008012002',
   (select id from pengabdians where no_sk = 'SK/001/2024'),
   'ketua');

insert into prestasis (nama_lomba, juara) values
  ('Hackathon Nasional 2024', 'Juara 1');

insert into prestasi_mahasiswas (nim_mahasiswa, id_prestasi, peran) values
  (102012300001,
   (select id from prestasis where nama_lomba = 'Hackathon Nasional 2024'),
   'ketua');

insert into publikasis (judul, tahun, doi) values
  ('Deep Learning untuk Deteksi Anomali', 2024, '10.1234/dl.2024.001');
