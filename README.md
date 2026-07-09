# SPM Nexus

> Sistem Penjaminan Mutu (SPM) — aplikasi web pengelolaan data Tridharma Perguruan Tinggi:
> penelitian, pengabdian, prestasi, dan publikasi, beserta data master dosen, mahasiswa,
> program studi, dan jabatan.
>
> Quality Assurance system for managing a university's *Tridharma* activities (research,
> community service, achievements, publications) plus master data for lecturers, students,
> study programs, and positions.

Dibangun dengan **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**,
dan **Supabase** (Auth + PostgreSQL + Row Level Security).

---

# 🇮🇩 Bahasa Indonesia

## Gambaran Umum

SPM Nexus adalah aplikasi internal untuk mengelola data Tridharma sebuah program studi/fakultas.
Aplikasi menyediakan CRUD untuk seluruh entitas, pencarian & filter tabel dengan URL state,
kontrol akses berbasis peran (admin/prodi), dan halaman detail kegiatan dengan manajemen
kontributor (dosen & mahasiswa).

## Fitur Utama

- **Autentikasi** email/password via Supabase Auth, dengan guard 2 lapis (middleware + layout).
- **Peran pengguna**: `admin` (akses penuh, termasuk hapus) dan `prodi` (baca/tambah/ubah, terbatas pada program studinya sendiri via RLS).
- **Data master**: Dosen, Mahasiswa, Program Studi, Jabatan (+ riwayat jabatan).
- **Manajemen pengguna** (admin): kelola profil, peran, dan penempatan program studi.
- **Sesi aman**: auto-redirect ke login saat sesi kadaluarsa (real-time & setelah submit).
- **Kegiatan Tridharma**: Penelitian, Pengabdian, Prestasi, Publikasi.
- **Kontributor kegiatan**: tambah/hapus dosen & mahasiswa dengan aturan **satu ketua** per
  kegiatan (dijaga di level database & aplikasi).
- **Tabel data**: pencarian (debounced), filter, sorting, dan paginasi — semua tersinkron ke
  URL (bisa di-bookmark & back/forward).
- **REST API** contoh (`GET /api/penelitian`) yang RLS-scoped.
- **Landing page** publik dengan latar animasi 3D (Three.js) yang hemat GPU.
- **Monitoring error** terpusat (opsional forward ke webhook).

## Tech Stack

| Kategori | Teknologi |
| --- | --- |
| Framework | Next.js 16 (App Router, React Server Components, React Compiler) |
| UI | React 19, Tailwind CSS v4, lucide-react (ikon), sonner (toast) |
| Form & Validasi | react-hook-form, Zod |
| Tabel | Kustom (`components/data-table`) |
| 3D/Animasi | three.js |
| Backend/DB | Supabase (Auth, PostgreSQL, RLS), @supabase/ssr |
| Testing | Vitest, @vitest/coverage-v8 |
| Tooling | ESLint, Prettier, TypeScript |

## Struktur Folder

```
src/
├── app/                      # Rute Next.js (App Router)
│   ├── (auth)/login/         # Halaman login (route group tanpa layout dashboard)
│   ├── (dashboard)/          # Area terproteksi: home + semua modul + layout & guard
│   ├── api/penelitian/       # Contoh REST API route (GET, RLS-scoped)
│   ├── error.tsx             # Error boundary per-segmen
│   ├── global-error.tsx      # Error boundary global
│   └── layout.tsx            # Root layout
│
├── components/               # Komponen UI dipakai lintas fitur
│   ├── ui/                   # Primitif: button, input, select, modal, table, card, ...
│   ├── data-table/           # Tabel generik (search/sort/filter/paginasi)
│   ├── layout/               # Sidebar, topbar, user menu, theme toggle, brand
│   └── common/               # Field, back-link, delete-button
│
├── features/                 # Modul per-domain (feature-based architecture)
│   ├── auth/                 # actions, schemas, komponen login
│   ├── dosen/ mahasiswa/ prodi/ jabatan/
│   ├── penelitian/ pengabdian/ prestasi/ publikasi/
│   ├── kegiatan/             # Logika bersama penelitian & pengabdian (data, service, form)
│   ├── dashboard/            # Data ringkasan home
│   └── landing/              # Komponen landing (hero 3D, count-up, reveal)
│       └── <domain>/         # tiap domain: actions.ts, data.ts, schemas.ts, components/
│
├── lib/                      # Kode lintas-cutting
│   ├── supabase/             # client, server, middleware, admin (service-role)
│   ├── auth/guard.ts         # requireUser / requireAdmin / getCurrentProfile
│   ├── action.ts             # withAction: pembungkus Server Action (guard+error+revalidate)
│   ├── query/list-query.ts   # normalisasi params list + build ekspresi search aman
│   ├── errors.ts             # pemetaan error ke pesan aman untuk pengguna
│   ├── monitoring/report.ts  # entry-point monitoring error
│   └── utils.ts              # util kecil (cn, dsb.)
│
├── hooks/                    # useDataTableParams, useDebouncedValue
├── config/                   # constants, navigation
├── types/                    # api.ts, database.types.ts
├── instrumentation.ts        # onRequestError (capture error sisi server)
└── proxy.ts                  # Proxy Next.js 16 (pengganti middleware) → updateSession

supabase/
├── migrations/0001_init.sql  # Skema lengkap sekali-jalan (tabel, index, view, RLS, trigger)
├── seed.sql                  # Data contoh/demo
└── README.md                 # Cara menerapkan skema
```

## Arsitektur Singkat

- **Feature-based**: tiap domain berdiri sendiri (`actions`, `data`, `schemas`, `components`),
  memudahkan navigasi & pengujian.
- **`withAction`** ([src/lib/action.ts](src/lib/action.ts)) menyatukan urusan lintas-cutting
  setiap mutasi: guard autentikasi, pembuatan Supabase client, pemetaan error, revalidasi
  cache, dan bentuk balikan `ActionResult`.
- **Keamanan berlapis**: RLS di database (kebijakan per-tabel) + guard di server
  (`requireUser`/`requireAdmin`). Hapus data = admin saja, di DB **dan** aplikasi.
- **Penelitian & Pengabdian** berbagi satu basis (`features/kegiatan`) karena strukturnya
  identik (prinsip DRY lewat `KegiatanTables`).

## Prasyarat

- Node.js 20+
- Akun & proyek **Supabase**

## Setup & Menjalankan

```bash
# 1) Install dependency
npm install

# 2) Siapkan environment
cp .env.example .env.local
# lalu isi kredensial Supabase (lihat bagian Environment)

# 3) Terapkan skema database
#    Buka Supabase → SQL Editor → jalankan isi supabase/migrations/0001_init.sql
#    (opsional) jalankan supabase/seed.sql untuk data contoh

# 4) Jalankan dev server
npm run dev
# buka http://localhost:3000
```

> **User pertama**: buat user di Supabase → Authentication. Trigger `on_auth_user_created`
> otomatis membuat row `profiles` dengan peran `prodi`. Untuk menjadikannya `admin`, ubah
> kolom `role` pada tabel `profiles`.

## Environment Variables

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL proyek Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Anon key (aman di klien) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service-role key — **server-only**, jangan bocor ke klien |
| `MONITORING_WEBHOOK_URL` | ❌ | Endpoint (Sentry/Logtail/webhook) untuk forward error |

File `.env`/`.env.local` **tidak** di-commit; hanya `.env.example` sebagai template.

## Perintah (npm scripts)

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan dev server |
| `npm run build` | Build produksi |
| `npm run start` | Menjalankan hasil build |
| `npm run lint` | ESLint |
| `npm run test` | Menjalankan test (Vitest) |
| `npm run test:watch` | Test mode watch |
| `npm run test:coverage` | Test + laporan coverage |

## Database & Keamanan

- **Skema**: satu file `supabase/migrations/0001_init.sql` (tabel, index, view pencarian
  "ketua", fungsi `auth_role()`, kebijakan RLS, trigger single-ketua, dan trigger auto-create
  profile). Lihat [supabase/README.md](supabase/README.md).
- **RLS per-prodi**: pengguna `prodi` hanya mengakses data program studinya sendiri. Kegiatan
  **terlihat** bila prodi punya kontributor (ketua *atau* anggota) di dalamnya; **mengedit**
  kegiatan tetap milik prodi *ketua*. `admin` melihat semua; hapus = admin.
- **Header keamanan** (produksi): CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy` — lihat [next.config.ts](next.config.ts).
- **Validasi input**: seluruh input di-parse dengan **Zod** di server sebelum menyentuh DB.
  Field URL dibatasi skema `http(s)` untuk mencegah XSS `javascript:`.

---

# 🇬🇧 English

## Overview

SPM Nexus is an internal app for managing a study program's *Tridharma* data. It provides CRUD
for every entity, table search/filter with URL state, role-based access control (admin/prodi),
and activity detail pages with contributor management (lecturers & students).

## Key Features

- **Authentication** via Supabase Auth (email/password) with a two-layer guard (middleware + layout).
- **User roles**: `admin` (full access, including delete) and `prodi` (read/create/update, scoped to their own study program via RLS).
- **Master data**: Lecturers (Dosen), Students (Mahasiswa), Study Programs (Prodi), Positions (Jabatan).
- **User management** (admin): manage profiles, roles, and study-program assignment.
- **Secure sessions**: auto-redirect to login when a session expires (real-time & after submit).
- **Tridharma activities**: Research, Community Service, Achievements, Publications.
- **Contributors**: add/remove lecturers & students with a **single-ketua (leader)** rule per
  activity, enforced at both database and application level.
- **Data tables**: debounced search, filter, sort, and pagination — all synced to the URL.
- **Example REST API** (`GET /api/penelitian`), RLS-scoped.
- **Public landing page** with a GPU-friendly 3D animated background (Three.js).
- **Centralized error monitoring** (optional webhook forwarding).

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, RSC, React Compiler) |
| UI | React 19, Tailwind CSS v4, lucide-react, sonner |
| Forms & Validation | react-hook-form, Zod |
| Tables | Custom (`components/data-table`) |
| 3D/Animation | three.js |
| Backend/DB | Supabase (Auth, PostgreSQL, RLS), @supabase/ssr |
| Testing | Vitest |
| Tooling | ESLint, Prettier, TypeScript |

## Folder Structure

See the annotated tree in the Indonesian section above — the same layout applies. In short:
`src/app` (routes), `src/components` (shared UI), `src/features/<domain>` (feature modules with
`actions`/`data`/`schemas`/`components`), `src/lib` (cross-cutting: Supabase clients, auth guard,
`withAction`, query helpers, error mapping, monitoring), and `supabase/` (schema + seed).

## Architecture Notes

- **Feature-based** modules keep each domain self-contained and testable.
- **`withAction`** centralizes cross-cutting concerns for every mutation: auth guard, Supabase
  client creation, error mapping, cache revalidation, and the `ActionResult` shape.
- **Defense in depth**: database RLS + server-side guards; delete is admin-only in both.
- **Research & Community Service** share one base (`features/kegiatan`) since their structure
  is identical (DRY via `KegiatanTables`).

## Prerequisites

- Node.js 20+
- A **Supabase** account & project

## Setup & Run

```bash
npm install
cp .env.example .env.local        # fill in Supabase credentials
# Apply schema: Supabase → SQL Editor → run supabase/migrations/0001_init.sql
# (optional) run supabase/seed.sql for demo data
npm run dev                       # http://localhost:3000
```

> **First user**: create one in Supabase → Authentication. The `on_auth_user_created` trigger
> auto-creates a `profiles` row with role `prodi`; set `role = 'admin'` in the `profiles` table
> to grant admin.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Anon key (safe on the client) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service-role key — **server-only**, never expose to the client |
| `MONITORING_WEBHOOK_URL` | ❌ | Endpoint to forward captured errors to |

`.env`/`.env.local` are never committed; only `.env.example` is tracked as a template.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests (Vitest) |
| `npm run test:coverage` | Tests with coverage |

## Database & Security

- **Schema**: single file `supabase/migrations/0001_init.sql`. See [supabase/README.md](supabase/README.md).
- **Per-prodi RLS**: `prodi` users only access their own study program's data. An activity is
  **visible** when the prodi has a contributor on it (ketua *or* anggota); **editing** stays with
  the *ketua*'s prodi. `admin` sees everything; delete is admin-only.
- **Security headers** (production): CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy` — see [next.config.ts](next.config.ts).
- **Input validation**: all inputs are parsed with **Zod** on the server before hitting the DB.
  URL fields are restricted to the `http(s)` scheme to block `javascript:` XSS.

---

## Lisensi / License

Proyek internal — hak cipta pemilik repositori. / Internal project — copyright the repository owner.
