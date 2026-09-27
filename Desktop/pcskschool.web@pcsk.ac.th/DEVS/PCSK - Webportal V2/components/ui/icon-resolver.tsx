import React from "react";
import {
  Users,
  User,
  UserCheck,
  ClipboardList,
  FileText,
  File,
  Folder,
  Calendar,
  CalendarCheck,
  Clock,
  Database,
  Server,
  BarChart3,
  PieChart,
  TrendingUp,
  Settings,
  Sliders,
  GraduationCap,
  BookOpen,
  School,
  Package,
  Boxes,
  Laptop,
  Monitor,
  Mail,
  Inbox,
  Shield,
  ShieldCheck,
  Wrench,
  Layers,
  LucideProps,
} from "lucide-react";

interface IconResolverProps extends LucideProps {
  name: string;
}

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  // Administration & General
  users: Users,
  user: User,
  "user-check": UserCheck,
  clipboard: ClipboardList,
  "clipboard-list": ClipboardList,
  "file-text": FileText,
  file: File,
  folder: Folder,
  mail: Mail,
  inbox: Inbox,

  // Academic & School
  "graduation-cap": GraduationCap,
  "book-open": BookOpen,
  school: School,

  // HR & Calendar
  calendar: Calendar,
  "calendar-check": CalendarCheck,
  clock: Clock,

  // IT & Tech
  database: Database,
  server: Server,
  laptop: Laptop,
  monitor: Monitor,

  // Asset & Logistics
  package: Package,
  boxes: Boxes,

  // Analytics & Reports
  chart: BarChart3,
  "bar-chart": BarChart3,
  "pie-chart": PieChart,
  "trending-up": TrendingUp,

  // System & Security
  settings: Settings,
  sliders: Sliders,
  shield: Shield,
  "shield-check": ShieldCheck,
  wrench: Wrench,
  layers: Layers,
};

/**
 * Resolves an icon string identifier from the database to an approved Lucide icon component.
 * Prevents raw HTML injection while supporting flexible database-driven icons.
 */
export function IconResolver({ name, className = "w-5 h-5", ...props }: IconResolverProps) {
  const normalizedKey = (name || "").toLowerCase().trim();
  const IconComponent = ICON_MAP[normalizedKey] || Layers;

  return <IconComponent className={className} {...props} />;
}
