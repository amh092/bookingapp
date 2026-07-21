"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  ApiError,
  cancelReservation,
  createReservation,
  getAvailability,
} from "@/lib/api";
import type { Availability } from "@/types/reservation";

const GENERIC_ERROR = "Something went wrong — please try again.";

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : GENERIC_ERROR;
}

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const availabilityInput = z.object({
  restaurantId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1).max(10),
});

export async function getAvailabilityAction(
  input: z.infer<typeof availabilityInput>
): Promise<ActionResult<Availability>> {
  const parsed = availabilityInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid availability request." };
  }

  try {
    const { restaurantId, date, guests } = parsed.data;
    return { success: true, data: await getAvailability(restaurantId, date, guests) };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

const bookingInput = z.object({
  restaurantId: z.string().min(1, "Missing restaurant."),
  guests: z.coerce.number().int().min(1).max(10),
  startAt: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Pick a time first."),
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(80, "Name is too long."),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{7,20}$/, "Please enter a valid phone number."),
  email: z.email("Please enter a valid email address."),
  customerNotes: z
    .string()
    .trim()
    .max(500, "Notes are limited to 500 characters.")
    .optional(),
});

export type BookingField = "name" | "phone" | "email" | "customerNotes";

export interface BookingFormState {
  error?: string;
  fieldErrors?: Partial<Record<BookingField, string>>;
}

export async function createReservationAction(
  _prevState: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const parsed = bookingInput.safeParse({
    restaurantId: formData.get("restaurantId"),
    guests: formData.get("guests"),
    startAt: formData.get("startAt"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    customerNotes: formData.get("customerNotes") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: BookingFormState["fieldErrors"] = {};
    let error: string | undefined;
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (
        field === "name" ||
        field === "phone" ||
        field === "email" ||
        field === "customerNotes"
      ) {
        fieldErrors[field] ??= issue.message;
      } else {
        error ??= issue.message;
      }
    }
    return { error, fieldErrors };
  }

  let confirmationCode: string;
  try {
    const reservation = await createReservation({
      ...parsed.data,
      customerNotes: parsed.data.customerNotes || undefined,
    });
    confirmationCode = reservation.confirmationCode;
  } catch (error) {
    return { error: errorMessage(error) };
  }

  redirect(`/reservations/confirmation/${confirmationCode}`);
}

export async function cancelReservationAction(
  id: string,
  confirmationCode: string
): Promise<ActionResult<null>> {
  try {
    await cancelReservation(id);
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }

  revalidatePath(`/reservations/manage/${confirmationCode}`);
  revalidatePath(`/reservations/confirmation/${confirmationCode}`);
  return { success: true };
}
