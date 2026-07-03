import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/login-form";
import { LoginScene } from "@/features/auth/components/login-scene";
import { BrandMark, BrandGlyph } from "@/components/layout/brand-mark";
import { getCurrentProfile } from "@/lib/auth/guard";

export const metadata = { title: "Masuk · SPM Nexus" };

export default async function LoginPage() {
  // Send already-signed-in users to the dashboard. Checking the PROFILE (not just
  // the auth session) here — instead of in middleware — avoids a /login ⇄ /home
  // redirect loop for an authenticated user that has no profiles row.
  if (await getCurrentProfile()) redirect("/home");

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel with the animated node network. */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[#0b0a0e] p-10 text-white lg:flex xl:p-14">
        <LoginScene />
        {/* Depth + legibility overlays. */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_70%_20%,rgba(225,29,51,0.18),transparent_60%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0a0e] via-transparent to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 flex items-center gap-3">
          <BrandMark className="size-11" />
          <div className="leading-none">
            <p className="font-semibold tracking-tight">SPM Nexus</p>
            <p className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-white/45">
              Sistem Penjaminan Mutu
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
            Terhubung. Terukur. Terpercaya.
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/55">
            Satu pusat data Tridharma — penelitian, pengabdian, prestasi, dan publikasi
            dalam jaringan yang saling terkait.
          </p>
          <p className="mt-10 text-[0.65rem] uppercase tracking-[0.22em] text-white/30">
            Pengelolaan Tridharma Perguruan Tinggi
          </p>
        </div>
      </section>

      {/* Form panel. */}
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm [animation:var(--animate-fade-in)]">
          {/* Brand header — visible only when the brand panel is hidden. */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandMark className="size-11" />
            <div className="leading-none">
              <p className="font-semibold tracking-tight">SPM Nexus</p>
              <p className="mt-1 text-xs text-muted">Pengelolaan Tridharma</p>
            </div>
          </div>

          <div className="mb-7">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <BrandGlyph className="size-3.5" /> Masuk
            </span>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Selamat datang kembali
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              Masuk untuk mengelola data penelitian, pengabdian, dan prestasi.
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-xs text-muted-2">
            Akses terbatas untuk pengelola data institusi.
          </p>
        </div>
      </section>
    </main>
  );
}
