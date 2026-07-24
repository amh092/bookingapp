"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  deleteMenuCategoryAction,
  toggleMenuCategoryAction,
} from "@/actions/menu";
import { CategoryFormDialog } from "@/components/admin/menu/CategoryFormDialog";
import { ConfirmDeleteDialog } from "@/components/admin/menu/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdminMenuCategory } from "@/types/menu";

function CategoryTile({ category }: { category: AdminMenuCategory }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleActive() {
    setError(null);
    startTransition(async () => {
      const result = await toggleMenuCategoryAction(
        category.id,
        !category.isActive
      );
      if (!result.success) {
        setError(result.error ?? "The update failed — try again.");
        return;
      }
      router.refresh();
    });
  }

  const dishes = `${category.itemCount} ${category.itemCount === 1 ? "dish" : "dishes"}`;

  return (
    <li className="flex flex-col gap-2 rounded-2xl border border-input bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-heading text-base font-semibold">
            {category.name}
          </p>
          {category.nameAr && (
            <p dir="rtl" className="truncate text-sm text-muted-foreground">
              {category.nameAr}
            </p>
          )}
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold tracking-wider uppercase",
            category.isActive
              ? "bg-green-500/15 text-green-700 dark:text-green-400"
              : "bg-secondary text-muted-foreground"
          )}
        >
          {category.isActive ? "Live" : "Hidden"}
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        {dishes} · position {category.position}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
        <CategoryFormDialog category={category} />
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={toggleActive}
        >
          {isPending ? "Working…" : category.isActive ? "Deactivate" : "Activate"}
        </Button>
        <ConfirmDeleteDialog
          triggerLabel="Delete"
          triggerAriaLabel={`Delete ${category.name}`}
          title={`Delete "${category.name}"?`}
          description={
            category.itemCount > 0
              ? `This category still holds ${dishes}. Deleting is blocked until they are moved or deleted — deactivating hides the whole section without losing anything.`
              : "The category is removed from the menu for good. This cannot be undone."
          }
          confirmLabel="Delete category"
          onConfirm={() => deleteMenuCategoryAction(category.id)}
        />
      </div>

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </li>
  );
}

export function CategoriesPanel({
  categories,
}: {
  categories: AdminMenuCategory[];
}) {
  return (
    <section aria-labelledby="categories-heading" className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="categories-heading" className="text-xl">
          Categories
        </h2>
        <CategoryFormDialog />
      </div>

      {categories.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-input px-4 py-10 text-center text-sm text-muted-foreground">
          No categories yet — create one to start building the menu.
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryTile key={category.id} category={category} />
          ))}
        </ul>
      )}
    </section>
  );
}
