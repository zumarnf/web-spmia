-- SPM Nexus — full database setup (single-run).
--
-- Consolidates the original incremental migrations (schema, views, RLS,
-- view hardening, and the cross-table single-ketua trigger) into ONE file so a
-- fresh database can be provisioned in a single run.
--
-- Intended for a FRESH/empty database. The legacy one-time data fix that demoted
-- extra "ketua" rows is intentionally omitted here (nothing to fix on a new DB).
-- Run once, then optionally load seed.sql for demo data.

-- ENUMS ----------------------------------------------------------------------
create type user_role     as enum ('admin', 'prodi');
create type dosen_status  as enum ('Aktif', 'Tidak aktif', 'Eksternal');
create type sumber_dana   as enum ('Internal', 'Eksternal');
create type peran_kontrib as enum ('ketua', 'anggota');

-- MASTER: PRODI --------------------------------------------------------------
create table prodis (
  id          bigint generated always as identity primary key,
  name        text not null,
  kode_prodi  text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- PROFILES (maps auth.users -> application role; replaces legacy users.role) --
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  username    text unique not null,
  role        user_role not null default 'prodi',
  id_prodi    bigint references prodis(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- MASTER: DOSEN (natural PK: nip) --------------------------------------------
create table dosens (
  nip            text primary key,
  nidn           text unique not null,
  name           text not null,
  status         dosen_status,
  gelar_depan    text,
  gelar_belakang text,
  pendidikan     text,
  kode_dosen     text unique,
  id_prodi       bigint not null references prodis(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- MASTER: MAHASISWA (natural PK: nim) ----------------------------------------
create table mahasiswas (
  nim         bigint primary key,
  name        text not null,
  angkatan    integer not null,
  id_prodi    bigint not null references prodis(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- JABATAN & RIWAYAT ----------------------------------------------------------
create table jabatans (
  id          bigint generated always as identity primary key,
  jabatan     text not null,
  sub_jabatan text not null
);

create table history_jabatans (
  id          bigint generated always as identity primary key,
  nip_dosen   text not null references dosens(nip),
  id_jabatan  bigint  not null references jabatans(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- KEGIATAN: PENELITIAN -------------------------------------------------------
create table penelitians (
  id            bigint generated always as identity primary key,
  no_sk         text,
  no_kontrak    text,
  judul         text not null,
  skema         text,
  tahun         integer,
  bidang        text,
  dana          integer,
  sumber_dana   sumber_dana,
  laporan_akhir text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table penelitian_dosens (
  id            bigint generated always as identity primary key,
  nip_dosen     text not null references dosens(nip),
  id_penelitian bigint  not null references penelitians(id) on delete cascade,
  peran         peran_kontrib not null default 'anggota',
  unique (nip_dosen, id_penelitian)
);

create table penelitian_mahasiswas (
  id            bigint generated always as identity primary key,
  nim_mahasiswa bigint not null references mahasiswas(nim),
  id_penelitian bigint not null references penelitians(id) on delete cascade,
  peran         peran_kontrib not null default 'anggota',
  unique (nim_mahasiswa, id_penelitian)
);

-- KEGIATAN: PENGABDIAN -------------------------------------------------------
create table pengabdians (
  id            bigint generated always as identity primary key,
  no_sk         text unique,
  no_kontrak    text unique,
  judul         text not null,
  skema         text,
  tahun         integer,
  bidang        text,
  dana          integer,
  sumber_dana   sumber_dana,
  laporan_akhir text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table pengabdian_dosens (
  id            bigint generated always as identity primary key,
  nip_dosen     text not null references dosens(nip),
  id_pengabdian bigint  not null references pengabdians(id) on delete cascade,
  peran         peran_kontrib not null default 'anggota',
  unique (nip_dosen, id_pengabdian)
);

create table pengabdian_mahasiswas (
  id            bigint generated always as identity primary key,
  nim_mahasiswa bigint not null references mahasiswas(nim),
  id_pengabdian bigint not null references pengabdians(id) on delete cascade,
  peran         peran_kontrib not null default 'anggota',
  unique (nim_mahasiswa, id_pengabdian)
);

-- KEGIATAN: PRESTASI ---------------------------------------------------------
create table prestasis (
  id             bigint generated always as identity primary key,
  nama_lomba     text,
  juara          text,
  url_foto       text,
  url_sertifikat text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table prestasi_mahasiswas (
  id            bigint generated always as identity primary key,
  nim_mahasiswa bigint not null references mahasiswas(nim),
  id_prestasi   bigint not null references prestasis(id) on delete cascade,
  peran         peran_kontrib not null default 'anggota',
  unique (nim_mahasiswa, id_prestasi)
);

-- PUBLIKASI ------------------------------------------------------------------
create table publikasis (
  id          bigint generated always as identity primary key,
  judul       text not null,
  tahun       integer,
  doi         text,
  url         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- INDEXES (NFR-DB-01) --------------------------------------------------------
create index on dosens (id_prodi);
create index on mahasiswas (id_prodi);
create index on history_jabatans (nip_dosen);
create index on penelitian_dosens (id_penelitian);
create index on penelitian_dosens (nip_dosen);
create index on penelitian_mahasiswas (id_penelitian);
create index on pengabdian_dosens (id_pengabdian);
create index on pengabdian_mahasiswas (id_pengabdian);
create index on prestasi_mahasiswas (id_prestasi);
create index on penelitians (tahun);
create index on penelitians (judul);

-- SINGLE-KETUA RULE (per table): at most one 'ketua' per kegiatan.
-- Index name contains "one_ketua" so the app can surface a specific message.
create unique index penelitian_dosens_one_ketua
  on penelitian_dosens (id_penelitian) where peran = 'ketua';
create unique index penelitian_mahasiswas_one_ketua
  on penelitian_mahasiswas (id_penelitian) where peran = 'ketua';
create unique index pengabdian_dosens_one_ketua
  on pengabdian_dosens (id_pengabdian) where peran = 'ketua';
create unique index pengabdian_mahasiswas_one_ketua
  on pengabdian_mahasiswas (id_pengabdian) where peran = 'ketua';
create unique index prestasi_mahasiswas_one_ketua
  on prestasi_mahasiswas (id_prestasi) where peran = 'ketua';

-- KETUA VIEWS (for the "by ketua" search, FR-TBL-04) -------------------------
-- security_invoker = on so the views honor the querying user's RLS instead of
-- the view owner's privileges.
create view penelitian_with_ketua with (security_invoker = on) as
select p.*,
       d.nip      as ketua_nip,
       d.name     as ketua_name,
       d.id_prodi as ketua_id_prodi
from penelitians p
left join penelitian_dosens pd
       on pd.id_penelitian = p.id and pd.peran = 'ketua'
left join dosens d on d.nip = pd.nip_dosen;

create view pengabdian_with_ketua with (security_invoker = on) as
select p.*,
       d.nip      as ketua_nip,
       d.name     as ketua_name,
       d.id_prodi as ketua_id_prodi
from pengabdians p
left join pengabdian_dosens pd
       on pd.id_pengabdian = p.id and pd.peran = 'ketua'
left join dosens d on d.nip = pd.nip_dosen;

-- ROLE HELPER ----------------------------------------------------------------
create or replace function auth_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

-- RLS: read/insert/update => authenticated; delete => admin only (FR-AUTH-06/07).
do $$
declare t text;
begin
  foreach t in array array[
    'prodis','dosens','mahasiswas','jabatans','history_jabatans',
    'penelitians','penelitian_dosens','penelitian_mahasiswas',
    'pengabdians','pengabdian_dosens','pengabdian_mahasiswas',
    'prestasis','prestasi_mahasiswas','publikasis'
  ]
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('create policy %I on %I for select to authenticated using (true);', t||'_sel', t);
    execute format('create policy %I on %I for insert to authenticated with check (true);', t||'_ins', t);
    execute format('create policy %I on %I for update to authenticated using (true) with check (true);', t||'_upd', t);
    execute format('create policy %I on %I for delete to authenticated using (auth_role() = ''admin'');', t||'_del', t);
  end loop;
end $$;

-- profiles: each user reads their own profile; admins manage all.
alter table profiles enable row level security;
create policy profiles_self on profiles for select to authenticated using (id = auth.uid() or auth_role() = 'admin');
create policy profiles_admin_write on profiles for all to authenticated
  using (auth_role() = 'admin') with check (auth_role() = 'admin');

-- AUTO-PROVISION PROFILE -----------------------------------------------------
-- Guarantee every auth user has a matching profiles row, so no one can end up
-- authenticated-but-profileless. Runs as SECURITY DEFINER to bypass RLS on the
-- insert. New users get the least-privileged role ('prodi'); promote to 'admin'
-- manually. `on conflict do nothing` keeps it idempotent.
--
-- SECURITY NOTE: if public sign-ups are ENABLED in Supabase Auth, this grants a
-- prodi profile to anyone who signs up. Keep sign-ups disabled (admin-only
-- provisioning) unless self-service registration is intended.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public, auth as $$
begin
  insert into public.profiles (id, name, username, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1)),
    new.email,
    'prodi'
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- CROSS-TABLE SINGLE-KETUA RULE ----------------------------------------------
-- The per-table partial unique indexes only guard ONE pivot each. This trigger
-- also checks the SIBLING pivot for the same kegiatan before inserting/updating
-- a 'ketua' row, closing the check-then-insert race. The raised error uses
-- SQLSTATE 23505 and the token "one_ketua" so the app's kontribErrorMessage()
-- surfaces the right message. Prestasi is excluded (single pivot, already capped).
create or replace function enforce_single_ketua() returns trigger
language plpgsql as $$
declare
  kid bigint;
  cnt int;
begin
  if new.peran is distinct from 'ketua' then
    return new;
  end if;

  -- TG_ARGV[0] = fk column on THIS table (kegiatan id)
  -- TG_ARGV[1] = sibling pivot table
  -- TG_ARGV[2] = fk column on the sibling table
  execute format('select ($1).%I', tg_argv[0]) into kid using new;
  execute format(
    'select count(*) from %I where %I = $1 and peran = ''ketua''',
    tg_argv[1], tg_argv[2]
  ) into cnt using kid;

  if cnt > 0 then
    raise exception 'cross_table_one_ketua: kegiatan may have only one ketua'
      using errcode = '23505';
  end if;

  return new;
end $$;

create trigger penelitian_dosens_single_ketua
  before insert or update on penelitian_dosens
  for each row execute function enforce_single_ketua(
    'id_penelitian', 'penelitian_mahasiswas', 'id_penelitian');

create trigger penelitian_mahasiswas_single_ketua
  before insert or update on penelitian_mahasiswas
  for each row execute function enforce_single_ketua(
    'id_penelitian', 'penelitian_dosens', 'id_penelitian');

create trigger pengabdian_dosens_single_ketua
  before insert or update on pengabdian_dosens
  for each row execute function enforce_single_ketua(
    'id_pengabdian', 'pengabdian_mahasiswas', 'id_pengabdian');

create trigger pengabdian_mahasiswas_single_ketua
  before insert or update on pengabdian_mahasiswas
  for each row execute function enforce_single_ketua(
    'id_pengabdian', 'pengabdian_dosens', 'id_pengabdian');
