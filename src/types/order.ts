/**
 * Order shapes as booking-api returns them. Money travels as two-decimal
 * strings ("93.75") in both directions so no precision is lost to floats.
 */

export type OrderType = "PICKUP" | "DELIVERY";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED";

export interface OrderCustomer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

/** Dish summary embedded in each order line. */
export interface OrderMenuItem {
  id: string;
  name: string;
  nameAr: string | null;
  imageUrl: string | null;
}

export interface OrderItem {
  id: string;
  quantity: number;
  /** Price of one unit when the order was placed, e.g. "28.50". */
  unitPrice: string;
  notes: string | null;
  menuItemId: string;
  menuItem: OrderMenuItem;
}

export interface OrderRestaurant {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  timezone: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  /** Two-decimal strings, e.g. "93.75". */
  subtotal: string;
  deliveryFee: string;
  total: string;
  notes: string | null;
  address: string | null;
  restaurantId: string;
  customerId: string;
  customer: OrderCustomer;
  items: OrderItem[];
  restaurant: OrderRestaurant;
  createdAt: string;
  updatedAt: string;
}

/** Admin list rows carry customer + items but no embedded restaurant. */
export type AdminOrder = Omit<Order, "restaurant">;
