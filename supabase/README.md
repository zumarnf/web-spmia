# Supabase — Database Schema

Database schema and seed data for **SPM Nexus**. No secrets live here; this folder
is safe to publish.

## Contents

| File | Purpose |
| --- | --- |
| `migrations/0001_init.sql` | **Full setup in one file:** enums, tables, indexes, single-ketua partial unique indexes, "ketua" search views (with `security_invoker`), the `auth_role()` helper, Row Level Security policies, and the cross-table single-ketua trigger. |
| `seed.sql` | Reference/demo data (re-runnable; truncates then inserts). |

`0001_init.sql` is meant for a **fresh/empty database** and applies everything in
a single run.

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

- **App users** are provisioned via Supabase Auth plus a matching row in
  `profiles` (there is no auto-insert trigger). A user without a `profiles` row
  cannot access the dashboard.
- `seed.sql` is **destructive** — it truncates every domain table before
  inserting. Use it only in development.
