import { MapPin } from "lucide-react";

import { HoursList } from "@/components/site/HoursList";
import { buttonVariants } from "@/components/ui/button";
import { RESTAURANT } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const DIRECTIONS_URL = `https://maps.google.com/?q=${encodeURIComponent(
  `${RESTAURANT.name}, ${RESTAURANT.address}`
)}`;

export function HoursLocation() {
  return (
    <section
      id="hours"
      className="border-y border-border bg-elevated py-[clamp(3rem,7vw,5rem)]"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 lg:grid-cols-2">
        <div>
          <h2 className="text-[clamp(1.6rem,3.6vw,2.25rem)]">Opening hours</h2>
          <HoursList />
        </div>

        <div id="location">
          <h2 className="text-[clamp(1.6rem,3.6vw,2.25rem)]">Find us</h2>
          <div className="mt-4 grid min-h-60 place-items-center overflow-hidden rounded-2xl border border-border bg-card bg-[linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] bg-[size:2.5rem_2.5rem]">
            <div className="grid justify-items-center gap-1 rounded-xl border border-input bg-background/85 px-4 py-3.5 text-center text-sm backdrop-blur-sm">
              <MapPin aria-hidden className="size-6 text-primary" />
              <strong>{RESTAURANT.name}</strong>
              <span className="text-muted-foreground">
                {RESTAURANT.address}
              </span>
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "mt-2 rounded-full border-input bg-transparent"
                )}
              >
                Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
