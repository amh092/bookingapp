/**
 * Menu shapes as booking-api returns them. Prices travel as decimal strings
 * ("28.00") in both directions so no precision is lost to floats.
 */

export interface MenuItem {
  id: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  /** Decimal string with two decimals, e.g. "28.00". */
  price: string;
  imageUrl: string | null;
  /** Unavailable dishes stay on the public menu, shown as sold out. */
  isAvailable: boolean;
  isFeatured: boolean;
  preparationMinutes: number | null;
  dietaryTags: string[];
  allergens: string[];
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

/** Category summary embedded in item responses. */
export interface MenuCategoryRef {
  id: string;
  name: string;
  nameAr: string | null;
  position: number;
  isActive: boolean;
}

/** Staff list rows and featured dishes carry their category. */
export type MenuItemWithCategory = MenuItem & { category: MenuCategoryRef };

/** One section of the public menu: an active category with all its dishes. */
export interface PublicMenuCategory {
  id: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  position: number;
  items: MenuItem[];
}

/** Category record from the staff endpoints — inactive ones included. */
export interface AdminMenuCategory {
  id: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  position: number;
  isActive: boolean;
  restaurantId: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}
