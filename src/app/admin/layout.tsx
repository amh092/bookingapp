import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";
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
  return <AdminShell brand={RESTAURANT.name}>{children}</AdminShell>;
}
