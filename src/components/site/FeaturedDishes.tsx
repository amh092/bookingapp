import Link from "next/link";

import { DishCard } from "@/components/site/DishCard";
import { buttonVariants } from "@/components/ui/button";
import { FEATURED_ITEMS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function FeaturedDishes() {
  return (
    <section className="border-y border-border bg-elevated py-[clamp(3rem,7vw,5rem)]">
      <div className="mx-auto w-full max-w-6xl px-5">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-[clamp(1.6rem,3.6vw,2.25rem)]">
              Signature plates
            </h2>
            <p className="mt-2 text-muted-foreground">
              What our guests order most this week.
            </p>
          </div>
          <Link
            href="/menu"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full border-input bg-transparent"
            )}
          >
            Full menu
          </Link>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-5">
          {FEATURED_ITEMS.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      </div>
    </section>
  );
}
