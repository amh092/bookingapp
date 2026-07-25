"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  ApiError,
  assignReservationTable,
  cancelReservation,
  completeReservation,
  confirmReservation,
  createReservation,
  getAvailability,
  noShowReservation,
  rescheduleReservation,
} from "@/lib/api";
import type { Availability } from "@/types/reservation";

const GENERIC_ERROR = "Something went wrong — please try again.";

function errorMessage(error: unknown): string {
  // Let Next.js control-flow errors (e.g. the redirect authHeaders() throws
  // when the session is gone) propagate instead of becoming a toast.
  unstable_rethrow(error);
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
  // The API's ceiling — staff reschedules must cover any booking size.
  guests: z.number().int().min(1).max(50),
  excludeReservationId: z.string().min(1).optional(),
});

export async function getAvailabilityAction(
  input: z.infer<typeof availabilityInput>
): Promise<ActionResult<Availability>> {
  const parsed = availabilityInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid availability request." };
  }

  try {
    const { restaurantId, date, guests, excludeReservationId } = parsed.data;
    return {
      success: true,
      data: await getAvailability(
        restaurantId,
        date,
        guests,
        excludeReservationId
      ),
    };
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
    .regex(/^\+?[\d\s()-]{10,20}$/, "Please enter a valid phone number."),
  email: z 
  .email("Please enter a valid email address.") 
  .optional(),
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
    email: formData.get("email") || undefined,
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
      customerNotes: parsed.data.customerNotes  || undefined,
      email: parsed.data.email || undefined,
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

export type AdminReservationCommand =
  | "confirm"
  | "cancel"
  | "complete"
  | "no-show";

const ADMIN_COMMANDS: Record<
  AdminReservationCommand,
  (id: string) => Promise<unknown>
> = {
  confirm: confirmReservation,
  cancel: cancelReservation,
  complete: completeReservation,
  "no-show": noShowReservation,
};

export async function adminReservationAction(
  id: string,
  command: AdminReservationCommand
): Promise<ActionResult<null>> {
  const run = ADMIN_COMMANDS[command];
  if (!run) return { success: false, error: "Unknown action." };

  try {
    await run(id);
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }

  revalidateAdminReservations();
  return { success: true };
}

const rescheduleInput = z.object({
  id: z.string().min(1),
  startAt: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Pick a time first."),
});

export async function rescheduleReservationAction(
  input: z.infer<typeof rescheduleInput>
): Promise<ActionResult<null>> {
  const parsed = rescheduleInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid reschedule request." };
  }

  try {
    await rescheduleReservation(parsed.data.id, parsed.data.startAt);
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }

  revalidateAdminReservations();
  return { success: true };
}

const assignTableInput = z.object({
  id: z.string().min(1),
  tableId: z.string().min(1),
});

export async function assignTableAction(
  input: z.infer<typeof assignTableInput>
): Promise<ActionResult<null>> {
  const parsed = assignTableInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid table assignment." };
  }

  try {
    await assignReservationTable(parsed.data.id, parsed.data.tableId);
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }

  revalidateAdminReservations();
  return { success: true };
}

function revalidateAdminReservations() {
  revalidatePath("/admin/reservations");
  revalidatePath("/admin/calendar");
}
