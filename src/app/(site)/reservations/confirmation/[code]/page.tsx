import type { Metadata } from "next";
import Link from "next/link";

import { ReservationDetails } from "@/components/reservations/ReservationDetails";
import { buttonVariants } from "@/components/ui/button";
import { ApiError, getReservation } from "@/lib/api";
import { RESTAURANT } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Reservation } from "@/types/reservation";

export const metadata: Metadata = {
  title: `Booking confirmed — ${RESTAURANT.name}`,
};

function NotFoundBlock({ code }: { code: string }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-16 text-center">
      <h1 className="text-[clamp(1.75rem,4vw,2.25rem)]">Booking not found</h1>
      <p className="mt-4 rounded-xl border border-dashed border-input px-4 py-8 text-sm text-muted-foreground">
        <span aria-hidden className="mb-2 block text-2xl">
          🔍
        </span>
        No reservation matches the code{" "}
        <span className="font-mono uppercase">{code}</span>. Double-check the
        code from your confirmation.
      </p>
      <Link
        href="/reservations/manage"
        className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
      >
        Look up a booking
      </Link>
    </div>
  );
}

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  let reservation: Reservation;
  try {
    reservation = await getReservation(code);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return <NotFoundBlock code={code} />;
    }
    throw error;
  }

  const cancelled = reservation.status === "CANCELLED";

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 md:py-14">
      <div className="text-center">
        <span
          aria-hidden
          className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/15 text-2xl text-primary animate-in zoom-in-50 duration-300"
        >
          ✓
        </span>
        <h1 className="mt-4 text-[clamp(1.75rem,4vw,2.25rem)]">
          {cancelled ? "This booking was cancelled" : "Your table is booked"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {cancelled
            ? "You can reserve a new table any time."
            : reservation.customer.email
              ? `Save your confirmation code — we've also emailed it to ${reservation.customer.email}.`
              : "Save your confirmation code — you'll need it to manage the booking."}
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-primary/40 bg-card px-5 py-4 text-center">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">
          Confirmation code
        </p>
        <p className="mt-1 font-mono text-2xl font-semibold tracking-[0.3em] text-primary">
          {reservation.confirmationCode}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-input bg-card p-5">
        <ReservationDetails reservation={reservation} />
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {cancelled ? (
          <Link href="/reservations" className={cn(buttonVariants())}>
            Book a new table
          </Link>
        ) : (
          <Link
            href={`/reservations/manage/${reservation.confirmationCode}`}
            className={cn(buttonVariants())}
          >
            Manage this booking
          </Link>
        )}
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          Back home
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-input bg-card p-5 text-sm">
        <p className="font-medium">📍 {reservation.restaurant.name}</p>
        {reservation.restaurant.address && (
          <p className="mt-1 text-muted-foreground">
            {reservation.restaurant.address}
          </p>
        )}
        {reservation.restaurant.phone && (
          <p className="mt-1 text-muted-foreground">
            {reservation.restaurant.phone}
          </p>
        )}
      </div>
    </div>
  );
}
