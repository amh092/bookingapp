import type { Metadata } from "next";

import { BookingFlow } from "@/components/reservations/BookingFlow";
import type { StripDay } from "@/components/reservations/DateStrip";
import { ApiError, getAvailability, getRestaurant } from "@/lib/api";
import {
  addDaysToKey,
  dateKeyInTimeZone,
  dayOfWeekOfKey,
  stripLabelsOf,
} from "@/lib/dates";
import { RESTAURANT } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: `Reserve a table — ${RESTAURANT.name}`,
  description: "Pick a date, choose an available time and book your table.",
};

const STRIP_DAYS = 14;
const DEFAULT_GUESTS = 2;

export default async function ReservationsPage() {
  let restaurant;
  try {
    restaurant = await getRestaurant();
  } catch {
    return (
      <div className="mx-auto w-full max-w-2xl px-5 py-16 text-center">
        <h1 className="text-[clamp(1.75rem,4vw,2.25rem)]">Reserve a table</h1>
        <p className="mt-4 rounded-xl border border-dashed border-input px-4 py-8 text-sm text-muted-foreground">
          Online booking is unavailable right now — please try again in a few
          minutes or call us at {RESTAURANT.phone}.
        </p>
      </div>
    );
  }

  const todayKey = dateKeyInTimeZone(new Date(), restaurant.timezone);
  const closedDays = new Set(
    restaurant.businessHours
      .filter((hour) => hour.isClosed)
      .map((hour) => hour.dayOfWeek)
  );

  const days: StripDay[] = Array.from({ length: STRIP_DAYS }, (_, offset) => {
    const dateKey = addDaysToKey(todayKey, offset);
    return {
      dateKey,
      ...stripLabelsOf(dateKey),
      isToday: offset === 0,
      isClosed: closedDays.has(dayOfWeekOfKey(dateKey)),
    };
  });

  // Preselect the first day the restaurant is actually open.
  const initialDateKey = (days.find((day) => !day.isClosed) ?? days[0]).dateKey;

  let initialAvailability = null;
  let initialError: string | null = null;
  try {
    initialAvailability = await getAvailability(
      restaurant.id,
      initialDateKey,
      DEFAULT_GUESTS
    );
  } catch (error) {
    initialError =
      error instanceof ApiError
        ? error.message
        : "Could not load available times.";
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 md:py-14">
      <header className="max-w-2xl">
        <h1 className="text-[clamp(1.75rem,4vw,2.5rem)]">Reserve a table</h1>
        <p className="mt-2 text-muted-foreground">
          Pick a date and time and we&apos;ll hold your table for{" "}
          {`${restaurant.bookingDurationMinutes} minutes`}. You&apos;ll get a
          confirmation code right away.
        </p>
      </header>
      <div className="mt-8">
        <BookingFlow
          restaurantId={restaurant.id}
          days={days}
          maxGuests={RESTAURANT.maxGuestsOnline}
          bookingDurationMinutes={restaurant.bookingDurationMinutes}
          initialDateKey={initialDateKey}
          initialAvailability={initialAvailability}
          initialError={initialError}
        />
      </div>
    </div>
  );
}
