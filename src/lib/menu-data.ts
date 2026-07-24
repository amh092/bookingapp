import {
  getPublicMenu,
  getRestaurant,
  MENU_TAG,
  RESTAURANT_TAG,
} from "@/lib/api";
import type { PublicMenuCategory } from "@/types/menu";

/**
 * Cached, tagged public-menu fetch shared by /menu and /menu/[category].
 * Server-side only (imports the API client). Returns null when the API is
 * unreachable so pages can render a friendly fallback.
 */
export async function loadPublicMenu(): Promise<PublicMenuCategory[] | null> {
  try {
    const restaurant = await getRestaurant({
      cache: "force-cache",
      next: { tags: [RESTAURANT_TAG] },
    });
    return await getPublicMenu(restaurant.id, {
      cache: "force-cache",
      next: { tags: [MENU_TAG] },
    });
  } catch {
    return null;
  }
}
