"use server";

import { revalidatePath, updateTag } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";

import {
  ApiError,
  createMenuCategory,
  createMenuItem,
  deleteMenuCategory,
  deleteMenuItem,
  getRestaurant,
  MENU_TAG,
  updateMenuCategory,
  updateMenuItem,
} from "@/lib/api";
import type { MenuCategoryPayload, MenuItemPayload } from "@/lib/api";

const GENERIC_ERROR = "Something went wrong — please try again.";

function errorMessage(error: unknown): string {
  // Let Next.js control-flow errors (e.g. the redirect authHeaders() throws
  // when the session is gone) propagate instead of becoming a toast.
  unstable_rethrow(error);
  return error instanceof ApiError ? error.message : GENERIC_ERROR;
}

export interface MenuActionResult {
  success: boolean;
  error?: string;
  /** Validation messages keyed by form field name. */
  fieldErrors?: Record<string, string>;
}

/**
 * The public menu and featured dishes are cached under MENU_TAG. `updateTag`
 * (not `revalidateTag`) expires it immediately — staff read their own writes —
 * and the pages that render menu data are revalidated so every surface
 * refreshes at once.
 */
function revalidateMenu() {
  updateTag(MENU_TAG);
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/menu/[category]", "page");
  revalidatePath("/admin/menu");
}

function fieldErrorsOf(error: z.ZodError): MenuActionResult {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    if (field) fieldErrors[field] ??= issue.message;
  }
  return { success: false, error: "Check the highlighted fields.", fieldErrors };
}

/** "" from an untouched optional input clears the column. */
const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} is too long.`)
    .transform((value) => (value === "" ? null : value));

/* ------------------------------------------------------- categories ----- */

const categoryInput = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Give the category a name.")
    .max(80, "Name is too long."),
  nameAr: optionalText(80, "Arabic name"),
  description: optionalText(500, "Description"),
  descriptionAr: optionalText(500, "Arabic description"),
  position: z.coerce
    .number()
    .int("Position must be a whole number.")
    .min(0, "Position cannot be negative.")
    .max(1000, "Position is too large."),
  isActive: z.boolean(),
});

export async function saveMenuCategoryAction(
  categoryId: string | null,
  formData: FormData
): Promise<MenuActionResult> {
  const parsed = categoryInput.safeParse({
    name: formData.get("name"),
    nameAr: formData.get("nameAr") ?? "",
    description: formData.get("description") ?? "",
    descriptionAr: formData.get("descriptionAr") ?? "",
    position: formData.get("position") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return fieldErrorsOf(parsed.error);
  }

  const payload: MenuCategoryPayload = parsed.data;

  try {
    const restaurant = await getRestaurant();
    if (categoryId) {
      await updateMenuCategory(restaurant.id, categoryId, payload);
    } else {
      await createMenuCategory(restaurant.id, payload);
    }
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }

  revalidateMenu();
  return { success: true };
}

/** Show/hide a category (and all its dishes) on the public menu. */
export async function toggleMenuCategoryAction(
  categoryId: string,
  isActive: boolean
): Promise<MenuActionResult> {
  if (!categoryId || typeof isActive !== "boolean") {
    return { success: false, error: "Invalid category update." };
  }

  try {
    const restaurant = await getRestaurant();
    await updateMenuCategory(restaurant.id, categoryId, { isActive });
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }

  revalidateMenu();
  return { success: true };
}

export async function deleteMenuCategoryAction(
  categoryId: string
): Promise<MenuActionResult> {
  if (!categoryId) return { success: false, error: "Unknown category." };

  try {
    const restaurant = await getRestaurant();
    await deleteMenuCategory(restaurant.id, categoryId);
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }

  revalidateMenu();
  return { success: true };
}

/* ------------------------------------------------------------ items ----- */

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

/** "Vegan, vegan, " → ["Vegan"] — trimmed, deduped case-insensitively. */
const tagList = (label: string) =>
  z
    .string()
    .transform((value) => {
      const seen = new Set<string>();
      const tags: string[] = [];
      for (const part of value.split(",")) {
        const tag = part.trim();
        if (!tag || seen.has(tag.toLowerCase())) continue;
        seen.add(tag.toLowerCase());
        tags.push(tag);
      }
      return tags;
    })
    .refine((tags) => tags.length <= 15, `Keep ${label} to 15 entries or fewer.`)
    .refine(
      (tags) => tags.every((tag) => tag.length <= 30),
      `Each ${label.replace(/s$/, "")} must stay under 30 characters.`
    );

const itemInput = z.object({
  categoryId: z.string().min(1, "Pick a category."),
  name: z
    .string()
    .trim()
    .min(1, "Give the dish a name.")
    .max(80, "Name is too long."),
  nameAr: optionalText(80, "Arabic name"),
  description: optionalText(500, "Description"),
  descriptionAr: optionalText(500, "Arabic description"),
  price: z
    .string()
    .trim()
    .regex(/^\d{1,8}(\.\d{1,2})?$/, "Enter a price like 28 or 28.50."),
  imageUrl: z
    .string()
    .trim()
    .max(2048, "Image URL is too long.")
    .transform((value) => (value === "" ? null : value))
    .refine(
      (value) => value === null || isHttpUrl(value),
      "Enter a full http(s) image URL."
    ),
  preparationMinutes: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce
      .number()
      .int("Prep minutes must be a whole number.")
      .min(1, "Prep minutes must be at least 1.")
      .max(240, "Prep minutes must be 240 or less.")
      .optional()
  ),
  dietaryTags: tagList("dietary tags"),
  allergens: tagList("allergens"),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
});

export async function saveMenuItemAction(
  itemId: string | null,
  formData: FormData
): Promise<MenuActionResult> {
  const parsed = itemInput.safeParse({
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    nameAr: formData.get("nameAr") ?? "",
    description: formData.get("description") ?? "",
    descriptionAr: formData.get("descriptionAr") ?? "",
    price: formData.get("price"),
    imageUrl: formData.get("imageUrl") ?? "",
    preparationMinutes: formData.get("preparationMinutes") ?? "",
    dietaryTags: formData.get("dietaryTags") ?? "",
    allergens: formData.get("allergens") ?? "",
    isAvailable: formData.get("isAvailable") === "on",
    isFeatured: formData.get("isFeatured") === "on",
  });

  if (!parsed.success) {
    return fieldErrorsOf(parsed.error);
  }

  const payload: MenuItemPayload = {
    ...parsed.data,
    preparationMinutes: parsed.data.preparationMinutes ?? null,
  };

  try {
    const restaurant = await getRestaurant();
    if (itemId) {
      await updateMenuItem(restaurant.id, itemId, payload);
    } else {
      await createMenuItem(restaurant.id, payload);
    }
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }

  revalidateMenu();
  return { success: true };
}

const itemFlags = z
  .object({
    isAvailable: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  })
  .refine(
    (flags) => flags.isAvailable !== undefined || flags.isFeatured !== undefined,
    "Nothing to change."
  );

/** Availability / featured switches — the same PATCH, narrowed to the flags. */
export async function toggleMenuItemAction(
  itemId: string,
  flags: z.infer<typeof itemFlags>
): Promise<MenuActionResult> {
  const parsed = itemFlags.safeParse(flags);
  if (!itemId || !parsed.success) {
    return { success: false, error: "Invalid menu update." };
  }

  try {
    const restaurant = await getRestaurant();
    await updateMenuItem(restaurant.id, itemId, parsed.data);
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }

  revalidateMenu();
  return { success: true };
}

export async function deleteMenuItemAction(
  itemId: string
): Promise<MenuActionResult> {
  if (!itemId) return { success: false, error: "Unknown dish." };

  try {
    const restaurant = await getRestaurant();
    await deleteMenuItem(restaurant.id, itemId);
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }

  revalidateMenu();
  return { success: true };
}
