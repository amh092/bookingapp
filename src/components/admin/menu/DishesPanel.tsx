"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteMenuItemAction, toggleMenuItemAction } from "@/actions/menu";
import { ConfirmDeleteDialog } from "@/components/admin/menu/ConfirmDeleteDialog";
import { DishFormDialog } from "@/components/admin/menu/DishFormDialog";
import { DishImage } from "@/components/menu/DishImage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatMenuPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminMenuCategory, MenuItemWithCategory } from "@/types/menu";

const ROW_GRID =
  "md:grid-cols-[minmax(0,1fr)_7.5rem_5.5rem_4rem_4.5rem_4.5rem_8.5rem]";

const CHIP_CLASS =
  "rounded-full border px-3 py-1 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

/** Mobile-only cell label so the stacked card layout stays readable. */
function CellLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs text-muted-foreground md:hidden">{children}</span>
  );
}

function DishRow({
  item,
  categories,
}: {
  item: MenuItemWithCategory;
  categories: AdminMenuCategory[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(flags: { isAvailable?: boolean; isFeatured?: boolean }) {
    setError(null);
    startTransition(async () => {
      const result = await toggleMenuItemAction(item.id, flags);
      if (!result.success) {
        setError(result.error ?? "The update failed — try again.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <li
      className={cn(
        "grid gap-3 p-4 md:items-center md:gap-3 md:px-4 md:py-2.5",
        ROW_GRID
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-gradient-to-br from-secondary to-elevated text-lg">
          <DishImage src={item.imageUrl} alt="" sizes="2.5rem" />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-medium">{item.name}</span>
          {item.description && (
            <span className="block truncate text-xs text-muted-foreground">
              {item.description}
            </span>
          )}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 md:block">
        <CellLabel>Category</CellLabel>
        <span className="text-sm text-muted-foreground">
          {item.category.name}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 md:block">
        <CellLabel>Price</CellLabel>
        <span className="text-sm font-semibold">
          {formatMenuPrice(item.price)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 md:block">
        <CellLabel>Prep</CellLabel>
        <span className="text-sm text-muted-foreground">
          {item.preparationMinutes !== null
            ? `${item.preparationMinutes} min`
            : "—"}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 md:block">
        <CellLabel>Available</CellLabel>
        <Switch
          checked={item.isAvailable}
          disabled={isPending}
          aria-label={`${item.name} available`}
          onCheckedChange={(checked) => toggle({ isAvailable: checked })}
        />
      </div>

      <div className="flex items-center justify-between gap-2 md:block">
        <CellLabel>Featured</CellLabel>
        <Switch
          checked={item.isFeatured}
          disabled={isPending}
          aria-label={`${item.name} featured`}
          onCheckedChange={(checked) => toggle({ isFeatured: checked })}
        />
      </div>

      <div className="flex items-center justify-end gap-1">
        <DishFormDialog categories={categories} item={item} />
        <ConfirmDeleteDialog
          triggerLabel="Delete"
          triggerAriaLabel={`Delete ${item.name}`}
          title={`Delete "${item.name}"?`}
          description="The dish is removed from the menu for good — marking it unavailable keeps it on the menu as sold out instead. Dishes that appear on orders cannot be deleted."
          confirmLabel="Delete dish"
          onConfirm={() => deleteMenuItemAction(item.id)}
        />
      </div>

      {error && (
        <p role="alert" className="text-xs text-destructive md:col-span-7">
          {error}
        </p>
      )}
    </li>
  );
}

interface DishesPanelProps {
  items: MenuItemWithCategory[];
  categories: AdminMenuCategory[];
}

/** Staff dish list: client-side search + category chips over the fetched rows. */
export function DishesPanel({ items, categories }: DishesPanelProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const search = query.trim().toLowerCase();
  const filtered = items.filter(
    (item) =>
      (activeCategory === "all" || item.categoryId === activeCategory) &&
      (!search ||
        item.name.toLowerCase().includes(search) ||
        (item.nameAr ?? "").includes(query.trim()) ||
        (item.description ?? "").toLowerCase().includes(search))
  );
  const soldOut = items.filter((item) => !item.isAvailable).length;

  return (
    <section
      aria-labelledby="dishes-heading"
      className="mt-6 overflow-hidden rounded-2xl border border-input bg-card"
    >
      <h2 id="dishes-heading" className="sr-only">
        Dishes
      </h2>

      <div className="flex flex-col gap-3 border-b border-input p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative md:max-w-60 md:flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Label htmlFor="dish-search" className="sr-only">
              Search dishes
            </Label>
            <Input
              id="dish-search"
              type="search"
              placeholder="Search dishes"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-9 pl-9"
            />
          </div>

          <div
            role="group"
            aria-label="Filter by category"
            className="flex flex-wrap gap-1.5"
          >
            <button
              type="button"
              aria-pressed={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
              className={cn(
                CHIP_CLASS,
                activeCategory === "all"
                  ? "border-transparent bg-primary font-semibold text-primary-foreground"
                  : "border-input text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  CHIP_CLASS,
                  activeCategory === category.id
                    ? "border-transparent bg-primary font-semibold text-primary-foreground"
                    : "border-input text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <p role="status" className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "dish" : "dishes"}
          {filtered.length !== items.length && ` of ${items.length}`} · {soldOut}{" "}
          sold out
        </p>
      </div>

      <div
        aria-hidden
        className={cn(
          "hidden gap-3 border-b border-input px-4 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase md:grid",
          ROW_GRID
        )}
      >
        <span>Dish</span>
        <span>Category</span>
        <span>Price</span>
        <span>Prep</span>
        <span>Available</span>
        <span>Featured</span>
        <span className="text-right">Actions</span>
      </div>

      {filtered.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-muted-foreground">
          <span aria-hidden className="mb-2 block text-2xl">
            🍽️
          </span>
          {items.length === 0
            ? "No dishes yet — add the first one."
            : "No dishes match."}
        </div>
      ) : (
        <ul className="divide-y divide-input">
          {filtered.map((item) => (
            <DishRow key={item.id} item={item} categories={categories} />
          ))}
        </ul>
      )}
    </section>
  );
}
