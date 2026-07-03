import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Building2,
  BriefcaseBusiness,
  FlaskConical,
  HeartHandshake,
  Trophy,
  BookOpenText,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Umum",
    items: [{ label: "Beranda", href: "/home", icon: LayoutDashboard }],
  },
  {
    label: "Master Data",
    items: [
      { label: "Program Studi", href: "/prodi", icon: Building2 },
      { label: "Dosen", href: "/dosen", icon: GraduationCap },
      { label: "Mahasiswa", href: "/mahasiswa", icon: Users },
      { label: "Jabatan", href: "/jabatan", icon: BriefcaseBusiness },
    ],
  },
  {
    label: "Tridharma",
    items: [
      { label: "Penelitian", href: "/penelitian", icon: FlaskConical },
      { label: "Pengabdian", href: "/pengabdian", icon: HeartHandshake },
      { label: "Prestasi", href: "/prestasi", icon: Trophy },
      { label: "Publikasi", href: "/publikasi", icon: BookOpenText },
    ],
  },
];
