# Supabase — Database Schema

Database schema and seed data for **SPM Nexus**. No secrets live here; this folder
is safe to publish.

## Contents

| File | Purpose |
| --- | --- |
| `migrations/0001_init.sql` | **Everything in one file, single run:** enums, tables (incl. publikasi contributors), indexes, single-ketua rules, `updated_at` auto-refresh, "ketua" search views (with `security_invoker`), helper functions (`auth_role`, `auth_prodi`, `kegiatan_owned`), **per-prodi Row Level Security**, the auto-provision `profiles` trigger (`on_auth_user_created`), and the cross-table single-ketua trigger. |
| `seed.sql` | Reference/demo data (re-runnable; truncates then inserts). |

`0001_init.sql` is meant for a **fresh/empty database** and applies everything in
a single run — paste it into the SQL Editor and Run once.

> ⚠️ **Per-prodi RLS:** `prodi`-role users are isolated to their own program
> studi; kegiatan ownership is derived from the ketua's prodi (a ketua-less
> kegiatan is visible to all until a ketua is set). This policy set is
> non-trivial — test it against a dev project before trusting it in production.

## Applying the schema

### Option A — Supabase Dashboard (no CLI)

Open **SQL Editor → New query**, paste the full contents of
`migrations/0001_init.sql`, and click **Run**. Optionally run `seed.sql`
afterwards for demo data.

### Option B — Supabase CLI

```bash
supabase link --project-ref <PROJECT_REF>
supabase db push          # applies everything under migrations/
supabase db seed          # optional: loads seed.sql
```

`<PROJECT_REF>` is the subdomain of your project URL
(`https://<PROJECT_REF>.supabase.co`).

## Notes

- **App users** are provisioned via Supabase Auth. The `on_auth_user_created`
  trigger (in `0001_init.sql`) auto-creates a matching `profiles` row for every
  new auth user with the least-privileged role (`prodi`); promote to `admin`
  manually. A user without a `profiles` row cannot access the dashboard.
  **Keep Supabase Auth sign-ups disabled** (admin-only provisioning) unless
  self-service registration is intended — otherwise anyone who signs up gets a
  `prodi` profile automatically.
- `seed.sql` is **destructive** — it truncates every domain table before
  inserting. Use it only in development.
