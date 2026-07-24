"use client";

import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

// The spec lists nine admin sections; the rest (Tables, Orders, Customers,
// Staff, Settings) join this list as each phase ships, so the nav never
// points at a route that does not exist yet.
const ADMIN_NAV_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/reservations", label: "Reservations", icon: ClipboardList },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
];

interface AdminNavProps {
  /** Lets the mobile drawer close itself when a link is tapped. */
  onNavigate?: () => void;
}

export function AdminNav({ onNavigate }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="grid gap-0.5">
      {ADMIN_NAV_LINKS.map(({ href, label, icon: Icon }) => {
        // "/admin" is the dashboard itself, so it only matches exactly; the
        // others stay active on their nested routes.
        const isActive =
          href === "/admin" ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.9375rem] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
              isActive && "bg-primary/10 font-medium text-primary"
            )}
          >
            <Icon aria-hidden className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
