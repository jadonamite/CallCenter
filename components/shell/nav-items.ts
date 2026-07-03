import {
  BookUser,
  CalendarClock,
  CalendarDays,
  LayoutDashboard,
  Users,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/follow-ups", label: "Follow-ups", icon: CalendarClock },
  { href: "/contacts", label: "Contacts", icon: BookUser },
  { href: "/events", label: "Events", icon: CalendarDays },
] as const;

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
