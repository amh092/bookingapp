import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/admin/LoginForm";
import { RESTAURANT } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: `Staff sign in — ${RESTAURANT.name}`,
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Already signed in (and not on a dead refresh) → straight to the panel.
  const session = await auth();
  if (session?.user && session.error !== "RefreshTokenError") {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span
            aria-hidden
            className="mb-3 grid size-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.62_0.16_30)] text-lg"
          >
            🍽️
          </span>
          <h1 className="font-heading text-2xl font-semibold">Staff sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage reservations and orders for {RESTAURANT.name}
          </p>
        </div>

        <div className="rounded-2xl border border-input bg-card p-6 shadow-sm">
          <LoginForm
            defaultEmail={process.env.DEMO_LOGIN_EMAIL}
            defaultPassword={process.env.DEMO_LOGIN_PASSWORD}
          />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            ← Back to the site
          </Link>
        </p>
      </div>
    </main>
  );
}
