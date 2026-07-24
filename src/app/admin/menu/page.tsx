import type { Metadata } from "next";

import { CategoriesPanel } from "@/components/admin/menu/CategoriesPanel";
import { DishesPanel } from "@/components/admin/menu/DishesPanel";
import { DishFormDialog } from "@/components/admin/menu/DishFormDialog";
import {
  getAdminMenuCategories,
  getAdminMenuItems,
  getRestaurant,
} from "@/lib/api";
import { RESTAURANT } from "@/lib/mock-data";
import type { AdminMenuCategory, MenuItemWithCategory } from "@/types/menu";

export const metadata: Metadata = {
  title: `Menu — Staff — ${RESTAURANT.name}`,
};

export default async function AdminMenuPage() {
  let categories: AdminMenuCategory[];
  let items: MenuItemWithCategory[];
  try {
    const restaurant = await getRestaurant();
    [categories, items] = await Promise.all([
      getAdminMenuCategories(restaurant.id),
      getAdminMenuItems(restaurant.id),
    ]);
  } catch {
    return (
      <div className="mx-auto w-full max-w-4xl px-5 py-16 text-center">
        <p className="rounded-xl border border-dashed border-input px-4 py-8 text-sm text-muted-foreground">
          Could not reach the booking API — is it running?
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[clamp(1.5rem,3.5vw,2rem)]">Menu</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Categories, dishes and daily availability
          </p>
        </div>
        <DishFormDialog categories={categories} />
      </div>

      <DishesPanel items={items} categories={categories} />
      <CategoriesPanel categories={categories} />
    </div>
  );
}
