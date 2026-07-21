import type { Metadata } from "next";
import Link from "next/link";

import { CancelReservationButton } from "@/components/reservations/CancelReservationButton";
import { LookupForm } from "@/components/reservations/LookupForm";
import { ReservationDetails } from "@/components/reservations/ReservationDetails";
import { StatusPill } from "@/components/reservations/StatusPill";
import { buttonVariants } from "@/components/ui/button";
import { ApiError, getReservation } from "@/lib/api";
import { RESTAURANT } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Reservation } from "@/types/reservation";

export const metadata: Metadata = {
  title: `Manage booking — ${RESTAURANT.name}`,
};

export default async function ManageReservationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  let reservation: Reservation | null = null;
  let loadError: string | null = null;
  try {
    reservation = await getReservation(code);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      loadError = `No booking matches the code "${code.toUpperCase()}".`;
    } else {
      loadError = "Could not load the booking right now — please try again.";
    }
  }

  const cancellable =
    reservation !== null &&
    (reservation.status === "PENDING" || reservation.status === "CONFIRMED");

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 md:py-14">
      <h1 className="text-[clamp(1.75rem,4vw,2.25rem)]">Manage a booking</h1>
      <p className="mt-2 text-muted-foreground">
        View your reservation details or cancel the booking.
      </p>

      <div className="mt-6">
        <LookupForm initialCode={reservation?.confirmationCode ?? code} />
      </div>

      {loadError && (
        <div className="mt-6 rounded-xl border border-dashed border-input px-4 py-8 text-center text-sm text-muted-foreground">
          <span aria-hidden className="mb-2 block text-2xl">
            🔍
          </span>
          {loadError}
        </div>
      )}

      {reservation && (
        <div className="mt-6 rounded-2xl border border-input bg-card p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-heading text-lg">
              {reservation.customer.name}
            </h2>
            <StatusPill status={reservation.status} />
          </div>
          <div className="mt-3">
            <ReservationDetails reservation={reservation} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {cancellable ? (
              <CancelReservationButton
                id={reservation.id}
                confirmationCode={reservation.confirmationCode}
              />
            ) : (
              <Link href="/reservations" className={cn(buttonVariants())}>
                Book a new table
              </Link>
            )}
          </div>
          {cancellable && (
            <p className="mt-3 text-xs text-muted-foreground">
              Need a different time? Cancel this booking and reserve again —
              online rescheduling is coming soon.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
