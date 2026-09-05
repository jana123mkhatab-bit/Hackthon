import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Lightbulb,
  Accessibility,
  Network,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/knowledge", label: "Knowledge DNA", icon: Network },
  { href: "/plan", label: "Study Plan", icon: CalendarDays },
  { href: "/techniques", label: "Techniques", icon: Lightbulb },
  { href: "/settings/accessibility", label: "Accessibility", icon: Accessibility },
];
