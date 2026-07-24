import Link from "next/link";

import { DishCard } from "@/components/menu/DishCard";
import { buttonVariants } from "@/components/ui/button";
import {
  getFeaturedDishes,
  getRestaurant,
  MENU_TAG,
  RESTAURANT_TAG,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import type { MenuItemWithCategory } from "@/types/menu";

// The section lives on the landing page — show a quiet fallback instead of
// failing the whole page when the API is unreachable.
async function loadFeatured(): Promise<MenuItemWithCategory[] | null> {
  try {
    const restaurant = await getRestaurant({
      cache: "force-cache",
      next: { tags: [RESTAURANT_TAG] },
    });
    return await getFeaturedDishes(restaurant.id, {
      cache: "force-cache",
      next: { tags: [MENU_TAG] },
    });
  } catch {
    return null;
  }
}

export async function FeaturedDishes() {
  const dishes = await loadFeatured();

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

        {dishes === null || dishes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-input px-4 py-10 text-center text-sm text-muted-foreground">
            <span aria-hidden className="mb-2 block text-2xl">
              🍽️
            </span>
            {dishes === null
              ? "The kitchen board is offline right now — the full menu has everything."
              : "Nothing is featured this week — the full menu still has plenty to explore."}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-5">
            {dishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
