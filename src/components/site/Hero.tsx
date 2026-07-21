import Link from "next/link";

import { ArtPanel } from "@/components/site/ArtPanel";
import { AvailabilityBadge } from "@/components/site/AvailabilityBadge";
import { buttonVariants } from "@/components/ui/button";
import { ACTIVE_TABLE_COUNT, RESTAURANT } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const FACTS = [
  { value: "60s", label: "to book" },
  { value: String(ACTIVE_TABLE_COUNT), label: "tables in the room" },
  { value: RESTAURANT.rating.toFixed(1), label: "guest rating" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden py-[clamp(3rem,9vw,6.5rem)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 size-[46rem] rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div>
          <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-[0.78125rem] font-semibold tracking-[0.06em] text-primary uppercase">
            Mediterranean · Al Khobar
          </span>
          <h1 className="mt-4 mb-4 text-[clamp(2.4rem,6.5vw,4rem)] leading-[1.1]">
            Your table is waiting
          </h1>
          <p className="max-w-xl text-[1.0625rem] text-muted-foreground">
            Reserve in under a minute. Pick your party size and date — we only
            show times we can actually seat you.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/reservations"
              className={cn(
                buttonVariants(),
                "h-11 rounded-full px-6 text-[0.9375rem] font-semibold"
              )}
            >
              Reserve a table
            </Link>
            <Link
              href="/menu"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 rounded-full border-input bg-transparent px-6 text-[0.9375rem] font-semibold"
              )}
            >
              View the menu
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-7 border-t border-border pt-7">
            {FACTS.map((fact) => (
              <div key={fact.label}>
                <div className="font-heading text-2xl text-primary">
                  {fact.value}
                </div>
                <div className="text-[0.8125rem] text-muted-foreground/75">
                  {fact.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <ArtPanel className="aspect-[4/3.4]">
          <AvailabilityBadge />
        </ArtPanel>
      </div>
    </section>
  );
}
