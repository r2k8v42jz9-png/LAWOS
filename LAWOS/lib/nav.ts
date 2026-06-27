import {
  LayoutDashboard,
  GraduationCap,
  Scale,
  Languages,
  BookOpen,
  FlaskConical,
  Award,
  Briefcase,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { AreaKey } from "@/lib/data/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  area?: AreaKey;
  /** Optional keyboard hint, e.g. "G D". */
  shortcut?: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard, shortcut: "G D" }],
  },
  {
    title: "Academics",
    items: [
      { label: "Foundation", href: "/foundation", icon: GraduationCap, area: "foundation", shortcut: "G F" },
      { label: "LLB", href: "/llb", icon: Scale, area: "llb", shortcut: "G L" },
      { label: "Legal English", href: "/legal-english", icon: Languages, area: "legal-english", shortcut: "G E" },
    ],
  },
  {
    title: "Knowledge",
    items: [
      { label: "Reading", href: "/reading", icon: BookOpen, area: "reading", shortcut: "G R" },
      { label: "Research", href: "/research", icon: FlaskConical, area: "research" },
    ],
  },
  {
    title: "Future",
    items: [
      { label: "Scholarships", href: "/scholarships", icon: Award, area: "scholarships" },
      { label: "Career", href: "/career", icon: Briefcase, area: "career" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

/** Flat list of all nav items, useful for the command menu and breadcrumbs. */
export const ALL_NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);
