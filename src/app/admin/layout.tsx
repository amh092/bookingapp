import type { Metadata } from "next";

import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { RESTAURANT } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: `Staff — ${RESTAURANT.name}`,
  // Keep the admin area out of search indexes.
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // The login page renders bare (no sidebar). Every other /admin route is gated
  // by src/proxy.ts, so a signed-out request reaching here is the login page.
  if (!session?.user) {
    return <>{children}</>;
  }

  return (
    <AdminShell
      brand={RESTAURANT.name}
      user={{ name: session.user.name ?? "Staff", role: session.user.role }}
    >
      {children}
    </AdminShell>
  );
}
