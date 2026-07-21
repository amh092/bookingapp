import Link from "next/link";

import { MobileNav } from "@/components/site/MobileNav";
import { NavLink } from "@/components/site/NavLink";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { buttonVariants } from "@/components/ui/button";
import { getRestaurant, RESTAURANT_TAG } from "@/lib/api";
import { RESTAURANT } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/#hours", label: "Hours" },
  { href: "/#location", label: "Location" },
  { href: "/reservations", label: "Reserve a table" },
];

// The header is on every public page — fall back to the mock branding
// instead of failing the whole page when the API is unreachable.
async function restaurantName(): Promise<string> {
  try {
    const restaurant = await getRestaurant({
      cache: "force-cache",
      next: { tags: [RESTAURANT_TAG] },
    });

    return restaurant.name;
  } catch {
    return RESTAURANT.name;
  }
}

export async function SiteHeader() {
  const name = await restaurantName();

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
          {name}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <MobileNav links={NAV_LINKS} />
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
    </header>
  );
}
