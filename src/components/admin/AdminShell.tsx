"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminNav } from "@/components/admin/AdminNav";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { Button, buttonVariants } from "@/components/ui/button";
import type { UserRole } from "@/types/auth";
import { cn } from "@/lib/utils";

interface AdminUser {
  name: string;
  role: UserRole;
}

interface AdminShellProps {
  brand: string;
  user: AdminUser;
  children: React.ReactNode;
}

const ROLE_LABEL: Record<UserRole, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  STAFF: "Staff",
};

// Shared by the persistent desktop sidebar and the mobile drawer; only the
// drawer gets a close button.
function SidebarBody({
  brand,
  user,
  onClose,
}: {
  brand: string;
  user: AdminUser;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-2 pb-4">
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-[oklch(0.62_0.16_30)] text-base"
        >
          🍽️
        </span>
        <span className="min-w-0 font-heading font-semibold leading-tight">
          {brand}
          <span className="block font-sans text-[0.6875rem] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            Manager
          </span>
        </span>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X />
          </Button>
        )}
      </div>

      <p className="px-2.5 pb-1.5 text-[0.6875rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
        Operations
      </p>
      <AdminNav role={user.role} onNavigate={onClose} />

      <div className="mt-auto space-y-2 border-t border-sidebar-border pt-3">
        <div className="px-2.5">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="text-[0.6875rem] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            {ROLE_LABEL[user.role]}
          </p>
        </div>
        <LogoutButton />
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}
        >
          View site
        </Link>
      </div>
    </>
  );
}

export function AdminShell({ brand, user, children }: AdminShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [drawerOpen]);

  return (
    <div className="flex flex-1">
      <aside
        data-tour="admin-nav"
        className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar px-3 py-4 lg:flex"
      >
        <SidebarBody brand={brand} user={user} />
      </aside>

      {drawerOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-50 bg-black/55 lg:hidden"
        />
      )}

      {/* Kept mounted so it can slide; `inert` keeps it out of reach while closed. */}
      <aside
        id="admin-drawer"
        inert={!drawerOpen}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar px-3 py-4 shadow-lg transition-transform duration-200 lg:hidden",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarBody
          brand={brand}
          user={user}
          onClose={() => setDrawerOpen(false)}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border/60 bg-background/90 px-4 backdrop-blur lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            aria-controls="admin-drawer"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu />
          </Button>
          <span className="truncate font-heading font-semibold">{brand}</span>
          <Link
            href="/"
            className="ml-auto shrink-0 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View site
          </Link>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
