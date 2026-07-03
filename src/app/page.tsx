import type { Metadata } from "next";
import Link from "next/link";
import {
  FlaskConical,
  HeartHandshake,
  Trophy,
  BookOpenText,
  Building2,
  GraduationCap,
  Users,
  BriefcaseBusiness,
  Network,
  Layers,
  ShieldCheck,
  Database,
  LineChart,
  Gauge,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { BrandMark, BrandGlyph } from "@/components/layout/brand-mark";
import { HeroScene } from "@/features/landing/components/hero-scene";
import { Reveal } from "@/features/landing/components/reveal";
import { CountUp } from "@/features/landing/components/count-up";

// Public landing page — no auth required (see PUBLIC handling in supabase middleware).
export const metadata: Metadata = {
  title: "SPM Nexus — Pusat Data Tridharma Perguruan Tinggi",
  description:
    "Satu platform terhubung untuk mengelola penelitian, pengabdian, prestasi, dan publikasi beserta data dosen, mahasiswa, dan program studi.",
};

type Item = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

const TRIDHARMA: Item[] = [
  {
    icon: FlaskConical,
    title: "Penelitian",
    desc: "Kelola kegiatan penelitian, sumber dana, dan kontribusi peneliti dalam satu catatan yang terhubung.",
  },
  {
    icon: HeartHandshake,
    title: "Pengabdian",
    desc: "Rekam program pengabdian kepada masyarakat lengkap dengan peran ketua dan anggota.",
  },
  {
    icon: Trophy,
    title: "Prestasi",
    desc: "Dokumentasikan capaian dan prestasi mahasiswa secara terstruktur dan mudah ditelusuri.",
  },
  {
    icon: BookOpenText,
    title: "Publikasi",
    desc: "Himpun karya ilmiah terpublikasi sebagai bukti mutu akademik institusi.",
  },
];

const MASTER: Item[] = [
  {
    icon: Building2,
    title: "Program Studi",
    desc: "Struktur prodi sebagai fondasi seluruh data.",
  },
  {
    icon: GraduationCap,
    title: "Dosen",
    desc: "Profil tenaga pendidik & status keaktifan.",
  },
  {
    icon: Users,
    title: "Mahasiswa",
    desc: "Data mahasiswa aktif hingga alumni.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Jabatan",
    desc: "Riwayat jabatan fungsional & struktural.",
  },
];

const KEUNGGULAN: Item[] = [
  {
    icon: Database,
    title: "Terpusat",
    desc: "Semua entitas Tridharma dalam satu sumber kebenaran, saling terkait tanpa data ganda.",
  },
  {
    icon: LineChart,
    title: "Terukur",
    desc: "Ringkasan dan capaian tersaji ringkas untuk mendukung penjaminan mutu.",
  },
  {
    icon: ShieldCheck,
    title: "Aman",
    desc: "Akses terbatas untuk pengelola institusi dengan penjagaan otentikasi di setiap rute.",
  },
  {
    icon: Gauge,
    title: "Ringkas",
    desc: "Antarmuka bersih dan cepat, dirancang untuk kerja data harian tanpa hambatan.",
  },
];

const ALUR = [
  {
    n: "01",
    title: "Siapkan Master Data",
    desc: "Mulai dari program studi, dosen, dan mahasiswa sebagai fondasi.",
  },
  {
    n: "02",
    title: "Catat Kegiatan Tridharma",
    desc: "Masukkan penelitian, pengabdian, prestasi, dan publikasi beserta kontributornya.",
  },
  {
    n: "03",
    title: "Pantau & Telusuri",
    desc: "Lihat ringkasan menyeluruh dan telusuri detail kapan pun dibutuhkan.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      {/* ---- Navbar --------------------------------------------------------- */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            <BrandMark className="size-9" />
            <span className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-tight">SPM Nexus</span>
              <span className="mt-0.5 text-[0.6rem] uppercase tracking-[0.18em] text-muted-2">
                Sistem Penjaminan Mutu
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-muted md:flex">
            <a href="#tridharma" className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background">
              Tridharma
            </a>
            <a href="#modul" className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background">
              Modul
            </a>
            <a href="#keunggulan" className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background">
              Keunggulan
            </a>
          </div>

          <Link
            href="/login"
            className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-sm)] bg-primary px-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-primary)] transition duration-200 hover:-translate-y-px hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Masuk
            <ArrowRight className="size-4" />
          </Link>
        </nav>
      </header>

      {/* ---- Hero (dark, 3D node network) ---------------------------------- */}
      <section className="relative isolate overflow-hidden bg-[#0b0a0e] text-white">
        <HeroScene />
        {/* Legibility & depth overlays over the 3D canvas. */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_55%_at_75%_15%,rgba(225,29,51,0.20),transparent_60%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#0b0a0e]"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-5 py-24 sm:px-8">
          <div className="max-w-3xl [animation:var(--animate-fade-in)]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white/75 backdrop-blur-sm">
              <BrandGlyph className="size-3.5" />
              Pengelolaan Tridharma Perguruan Tinggi
            </span>

            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Data Tridharma Anda,
              <br />
              <span className="bg-gradient-to-r from-white via-white to-[#f7b0bb] bg-clip-text text-transparent">
                dalam satu jaringan yang terhubung.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/60 sm:text-lg">
              SPM Nexus menyatukan penelitian, pengabdian, prestasi, dan publikasi
              beserta data dosen dan mahasiswa — terhubung, terukur, terpercaya.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-sm)] bg-primary px-6 text-sm font-medium text-primary-foreground shadow-[var(--shadow-primary)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0a0e]"
              >
                Masuk ke Dashboard
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#tridharma"
                className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-sm)] border border-white/20 bg-white/5 px-6 text-sm font-medium text-white/90 backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0a0e]"
              >
                Jelajahi Fitur
              </a>
            </div>
          </div>

          {/* Structural facts (not fabricated data). */}
          <dl className="mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {[
              { icon: Layers, to: 4, suffix: "", label: "Pilar Tridharma" },
              { icon: Network, to: 8, suffix: "", label: "Modul terhubung" },
              { icon: ShieldCheck, to: 100, suffix: "%", label: "Akses terjaga" },
            ].map((s) => (
              <div key={s.label}>
                <s.icon className="size-5 text-[#f7b0bb]" />
                <dd className="mt-3 text-3xl font-semibold tabular tracking-tight sm:text-4xl">
                  <CountUp to={s.to} suffix={s.suffix} />
                </dd>
                <dt className="mt-1 text-xs text-white/50 sm:text-sm">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---- Pilar Tridharma ----------------------------------------------- */}
      <section id="tridharma" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Pilar Tridharma
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Empat pilar, satu catatan yang saling terhubung.
            </h2>
            <p className="mt-4 max-w-md text-muted">
              Setiap kegiatan tercatat lengkap dengan kontributornya, sehingga jejak
              mutu akademik selalu utuh dan mudah ditelusuri.
            </p>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {TRIDHARMA.map((item, i) => (
              <Reveal key={item.title} delay={i * 90}>
                <article className="group relative h-full overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-floating">
                  <div
                    className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/[0.07] blur-2xl transition-opacity duration-300 group-hover:opacity-100 sm:opacity-0"
                    aria-hidden="true"
                  />
                  <span className="grid size-12 place-items-center rounded-[var(--radius-sm)] bg-primary/10 text-primary ring-1 ring-inset ring-primary/15 transition-transform duration-300 group-hover:scale-105">
                    <item.icon className="size-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {item.desc}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Modul / Master Data ------------------------------------------- */}
      <section id="modul" className="scroll-mt-20 border-y border-border bg-surface-2">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <Reveal className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              Master Data
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Fondasi data yang rapi sejak awal.
            </h2>
            <p className="mt-4 text-muted">
              Empat modul inti menjadi dasar setiap kegiatan Tridharma — bersih,
              konsisten, dan siap dihubungkan.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {MASTER.map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div className="group h-full bg-surface p-6 transition-colors duration-300 hover:bg-surface-2">
                  <span className="grid size-11 place-items-center rounded-[var(--radius-sm)] bg-secondary/10 text-secondary ring-1 ring-inset ring-secondary/15">
                    <item.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Keunggulan ---------------------------------------------------- */}
      <section id="keunggulan" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8">
        <Reveal className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Mengapa SPM Nexus
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Dirancang untuk mutu, bukan sekadar arsip.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {KEUNGGULAN.map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <div className="flex h-full gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-card">
                <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
                  <item.icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{item.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- Alur ---------------------------------------------------------- */}
      <section className="border-t border-border bg-surface-2">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <Reveal className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              Alur Kerja
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Tiga langkah, dari nol ke terpantau.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {ALUR.map((step, i) => (
              <Reveal key={step.n} delay={i * 110}>
                <div className="relative h-full rounded-[var(--radius-lg)] border border-border bg-surface p-7 shadow-card">
                  <span className="font-mono text-4xl font-semibold text-primary/25">
                    {step.n}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ----------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[var(--radius-lg)] bg-[#0b0a0e] px-8 py-16 text-center text-white sm:px-16 sm:py-20">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(225,29,51,0.28),transparent_60%)]"
              aria-hidden="true"
            />
            <div className="relative">
              <BrandMark className="mx-auto size-12" />
              <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Siap mengelola Tridharma dengan lebih rapi?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-white/60">
                Masuk untuk mulai mencatat dan memantau data institusi Anda.
              </p>
              <Link
                href="/login"
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-[var(--radius-sm)] bg-primary px-7 text-sm font-medium text-primary-foreground shadow-[var(--shadow-primary)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0a0e]"
              >
                Masuk ke Dashboard
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---- Footer -------------------------------------------------------- */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-muted sm:flex-row sm:px-8">
          <div className="flex items-center gap-2.5">
            <BrandMark className="size-8" />
            <span className="font-semibold tracking-tight text-foreground">
              SPM Nexus
            </span>
          </div>
          <p className="text-center text-xs text-muted-2 sm:text-right">
            Sistem Pengelolaan Data Tridharma Perguruan Tinggi
          </p>
        </div>
      </footer>
    </div>
  );
}
