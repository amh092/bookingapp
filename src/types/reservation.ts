import type { BusinessHour } from "./restaurant";

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

/** One bookable slot from the availability endpoint. */
export interface AvailabilitySlot {
  /** UTC ISO instant the booking would start. */
  startAt: string;
  /** UTC ISO instant the booking would end. */
  endAt: string;
  /** 24h wall-clock start time in the restaurant's timezone, e.g. "17:00". */
  time: string;
  tablesLeft: number;
}

export interface Availability {
  date: string;
  guests: number;
  isOpen: boolean;
  slots: AvailabilitySlot[];
}

/** Public restaurant profile from GET /restaurants/:slug. */
export interface RestaurantProfile {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  timezone: string;
  slotDurationMinutes: number;
  bookingDurationMinutes: number;
  businessHours: BusinessHour[];
}

export interface ReservationCustomer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

export interface ReservationTable {
  id: string;
  name: string;
  section: string | null;
  capacity: number;
}

export interface ReservationRestaurant {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  timezone: string;
}

/** Admin list rows carry customer + table but no embedded restaurant. */
export type AdminReservation = Omit<Reservation, "restaurant">;

export interface Reservation {
  id: string;
  confirmationCode: string;
  guests: number;
  startAt: string;
  endAt: string;
  status: ReservationStatus;
  customerNotes: string | null;
  restaurantId: string;
  tableId: string | null;
  customerId: string;
  customer: ReservationCustomer;
  table: ReservationTable | null;
  restaurant: ReservationRestaurant;
  createdAt: string;
  updatedAt: string;
}
