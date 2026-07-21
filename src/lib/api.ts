import type {
  AdminReservation,
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
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? response.statusText);
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}

export function getRestaurant(): Promise<RestaurantProfile> {
  return api(`/restaurants/${RESTAURANT_SLUG}`);
}

export function getAvailability(
  restaurantId: string,
  date: string,
  guests: number
): Promise<Availability> {
  const query = new URLSearchParams({ date, guests: String(guests) });
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
  email: string;
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

export interface AdminReservationFilters {
  date?: string;
  status?: ReservationStatus;
  search?: string;
}

export function getAdminReservations(
  restaurantId: string,
  filters: AdminReservationFilters
): Promise<AdminReservation[]> {
  const query = new URLSearchParams();
  if (filters.date) query.set("date", filters.date);
  if (filters.status) query.set("status", filters.status);
  if (filters.search) query.set("search", filters.search);
  const suffix = query.size > 0 ? `?${query}` : "";
  return api(`/restaurants/${restaurantId}/reservations${suffix}`);
}
