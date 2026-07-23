import type { Metadata } from "next";
import Link from "next/link";

import { NavLink } from "@/components/site/NavLink";
import { RESTAURANT } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: `Staff — ${RESTAURANT.name}`,
  // The admin area has no login yet (auth feature pending) — keep it out of
  // search indexes.
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-5">
          <div className="flex min-w-0 items-center gap-4">
            <span className="shrink-0 font-heading font-semibold">
              {RESTAURANT.name}
              <span className="hidden sm:inline"> · Staff</span>
            </span>
            <nav
              aria-label="Admin"
              className="flex items-center gap-1 overflow-x-auto text-sm"
            >
              <NavLink href="/admin" label="Dashboard" />
              <NavLink href="/admin/reservations" label="Reservations" />
              <NavLink href="/admin/calendar" label="Calendar" />
            </nav>
          </div>
          <Link
            href="/"
            className="shrink-0 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View site
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
