"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ThemeToggle } from "@/components/site/ThemeToggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { RESTAURANT } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/#hours", label: "Hours" },
  { href: "/#location", label: "Location" },
  { href: "/reservations", label: "Reserve a table" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-5">
        <Link
          href="/"
          className="mr-auto flex items-center gap-2.5 font-heading text-[1.0625rem] font-semibold"
        >
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-[oklch(0.62_0.16_30)] text-base"
          >
            🍽️
          </span>
          {RESTAURANT.name}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-1.5 text-[0.9375rem] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                pathname === link.href && "bg-secondary text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((wasOpen) => !wasOpen)}
          >
            {open ? <X /> : <Menu />}
          </Button>
          <Link
            href="/reservations"
            className={cn(
              buttonVariants(),
              "hidden rounded-full px-4 font-semibold md:inline-flex"
            )}
          >
            Reserve a table
          </Link>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="absolute inset-x-0 top-16 flex flex-col gap-1 border-b border-border bg-elevated p-4 shadow-lg md:hidden"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
