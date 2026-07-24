import type {
  AdminMenuCategory,
  MenuItemWithCategory,
  PublicMenuCategory,
} from "@/types/menu";
import type {
  AdminReservation,
  AdminTable,
  Availability,
  Reservation,
  ReservationStatus,
  RestaurantProfile,
} from "@/types/reservation";

/**
 * Thin client for the booking-api backend. Server-side only — it reads
 * non-public env vars, so it must only be imported from server components
 * and server actions.
 */

const API_URL = process.env.API_URL ?? "http://localhost:3001";
const RESTAURANT_SLUG = process.env.RESTAURANT_SLUG ?? "the-golden-fork";

/**
 * Cache tag for the restaurant profile. Revalidation (e.g. the future admin
 * settings action) must call `revalidateTag(RESTAURANT_TAG)` with this exact
 * string — a mismatched tag fails silently.
 */
export const RESTAURANT_TAG = "restaurant";

/**
 * Cache tag for everything menu-shaped (public menu + featured dishes).
 * Menu mutations must call `revalidateTag(MENU_TAG)` with this exact string.
 */
export const MENU_TAG = "menu";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiErrorBody {
  message?: string | string[];
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    // Uncached by default; callers can opt into caching via init.next.
    ...(init?.next ? {} : { cache: "no-store" as const }),
    ...init,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? response.statusText);
    throw new ApiError(response.status, message);
  }

  // DELETE endpoints answer 204 with an empty body.
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getRestaurant(init?: RequestInit): Promise<RestaurantProfile> {
  return api(`/restaurants/${RESTAURANT_SLUG}`, init);
}

export function getAvailability(
  restaurantId: string,
  date: string,
  guests: number,
  excludeReservationId?: string
): Promise<Availability> {
  const query = new URLSearchParams({ date, guests: String(guests) });
  if (excludeReservationId) {
    query.set("excludeReservationId", excludeReservationId);
  }
  return api(`/restaurants/${restaurantId}/availability?${query}`);
}

export function getReservation(code: string): Promise<Reservation> {
  return api(`/reservations/${encodeURIComponent(code)}`);
}

export interface CreateReservationPayload {
  restaurantId: string;
  guests: number;
  startAt: string;
  name: string;
  phone: string;
  email?: string;
  customerNotes?: string;
}

export function createReservation(
  payload: CreateReservationPayload
): Promise<Reservation> {
  return api(`/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function cancelReservation(id: string): Promise<Reservation> {
  return api(`/reservations/${encodeURIComponent(id)}/cancel`, {
    method: "PATCH",
  });
}

export function confirmReservation(id: string): Promise<Reservation> {
  return api(`/reservations/${encodeURIComponent(id)}/confirm`, {
    method: "PATCH",
  });
}

export function completeReservation(id: string): Promise<Reservation> {
  return api(`/reservations/${encodeURIComponent(id)}/complete`, {
    method: "PATCH",
  });
}

export function noShowReservation(id: string): Promise<Reservation> {
  return api(`/reservations/${encodeURIComponent(id)}/no-show`, {
    method: "PATCH",
  });
}

export function rescheduleReservation(
  id: string,
  startAt: string
): Promise<Reservation> {
  return api(`/reservations/${encodeURIComponent(id)}/reschedule`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ startAt }),
  });
}

export function assignReservationTable(
  id: string,
  tableId: string
): Promise<Reservation> {
  return api(`/reservations/${encodeURIComponent(id)}/table`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tableId }),
  });
}

export interface AdminReservationFilters {
  date?: string;
  /** Inclusive calendar-day range; use with `to` instead of `date`. */
  from?: string;
  to?: string;
  status?: ReservationStatus;
  tableId?: string;
  search?: string;
}

export function getAdminReservations(
  restaurantId: string,
  filters: AdminReservationFilters
): Promise<AdminReservation[]> {
  const query = new URLSearchParams();
  if (filters.date) query.set("date", filters.date);
  if (filters.from) query.set("from", filters.from);
  if (filters.to) query.set("to", filters.to);
  if (filters.status) query.set("status", filters.status);
  if (filters.tableId) query.set("tableId", filters.tableId);
  if (filters.search) query.set("search", filters.search);
  const suffix = query.size > 0 ? `?${query}` : "";
  return api(`/restaurants/${restaurantId}/reservations${suffix}`);
}

export function getAdminTables(restaurantId: string): Promise<AdminTable[]> {
  return api(`/restaurants/${restaurantId}/tables`);
}

/* ------------------------------------------------------------- menu ----- */

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

/** Active categories with all their dishes (sold-out ones included). */
export function getPublicMenu(
  restaurantId: string,
  init?: RequestInit
): Promise<PublicMenuCategory[]> {
  return api(`/restaurants/${restaurantId}/menu`, init);
}

/** Available featured dishes in active categories, for the landing page. */
export function getFeaturedDishes(
  restaurantId: string,
  init?: RequestInit
): Promise<MenuItemWithCategory[]> {
  return api(`/restaurants/${restaurantId}/menu/featured`, init);
}

export interface MenuCategoryPayload {
  name: string;
  nameAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  position?: number;
  isActive?: boolean;
}

export function getAdminMenuCategories(
  restaurantId: string
): Promise<AdminMenuCategory[]> {
  return api(`/restaurants/${restaurantId}/menu/categories`);
}

export function createMenuCategory(
  restaurantId: string,
  payload: MenuCategoryPayload
): Promise<AdminMenuCategory> {
  return api(`/restaurants/${restaurantId}/menu/categories`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
}

export function updateMenuCategory(
  restaurantId: string,
  categoryId: string,
  payload: Partial<MenuCategoryPayload>
): Promise<AdminMenuCategory> {
  return api(
    `/restaurants/${restaurantId}/menu/categories/${encodeURIComponent(categoryId)}`,
    { method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify(payload) }
  );
}

export function deleteMenuCategory(
  restaurantId: string,
  categoryId: string
): Promise<void> {
  return api(
    `/restaurants/${restaurantId}/menu/categories/${encodeURIComponent(categoryId)}`,
    { method: "DELETE" }
  );
}

export interface MenuItemPayload {
  categoryId: string;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  /** Decimal string with at most two decimals, e.g. "28.00". */
  price: string;
  imageUrl?: string | null;
  isAvailable?: boolean;
  isFeatured?: boolean;
  preparationMinutes?: number | null;
  dietaryTags?: string[];
  allergens?: string[];
}

export interface AdminMenuItemFilters {
  categoryId?: string;
  search?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
}

export function getAdminMenuItems(
  restaurantId: string,
  filters: AdminMenuItemFilters = {}
): Promise<MenuItemWithCategory[]> {
  const query = new URLSearchParams();
  if (filters.categoryId) query.set("categoryId", filters.categoryId);
  if (filters.search) query.set("search", filters.search);
  if (filters.isAvailable !== undefined) {
    query.set("isAvailable", String(filters.isAvailable));
  }
  if (filters.isFeatured !== undefined) {
    query.set("isFeatured", String(filters.isFeatured));
  }
  const suffix = query.size > 0 ? `?${query}` : "";
  return api(`/restaurants/${restaurantId}/menu/items${suffix}`);
}

export function createMenuItem(
  restaurantId: string,
  payload: MenuItemPayload
): Promise<MenuItemWithCategory> {
  return api(`/restaurants/${restaurantId}/menu/items`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
}

export function updateMenuItem(
  restaurantId: string,
  itemId: string,
  payload: Partial<MenuItemPayload>
): Promise<MenuItemWithCategory> {
  return api(
    `/restaurants/${restaurantId}/menu/items/${encodeURIComponent(itemId)}`,
    { method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify(payload) }
  );
}

export function deleteMenuItem(
  restaurantId: string,
  itemId: string
): Promise<void> {
  return api(
    `/restaurants/${restaurantId}/menu/items/${encodeURIComponent(itemId)}`,
    { method: "DELETE" }
  );
}
