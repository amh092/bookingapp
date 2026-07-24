"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ApiError, createOrder, getRestaurant, updateOrderStatus } from "@/lib/api";
import type { OrderStatus } from "@/types/order";

const GENERIC_ERROR = "Something went wrong — please try again.";

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : GENERIC_ERROR;
}

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type CheckoutField = "name" | "phone" | "email" | "notes";

export interface CheckoutResult {
  success: boolean;
  /** Set on success — the client clears the cart and navigates here. */
  orderNumber?: string;
  /** API-confirmed total, recorded in the device's recent-orders list. */
  total?: string;
  error?: string;
  fieldErrors?: Partial<Record<CheckoutField, string>>;
}

const checkoutInput = z.object({
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
        notes: z.string().trim().max(200).optional(),
      })
    )
    .min(1, "Your cart is empty — add a dish first.")
    .max(50, "That's too many lines for one order."),
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(80, "Name is too long."),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{10,20}$/, "Please enter a valid phone number."),
  email: z.email("Please enter a valid email address.").optional(),
  notes: z
    .string()
    .trim()
    .max(500, "Notes are limited to 500 characters.")
    .optional(),
});

export type CheckoutInput = z.infer<typeof checkoutInput>;

export async function createOrderAction(
  input: CheckoutInput
): Promise<CheckoutResult> {
  const parsed = checkoutInput.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: CheckoutResult["fieldErrors"] = {};
    let error: string | undefined;
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (
        field === "name" ||
        field === "phone" ||
        field === "email" ||
        field === "notes"
      ) {
        fieldErrors[field] ??= issue.message;
      } else {
        error ??= issue.message;
      }
    }
    return { success: false, error, fieldErrors };
  }

  try {
    const restaurant = await getRestaurant();
    const order = await createOrder({
      restaurantId: restaurant.id,
      type: "PICKUP",
      items: parsed.data.items.map((line) => ({
        menuItemId: line.menuItemId,
        quantity: line.quantity,
        notes: line.notes || undefined,
      })),
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || undefined,
      notes: parsed.data.notes || undefined,
    });
    return { success: true, orderNumber: order.orderNumber, total: order.total };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED",
];

export async function updateOrderStatusAction(
  id: string,
  status: OrderStatus
): Promise<ActionResult<null>> {
  if (!id || !ORDER_STATUSES.includes(status)) {
    return { success: false, error: "Invalid order update." };
  }

  try {
    await updateOrderStatus(id, status);
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }

  revalidatePath("/admin/orders");
  return { success: true };
}
