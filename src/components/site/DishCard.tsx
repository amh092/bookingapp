import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/restaurant";

const TAG_CLASS =
  "rounded-full border border-border bg-secondary px-2 py-0.5 text-[0.6875rem] text-muted-foreground";

export function DishCard({ dish }: { dish: MenuItem }) {
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-input hover:shadow-lg",
        !dish.isAvailable && "opacity-55"
      )}
    >
      <div className="relative grid aspect-[16/10] place-items-center border-b border-border bg-gradient-to-br from-secondary to-elevated text-5xl">
        <span aria-hidden>{dish.emoji}</span>
        {dish.isFeatured && (
          <span className="absolute top-2.5 left-2.5 rounded-full bg-primary px-2.5 py-0.5 text-[0.6875rem] font-bold tracking-wider text-primary-foreground uppercase">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[1.0625rem]">{dish.name}</h3>
          <span className="font-bold whitespace-nowrap text-primary">
            {formatPrice(dish.price)}
          </span>
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          {dish.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className={TAG_CLASS}>{dish.preparationMinutes} min</span>
          {dish.tags.map((tag) => (
            <span key={tag} className={TAG_CLASS}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
