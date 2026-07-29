import type { Metadata } from "next";
import Link from "next/link";

import { LookupForm } from "@/components/reservations/LookupForm";
import { StatusPill } from "@/components/reservations/StatusPill";
import { buttonVariants } from "@/components/ui/button";
import { lookupReservationsByPhone } from "@/lib/api";
import { formatDateInZone, formatTimeInZone } from "@/lib/format";
import { RESTAURANT } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Reservation } from "@/types/reservation";

export const metadata: Metadata = {
  title: `Manage booking — ${RESTAURANT.name}`,
};

// Mirrors the API's phone validation (see createReservationAction).
const PHONE_PATTERN = /^\+?[\d\s()-]{10,20}$/;

export default async function ManageLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const { phone } = await searchParams;
  const queryPhone = typeof phone === "string" ? phone.trim() : "";

  let reservations: Reservation[] | null = null;
  let loadError: string | null = null;
  if (queryPhone) {
    if (!PHONE_PATTERN.test(queryPhone)) {
      loadError = "That doesn't look like a phone number — please try again.";
    } else {
      try {
        reservations = await lookupReservationsByPhone(queryPhone);
      } catch {
        loadError = "Could not search bookings right now — please try again.";
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 md:py-14">
      <h1 className="text-[clamp(1.75rem,4vw,2.25rem)]">Manage a booking</h1>
      <p className="mt-2 text-muted-foreground">
        Enter your confirmation code, or find your upcoming bookings with the
        phone number you booked with.
      </p>
      <div data-tour="lookup-form" className="mt-6">
        <LookupForm initialPhone={queryPhone} />
      </div>

      {loadError && (
        <div className="mt-6 rounded-xl border border-dashed border-input px-4 py-8 text-center text-sm text-muted-foreground">
          <span aria-hidden className="mb-2 block text-2xl">
            🔍
          </span>
          {loadError}
        </div>
      )}

      {reservations && reservations.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-input px-4 py-8 text-center text-sm text-muted-foreground">
          <span aria-hidden className="mb-2 block text-2xl">
            🔍
          </span>
          No upcoming bookings for this phone number. Past bookings can be
          opened with their confirmation code.
        </div>
      )}

      {reservations && reservations.length > 0 && (
        <section aria-label="Your upcoming bookings" className="mt-6">
          <h2 className="font-heading text-lg">
            {reservations.length === 1
              ? "1 upcoming booking"
              : `${reservations.length} upcoming bookings`}
          </h2>
          <ul className="mt-3 space-y-4">
            {reservations.map((reservation) => {
              const timeZone = reservation.restaurant.timezone;
              return (
                <li
                  key={reservation.id}
                  className="rounded-2xl border border-input bg-card p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-heading text-base">
                      {formatDateInZone(reservation.startAt, timeZone)}
                    </h3>
                    <StatusPill status={reservation.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatTimeInZone(reservation.startAt, timeZone)} –{" "}
                    {formatTimeInZone(reservation.endAt, timeZone)} ·{" "}
                    {reservation.guests}{" "}
                    {reservation.guests === 1 ? "guest" : "guests"} · code{" "}
                    <span className="font-mono tracking-widest text-primary">
                      {reservation.confirmationCode}
                    </span>
                  </p>
                  <div className="mt-4">
                    <Link
                      href={`/reservations/manage/${reservation.confirmationCode}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" })
                      )}
                    >
                      View or cancel
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
