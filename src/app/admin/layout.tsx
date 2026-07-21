import type { Metadata } from "next";
import Link from "next/link";

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
          <div className="flex items-center gap-4">
            <span className="font-heading font-semibold">
              {RESTAURANT.name} · Staff
            </span>
            <nav aria-label="Admin" className="flex items-center gap-1 text-sm">
              <Link
                href="/admin/reservations"
                className="rounded-full bg-secondary px-3 py-1.5 font-medium"
              >
                Reservations
              </Link>
            </nav>
          </div>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View site
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
