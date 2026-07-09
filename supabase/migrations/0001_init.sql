-- SPM Nexus — full database setup (SINGLE RUN).
--
-- Everything the app needs, in ONE file: enums, tables (incl. publikasi
-- contributors), indexes, single-ketua rules, updated_at auto-refresh, ketua
-- views, helper functions, PER-PRODI Row Level Security, the auto-provision
-- profile trigger, and the cross-table single-ketua trigger.
--
-- Intended for a FRESH/empty database. Paste into the Supabase SQL Editor and
-- Run once, then optionally load seed.sql for demo data.
--
-- ⚠️ SECURITY — PER-PRODI RLS: `prodi`-role users are isolated to their own
-- program studi (id_prodi); `admin` sees everything; delete stays admin-only.
-- Kegiatan (penelitian/pengabdian/prestasi/publikasi) ownership is derived from
-- the KETUA's prodi; a kegiatan with no ketua yet ("orphan") is visible to all
-- authenticated users so the create-then-assign flow works. This policy set is
-- non-trivial — TEST IT against a dev project before trusting it in production.

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

-- PROFILES (maps auth.users -> application role) -----------------------------
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

-- KEGIATAN: PRESTASI (mahasiswa-only contributors) ---------------------------
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

-- PUBLIKASI (+ dosen & mahasiswa contributors) -------------------------------
create table publikasis (
  id          bigint generated always as identity primary key,
  judul       text not null,
  tahun       integer,
  doi         text,
  url         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table publikasi_dosens (
  id           bigint generated always as identity primary key,
  nip_dosen    text not null references dosens(nip),
  id_publikasi bigint not null references publikasis(id) on delete cascade,
  peran        peran_kontrib not null default 'anggota',
  unique (nip_dosen, id_publikasi)
);

create table publikasi_mahasiswas (
  id            bigint generated always as identity primary key,
  nim_mahasiswa bigint not null references mahasiswas(nim),
  id_publikasi  bigint not null references publikasis(id) on delete cascade,
  peran         peran_kontrib not null default 'anggota',
  unique (nim_mahasiswa, id_publikasi)
);

-- INDEXES (both directions on every pivot) -----------------------------------
create index on dosens (id_prodi);
create index on mahasiswas (id_prodi);
create index on history_jabatans (nip_dosen);
create index on penelitian_dosens (id_penelitian);
create index on penelitian_dosens (nip_dosen);
create index on penelitian_mahasiswas (id_penelitian);
create index on penelitian_mahasiswas (nim_mahasiswa);
create index on pengabdian_dosens (id_pengabdian);
create index on pengabdian_dosens (nip_dosen);
create index on pengabdian_mahasiswas (id_pengabdian);
create index on pengabdian_mahasiswas (nim_mahasiswa);
create index on prestasi_mahasiswas (id_prestasi);
create index on prestasi_mahasiswas (nim_mahasiswa);
create index on publikasi_dosens (id_publikasi);
create index on publikasi_dosens (nip_dosen);
create index on publikasi_mahasiswas (id_publikasi);
create index on publikasi_mahasiswas (nim_mahasiswa);
create index on penelitians (tahun);
create index on penelitians (judul);

-- SINGLE-KETUA (per table): at most one 'ketua' per kegiatan. Name contains
-- "one_ketua" so the app can surface a specific message.
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
create unique index publikasi_dosens_one_ketua
  on publikasi_dosens (id_publikasi) where peran = 'ketua';
create unique index publikasi_mahasiswas_one_ketua
  on publikasi_mahasiswas (id_publikasi) where peran = 'ketua';

-- UPDATED_AT AUTO-REFRESH ----------------------------------------------------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'prodis','profiles','dosens','mahasiswas','history_jabatans',
    'penelitians','pengabdians','prestasis','publikasis'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on %I;', t);
    execute format(
      'create trigger set_updated_at before update on %I
         for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- KETUA VIEWS (dosen ketua) for the "by ketua" search. security_invoker keeps
-- the querying user's RLS in force instead of the view owner's.
create view penelitian_with_ketua with (security_invoker = on) as
select p.*, d.nip as ketua_nip, d.name as ketua_name, d.id_prodi as ketua_id_prodi
from penelitians p
left join penelitian_dosens pd on pd.id_penelitian = p.id and pd.peran = 'ketua'
left join dosens d on d.nip = pd.nip_dosen;

create view pengabdian_with_ketua with (security_invoker = on) as
select p.*, d.nip as ketua_nip, d.name as ketua_name, d.id_prodi as ketua_id_prodi
from pengabdians p
left join pengabdian_dosens pd on pd.id_pengabdian = p.id and pd.peran = 'ketua'
left join dosens d on d.nip = pd.nip_dosen;

create view publikasi_with_ketua with (security_invoker = on) as
select p.*, d.nip as ketua_nip, d.name as ketua_name, d.id_prodi as ketua_id_prodi
from publikasis p
left join publikasi_dosens pd on pd.id_publikasi = p.id and pd.peran = 'ketua'
left join dosens d on d.nip = pd.nip_dosen;

-- HELPERS --------------------------------------------------------------------
-- Current user's role. SECURITY DEFINER so it can read profiles under RLS.
create or replace function auth_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

-- Current user's program studi.
create or replace function auth_prodi() returns bigint
language sql stable security definer set search_path = public as $$
  select id_prodi from profiles where id = auth.uid();
$$;

-- Does the current user "own" a kegiatan? Ownership = the KETUA's prodi matches
-- the caller's prodi. A ketua-less kegiatan (orphan) is owned by everyone so the
-- create-then-assign flow works. Admins always own. p_dosen_pivot may be NULL
-- (prestasi has no dosen pivot). SECURITY DEFINER so it can read the pivots and
-- master tables regardless of the caller's own RLS.
create or replace function kegiatan_owned(
  p_dosen_pivot text, p_mhs_pivot text, p_fk text, p_kid bigint
) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare owned boolean; has_ketua boolean;
begin
  if auth_role() = 'admin' then return true; end if;
  if p_kid is null then return true; end if;

  owned := false;
  if p_dosen_pivot is not null then
    execute format(
      'select exists(select 1 from %I p join dosens d on d.nip = p.nip_dosen
         where p.%I = $1 and p.peran = ''ketua'' and d.id_prodi = $2)',
      p_dosen_pivot, p_fk) into owned using p_kid, auth_prodi();
  end if;
  if not owned then
    execute format(
      'select exists(select 1 from %I p join mahasiswas m on m.nim = p.nim_mahasiswa
         where p.%I = $1 and p.peran = ''ketua'' and m.id_prodi = $2)',
      p_mhs_pivot, p_fk) into owned using p_kid, auth_prodi();
  end if;
  if owned then return true; end if;

  -- orphan check: no ketua in either pivot
  has_ketua := false;
  if p_dosen_pivot is not null then
    execute format('select exists(select 1 from %I where %I = $1 and peran = ''ketua'')',
      p_dosen_pivot, p_fk) into has_ketua using p_kid;
  end if;
  if not has_ketua then
    execute format('select exists(select 1 from %I where %I = $1 and peran = ''ketua'')',
      p_mhs_pivot, p_fk) into has_ketua using p_kid;
  end if;
  return not has_ketua;
end $$;

-- Does the current user own the dosen behind a history_jabatans row?
create or replace function dosen_in_prodi(p_nip text) returns boolean
language sql stable security definer set search_path = public as $$
  select auth_role() = 'admin'
      or exists(select 1 from dosens d where d.nip = p_nip and d.id_prodi = auth_prodi());
$$;

-- CROSS-TABLE SINGLE-KETUA TRIGGER -------------------------------------------
-- Guards the check-then-insert race the per-table partial indexes can't see
-- across. Raises 23505 with token "one_ketua" so kontribErrorMessage() matches.
create or replace function enforce_single_ketua() returns trigger
language plpgsql as $$
declare kid bigint; cnt int;
begin
  if new.peran is distinct from 'ketua' then return new; end if;
  execute format('select ($1).%I', tg_argv[0]) into kid using new;
  execute format('select count(*) from %I where %I = $1 and peran = ''ketua''',
    tg_argv[1], tg_argv[2]) into cnt using kid;
  if cnt > 0 then
    raise exception 'cross_table_one_ketua: kegiatan may have only one ketua'
      using errcode = '23505';
  end if;
  return new;
end $$;

create trigger penelitian_dosens_single_ketua
  before insert or update on penelitian_dosens for each row
  execute function enforce_single_ketua('id_penelitian', 'penelitian_mahasiswas', 'id_penelitian');
create trigger penelitian_mahasiswas_single_ketua
  before insert or update on penelitian_mahasiswas for each row
  execute function enforce_single_ketua('id_penelitian', 'penelitian_dosens', 'id_penelitian');
create trigger pengabdian_dosens_single_ketua
  before insert or update on pengabdian_dosens for each row
  execute function enforce_single_ketua('id_pengabdian', 'pengabdian_mahasiswas', 'id_pengabdian');
create trigger pengabdian_mahasiswas_single_ketua
  before insert or update on pengabdian_mahasiswas for each row
  execute function enforce_single_ketua('id_pengabdian', 'pengabdian_dosens', 'id_pengabdian');
create trigger publikasi_dosens_single_ketua
  before insert or update on publikasi_dosens for each row
  execute function enforce_single_ketua('id_publikasi', 'publikasi_mahasiswas', 'id_publikasi');
create trigger publikasi_mahasiswas_single_ketua
  before insert or update on publikasi_mahasiswas for each row
  execute function enforce_single_ketua('id_publikasi', 'publikasi_dosens', 'id_publikasi');

-- AUTO-PROVISION PROFILE -----------------------------------------------------
-- Every new auth user gets a matching profiles row (least-privileged 'prodi';
-- promote to 'admin' manually). Idempotent. SECURITY DEFINER to bypass RLS.
-- NOTE: with public sign-ups ENABLED this grants a prodi profile to anyone —
-- keep sign-ups disabled (admin-only provisioning) unless self-service is wanted.
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
  after insert on auth.users for each row execute function handle_new_user();

-- ROW LEVEL SECURITY (per-prodi) ---------------------------------------------
-- Rule of thumb: prodi users are scoped to their own id_prodi; admins see all;
-- DELETE is admin-only everywhere.

alter table prodis                enable row level security;
alter table dosens                enable row level security;
alter table mahasiswas            enable row level security;
alter table jabatans              enable row level security;
alter table history_jabatans      enable row level security;
alter table penelitians           enable row level security;
alter table penelitian_dosens     enable row level security;
alter table penelitian_mahasiswas enable row level security;
alter table pengabdians           enable row level security;
alter table pengabdian_dosens     enable row level security;
alter table pengabdian_mahasiswas enable row level security;
alter table prestasis             enable row level security;
alter table prestasi_mahasiswas   enable row level security;
alter table publikasis            enable row level security;
alter table publikasi_dosens      enable row level security;
alter table publikasi_mahasiswas  enable row level security;
alter table profiles              enable row level security;

-- REFERENCE (prodis, jabatans): read = all authenticated; write = admin only.
do $$
declare t text;
begin
  foreach t in array array['prodis','jabatans'] loop
    execute format('create policy %I on %I for select to authenticated using (true);', t||'_sel', t);
    execute format('create policy %I on %I for insert to authenticated with check (auth_role() = ''admin'');', t||'_ins', t);
    execute format('create policy %I on %I for update to authenticated using (auth_role() = ''admin'') with check (auth_role() = ''admin'');', t||'_upd', t);
    execute format('create policy %I on %I for delete to authenticated using (auth_role() = ''admin'');', t||'_del', t);
  end loop;
end $$;

-- OWN-PRODI MASTER (dosens, mahasiswas): scoped by id_prodi; delete admin-only.
do $$
declare t text;
begin
  foreach t in array array['dosens','mahasiswas'] loop
    execute format('create policy %I on %I for select to authenticated using (auth_role() = ''admin'' or id_prodi = auth_prodi());', t||'_sel', t);
    execute format('create policy %I on %I for insert to authenticated with check (auth_role() = ''admin'' or id_prodi = auth_prodi());', t||'_ins', t);
    execute format('create policy %I on %I for update to authenticated using (auth_role() = ''admin'' or id_prodi = auth_prodi()) with check (auth_role() = ''admin'' or id_prodi = auth_prodi());', t||'_upd', t);
    execute format('create policy %I on %I for delete to authenticated using (auth_role() = ''admin'');', t||'_del', t);
  end loop;
end $$;

-- HISTORY JABATAN: scoped via the dosen's prodi; delete admin-only.
create policy history_jabatans_sel on history_jabatans for select to authenticated
  using (dosen_in_prodi(nip_dosen));
create policy history_jabatans_ins on history_jabatans for insert to authenticated
  with check (dosen_in_prodi(nip_dosen));
create policy history_jabatans_upd on history_jabatans for update to authenticated
  using (dosen_in_prodi(nip_dosen)) with check (dosen_in_prodi(nip_dosen));
create policy history_jabatans_del on history_jabatans for delete to authenticated
  using (auth_role() = 'admin');

-- KEGIATAN parent tables: ownership via ketua (kegiatan_owned); delete admin.
create policy penelitians_sel on penelitians for select to authenticated
  using (kegiatan_owned('penelitian_dosens','penelitian_mahasiswas','id_penelitian', id));
create policy penelitians_ins on penelitians for insert to authenticated with check (true);
create policy penelitians_upd on penelitians for update to authenticated
  using (kegiatan_owned('penelitian_dosens','penelitian_mahasiswas','id_penelitian', id))
  with check (kegiatan_owned('penelitian_dosens','penelitian_mahasiswas','id_penelitian', id));
create policy penelitians_del on penelitians for delete to authenticated using (auth_role() = 'admin');

create policy pengabdians_sel on pengabdians for select to authenticated
  using (kegiatan_owned('pengabdian_dosens','pengabdian_mahasiswas','id_pengabdian', id));
create policy pengabdians_ins on pengabdians for insert to authenticated with check (true);
create policy pengabdians_upd on pengabdians for update to authenticated
  using (kegiatan_owned('pengabdian_dosens','pengabdian_mahasiswas','id_pengabdian', id))
  with check (kegiatan_owned('pengabdian_dosens','pengabdian_mahasiswas','id_pengabdian', id));
create policy pengabdians_del on pengabdians for delete to authenticated using (auth_role() = 'admin');

create policy prestasis_sel on prestasis for select to authenticated
  using (kegiatan_owned(null,'prestasi_mahasiswas','id_prestasi', id));
create policy prestasis_ins on prestasis for insert to authenticated with check (true);
create policy prestasis_upd on prestasis for update to authenticated
  using (kegiatan_owned(null,'prestasi_mahasiswas','id_prestasi', id))
  with check (kegiatan_owned(null,'prestasi_mahasiswas','id_prestasi', id));
create policy prestasis_del on prestasis for delete to authenticated using (auth_role() = 'admin');

create policy publikasis_sel on publikasis for select to authenticated
  using (kegiatan_owned('publikasi_dosens','publikasi_mahasiswas','id_publikasi', id));
create policy publikasis_ins on publikasis for insert to authenticated with check (true);
create policy publikasis_upd on publikasis for update to authenticated
  using (kegiatan_owned('publikasi_dosens','publikasi_mahasiswas','id_publikasi', id))
  with check (kegiatan_owned('publikasi_dosens','publikasi_mahasiswas','id_publikasi', id));
create policy publikasis_del on publikasis for delete to authenticated using (auth_role() = 'admin');

-- KEGIATAN pivot tables: visible/writable when the parent kegiatan is owned
-- (or still orphan). INSERT check runs kegiatan_owned on the NEW row's fk, so
-- the FIRST ketua can be added to an orphan kegiatan. Delete admin-only.
create policy penelitian_dosens_sel on penelitian_dosens for select to authenticated
  using (kegiatan_owned('penelitian_dosens','penelitian_mahasiswas','id_penelitian', id_penelitian));
create policy penelitian_dosens_ins on penelitian_dosens for insert to authenticated
  with check (kegiatan_owned('penelitian_dosens','penelitian_mahasiswas','id_penelitian', id_penelitian));
create policy penelitian_dosens_upd on penelitian_dosens for update to authenticated
  using (kegiatan_owned('penelitian_dosens','penelitian_mahasiswas','id_penelitian', id_penelitian))
  with check (kegiatan_owned('penelitian_dosens','penelitian_mahasiswas','id_penelitian', id_penelitian));
create policy penelitian_dosens_del on penelitian_dosens for delete to authenticated using (auth_role() = 'admin');

create policy penelitian_mahasiswas_sel on penelitian_mahasiswas for select to authenticated
  using (kegiatan_owned('penelitian_dosens','penelitian_mahasiswas','id_penelitian', id_penelitian));
create policy penelitian_mahasiswas_ins on penelitian_mahasiswas for insert to authenticated
  with check (kegiatan_owned('penelitian_dosens','penelitian_mahasiswas','id_penelitian', id_penelitian));
create policy penelitian_mahasiswas_upd on penelitian_mahasiswas for update to authenticated
  using (kegiatan_owned('penelitian_dosens','penelitian_mahasiswas','id_penelitian', id_penelitian))
  with check (kegiatan_owned('penelitian_dosens','penelitian_mahasiswas','id_penelitian', id_penelitian));
create policy penelitian_mahasiswas_del on penelitian_mahasiswas for delete to authenticated using (auth_role() = 'admin');

create policy pengabdian_dosens_sel on pengabdian_dosens for select to authenticated
  using (kegiatan_owned('pengabdian_dosens','pengabdian_mahasiswas','id_pengabdian', id_pengabdian));
create policy pengabdian_dosens_ins on pengabdian_dosens for insert to authenticated
  with check (kegiatan_owned('pengabdian_dosens','pengabdian_mahasiswas','id_pengabdian', id_pengabdian));
create policy pengabdian_dosens_upd on pengabdian_dosens for update to authenticated
  using (kegiatan_owned('pengabdian_dosens','pengabdian_mahasiswas','id_pengabdian', id_pengabdian))
  with check (kegiatan_owned('pengabdian_dosens','pengabdian_mahasiswas','id_pengabdian', id_pengabdian));
create policy pengabdian_dosens_del on pengabdian_dosens for delete to authenticated using (auth_role() = 'admin');

create policy pengabdian_mahasiswas_sel on pengabdian_mahasiswas for select to authenticated
  using (kegiatan_owned('pengabdian_dosens','pengabdian_mahasiswas','id_pengabdian', id_pengabdian));
create policy pengabdian_mahasiswas_ins on pengabdian_mahasiswas for insert to authenticated
  with check (kegiatan_owned('pengabdian_dosens','pengabdian_mahasiswas','id_pengabdian', id_pengabdian));
create policy pengabdian_mahasiswas_upd on pengabdian_mahasiswas for update to authenticated
  using (kegiatan_owned('pengabdian_dosens','pengabdian_mahasiswas','id_pengabdian', id_pengabdian))
  with check (kegiatan_owned('pengabdian_dosens','pengabdian_mahasiswas','id_pengabdian', id_pengabdian));
create policy pengabdian_mahasiswas_del on pengabdian_mahasiswas for delete to authenticated using (auth_role() = 'admin');

create policy prestasi_mahasiswas_sel on prestasi_mahasiswas for select to authenticated
  using (kegiatan_owned(null,'prestasi_mahasiswas','id_prestasi', id_prestasi));
create policy prestasi_mahasiswas_ins on prestasi_mahasiswas for insert to authenticated
  with check (kegiatan_owned(null,'prestasi_mahasiswas','id_prestasi', id_prestasi));
create policy prestasi_mahasiswas_upd on prestasi_mahasiswas for update to authenticated
  using (kegiatan_owned(null,'prestasi_mahasiswas','id_prestasi', id_prestasi))
  with check (kegiatan_owned(null,'prestasi_mahasiswas','id_prestasi', id_prestasi));
create policy prestasi_mahasiswas_del on prestasi_mahasiswas for delete to authenticated using (auth_role() = 'admin');

create policy publikasi_dosens_sel on publikasi_dosens for select to authenticated
  using (kegiatan_owned('publikasi_dosens','publikasi_mahasiswas','id_publikasi', id_publikasi));
create policy publikasi_dosens_ins on publikasi_dosens for insert to authenticated
  with check (kegiatan_owned('publikasi_dosens','publikasi_mahasiswas','id_publikasi', id_publikasi));
create policy publikasi_dosens_upd on publikasi_dosens for update to authenticated
  using (kegiatan_owned('publikasi_dosens','publikasi_mahasiswas','id_publikasi', id_publikasi))
  with check (kegiatan_owned('publikasi_dosens','publikasi_mahasiswas','id_publikasi', id_publikasi));
create policy publikasi_dosens_del on publikasi_dosens for delete to authenticated using (auth_role() = 'admin');

create policy publikasi_mahasiswas_sel on publikasi_mahasiswas for select to authenticated
  using (kegiatan_owned('publikasi_dosens','publikasi_mahasiswas','id_publikasi', id_publikasi));
create policy publikasi_mahasiswas_ins on publikasi_mahasiswas for insert to authenticated
  with check (kegiatan_owned('publikasi_dosens','publikasi_mahasiswas','id_publikasi', id_publikasi));
create policy publikasi_mahasiswas_upd on publikasi_mahasiswas for update to authenticated
  using (kegiatan_owned('publikasi_dosens','publikasi_mahasiswas','id_publikasi', id_publikasi))
  with check (kegiatan_owned('publikasi_dosens','publikasi_mahasiswas','id_publikasi', id_publikasi));
create policy publikasi_mahasiswas_del on publikasi_mahasiswas for delete to authenticated using (auth_role() = 'admin');

-- PROFILES: users read their own; admins manage all.
create policy profiles_self on profiles for select to authenticated
  using (id = auth.uid() or auth_role() = 'admin');
create policy profiles_admin_write on profiles for all to authenticated
  using (auth_role() = 'admin') with check (auth_role() = 'admin');
