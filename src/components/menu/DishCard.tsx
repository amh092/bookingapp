import { DishImage } from "@/components/menu/DishImage";
import { formatMenuPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/menu";

const TAG_CLASS =
  "rounded-full border border-border bg-secondary px-2 py-0.5 text-[0.6875rem] text-muted-foreground";

/** Allergens get a warm tint so they stand apart from dietary labels. */
const ALLERGEN_CLASS =
  "rounded-full border border-amber-600/30 bg-amber-500/10 px-2 py-0.5 text-[0.6875rem] text-amber-700 dark:text-amber-400";

export function DishCard({ dish }: { dish: MenuItem }) {
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-input hover:shadow-lg",
        !dish.isAvailable && "opacity-60"
      )}
    >
      <div className="relative grid aspect-[16/10] place-items-center overflow-hidden border-b border-border bg-gradient-to-br from-secondary to-elevated">
        <DishImage src={dish.imageUrl} alt={dish.name} />
        {dish.isFeatured && (
          <span className="absolute top-2.5 left-2.5 rounded-full bg-primary px-2.5 py-0.5 text-[0.6875rem] font-bold tracking-wider text-primary-foreground uppercase">
            Featured
          </span>
        )}
        {!dish.isAvailable && (
          <span className="absolute right-2.5 bottom-2.5 rounded-full border border-border bg-background/90 px-2.5 py-0.5 text-[0.6875rem] font-semibold tracking-wider text-destructive uppercase">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[1.0625rem]">{dish.name}</h3>
          <span className="font-bold whitespace-nowrap text-primary">
            {formatMenuPrice(dish.price)}
          </span>
        </div>
        {dish.description && (
          <p className="flex-1 text-sm text-muted-foreground">
            {dish.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {dish.preparationMinutes !== null && (
            <span className={TAG_CLASS}>{dish.preparationMinutes} min</span>
          )}
          {dish.dietaryTags.map((tag) => (
            <span key={tag} className={TAG_CLASS}>
              {tag}
            </span>
          ))}
          {dish.allergens.map((allergen) => (
            <span key={allergen} className={ALLERGEN_CLASS}>
              <span className="sr-only">Contains </span>
              {allergen}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
