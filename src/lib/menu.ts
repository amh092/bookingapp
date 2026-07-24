import type { PublicMenuCategory } from "@/types/menu";

/**
 * URL slug of a category name: "Main Courses" → "main-courses". Unicode-aware
 * so Arabic category names slug cleanly too.
 */
export function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function findCategoryBySlug(
  categories: PublicMenuCategory[],
  slug: string
): PublicMenuCategory | null {
  return (
    categories.find((category) => categorySlug(category.name) === slug) ?? null
  );
}
