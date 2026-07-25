import type {
  AdminMenuCategory,
  MenuItemWithCategory,
  PublicMenuCategory,
} from "@/types/menu";
import type {
  AdminOrder,
  Order,
  OrderStatus,
  OrderType,
} from "@/types/order";
import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

/**
 * Bearer header for the authenticated staff member, read from the encrypted
 * NextAuth session cookie. Server-only. Redirects to /admin/login when there
 * is no usable token (never signed in, or the refresh chain broke) — callers
 * are admin server components and actions, so a bounce is the right outcome.
 */
async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken({
    req: { headers: await headers() },
    secret: process.env.AUTH_SECRET,
    // Cookie name matches what Auth.js sets: `__Secure-` prefixed in production.
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token?.accessToken || token.error === "RefreshTokenError") {
    redirect("/admin/login");
  }

  return { Authorization: `Bearer ${token.accessToken}` };
}

/** GET an admin resource with the staff Bearer attached. */
async function adminGet<T>(path: string): Promise<T> {
  return api<T>(path, { headers: await authHeaders() });
}

/** Mutate an admin resource with the staff Bearer (and a JSON body if given). */
async function adminMutate<T>(
  path: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown
): Promise<T> {
  const auth = await authHeaders();
  return api<T>(path, {
    method,
    headers: body === undefined ? auth : { ...auth, ...JSON_HEADERS },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
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

/** Upcoming pending/confirmed reservations booked with this phone number. */
export function lookupReservationsByPhone(
  phone: string
): Promise<Reservation[]> {
  const query = new URLSearchParams({ phone });
  return api(`/reservations/lookup?${query}`);
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
  return adminMutate(`/reservations/${encodeURIComponent(id)}/confirm`, "PATCH");
}

export function completeReservation(id: string): Promise<Reservation> {
  return adminMutate(
    `/reservations/${encodeURIComponent(id)}/complete`,
    "PATCH"
  );
}

export function noShowReservation(id: string): Promise<Reservation> {
  return adminMutate(`/reservations/${encodeURIComponent(id)}/no-show`, "PATCH");
}

export function rescheduleReservation(
  id: string,
  startAt: string
): Promise<Reservation> {
  return adminMutate(
    `/reservations/${encodeURIComponent(id)}/reschedule`,
    "PATCH",
    { startAt }
  );
}

export function assignReservationTable(
  id: string,
  tableId: string
): Promise<Reservation> {
  return adminMutate(`/reservations/${encodeURIComponent(id)}/table`, "PATCH", {
    tableId,
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
  return adminGet(`/restaurants/${restaurantId}/reservations${suffix}`);
}

export function getAdminTables(restaurantId: string): Promise<AdminTable[]> {
  return adminGet(`/restaurants/${restaurantId}/tables`);
}

/* ------------------------------------------------------------- menu ----- */

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
  return adminGet(`/restaurants/${restaurantId}/menu/categories`);
}

export function createMenuCategory(
  restaurantId: string,
  payload: MenuCategoryPayload
): Promise<AdminMenuCategory> {
  return adminMutate(
    `/restaurants/${restaurantId}/menu/categories`,
    "POST",
    payload
  );
}

export function updateMenuCategory(
  restaurantId: string,
  categoryId: string,
  payload: Partial<MenuCategoryPayload>
): Promise<AdminMenuCategory> {
  return adminMutate(
    `/restaurants/${restaurantId}/menu/categories/${encodeURIComponent(categoryId)}`,
    "PATCH",
    payload
  );
}

export function deleteMenuCategory(
  restaurantId: string,
  categoryId: string
): Promise<void> {
  return adminMutate(
    `/restaurants/${restaurantId}/menu/categories/${encodeURIComponent(categoryId)}`,
    "DELETE"
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
  return adminGet(`/restaurants/${restaurantId}/menu/items${suffix}`);
}

export function createMenuItem(
  restaurantId: string,
  payload: MenuItemPayload
): Promise<MenuItemWithCategory> {
  return adminMutate(
    `/restaurants/${restaurantId}/menu/items`,
    "POST",
    payload
  );
}

export function updateMenuItem(
  restaurantId: string,
  itemId: string,
  payload: Partial<MenuItemPayload>
): Promise<MenuItemWithCategory> {
  return adminMutate(
    `/restaurants/${restaurantId}/menu/items/${encodeURIComponent(itemId)}`,
    "PATCH",
    payload
  );
}

export function deleteMenuItem(
  restaurantId: string,
  itemId: string
): Promise<void> {
  return adminMutate(
    `/restaurants/${restaurantId}/menu/items/${encodeURIComponent(itemId)}`,
    "DELETE"
  );
}

/* ------------------------------------------------------------ orders ----- */

export interface OrderLinePayload {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

export interface CreateOrderPayload {
  restaurantId: string;
  /** Only "PICKUP" until the delivery feature ships. */
  type: OrderType;
  items: OrderLinePayload[];
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return api(`/orders`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
}

export function getOrder(orderNumber: string): Promise<Order> {
  return api(`/orders/${encodeURIComponent(orderNumber)}`);
}

/** In-flight (not completed/cancelled) orders placed with this phone number. */
export function lookupOrdersByPhone(phone: string): Promise<Order[]> {
  const query = new URLSearchParams({ phone });
  return api(`/orders/lookup?${query}`);
}

export interface AdminOrderFilters {
  date?: string;
  status?: OrderStatus;
  type?: OrderType;
  search?: string;
}

export function getAdminOrders(
  restaurantId: string,
  filters: AdminOrderFilters = {}
): Promise<AdminOrder[]> {
  const query = new URLSearchParams();
  if (filters.date) query.set("date", filters.date);
  if (filters.status) query.set("status", filters.status);
  if (filters.type) query.set("type", filters.type);
  if (filters.search) query.set("search", filters.search);
  const suffix = query.size > 0 ? `?${query}` : "";
  return adminGet(`/restaurants/${restaurantId}/orders${suffix}`);
}

export function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order> {
  return adminMutate(`/orders/${encodeURIComponent(id)}/status`, "PATCH", {
    status,
  });
}
