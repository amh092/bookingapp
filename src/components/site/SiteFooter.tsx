import Link from "next/link";

import { RESTAURANT } from "@/lib/mock-data";

const EXPLORE_LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/reservations", label: "Reserve a table" },
  { href: "/reservations/manage", label: "Manage a booking" },
  { href: "/orders", label: "Track your order" },
  { href: "/admin/login", label: "Staff panel" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-elevated pt-10 pb-8">
      <div className="mx-auto w-full max-w-6xl px-5">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2.5 font-heading text-[1.0625rem] font-semibold">
              <span
                aria-hidden
                className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-[oklch(0.62_0.16_30)] text-base"
              >
                🍽️
              </span>
              {RESTAURANT.name}
            </div>
            <p className="text-sm text-muted-foreground">
              Wood-fired Mediterranean in Al Khobar.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-[0.8125rem] tracking-[0.08em] text-muted-foreground/75 uppercase">
              Explore
            </h4>
            <ul className="grid gap-1.5 text-[0.9375rem] text-muted-foreground">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-[0.8125rem] tracking-[0.08em] text-muted-foreground/75 uppercase">
              Visit
            </h4>
            <ul className="grid gap-1.5 text-[0.9375rem] text-muted-foreground">
              <li>{RESTAURANT.address}</li>
              <li>{RESTAURANT.phone}</li>
              <li>{RESTAURANT.email}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-[0.8125rem] text-muted-foreground/75">
          <span>
            © {new Date().getFullYear()} {RESTAURANT.name}. All rights
            reserved.
          </span>
          <span>Preview build — online booking coming soon</span>
        </div>
      </div>
    </footer>
  );
}
