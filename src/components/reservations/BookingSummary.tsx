"use client";

import { Button } from "@/components/ui/button";
import { stripLabelsOf } from "@/lib/dates";
import { hhMmToMinutes, minutesToTimeLabel } from "@/lib/format";
import type { AvailabilitySlot } from "@/types/reservation";

interface BookingSummaryProps {
  guests: number;
  dateKey: string;
  slot: AvailabilitySlot | null;
  bookingDurationMinutes: number;
  submitting: boolean;
}

function Row({
  label,
  children,
  empty = false,
}: {
  label: string;
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd
        className={
          empty ? "text-sm text-muted-foreground/70" : "text-sm font-medium"
        }
      >
        {children}
      </dd>
    </div>
  );
}

export function BookingSummary({
  guests,
  dateKey,
  slot,
  bookingDurationMinutes,
  submitting,
}: BookingSummaryProps) {
  const { dow, day, month } = stripLabelsOf(dateKey);

  return (
    <aside className="rounded-2xl border border-input bg-card p-5 lg:sticky lg:top-24">
      <h2 className="font-heading text-lg">Your reservation</h2>
      <dl className="mt-4 space-y-3">
        <Row label="Guests">{guests}</Row>
        <Row label="Date">{`${dow}, ${month} ${day}`}</Row>
        <Row label="Time" empty={!slot}>
          {slot ? minutesToTimeLabel(hhMmToMinutes(slot.time)) : "Pick a time"}
        </Row>
        <Row label="Duration">{bookingDurationMinutes} min</Row>
      </dl>
      <Button
        type="submit"
        form="booking-form"
        size="lg"
        disabled={!slot || submitting}
        className="mt-5 w-full"
      >
        {submitting ? "Confirming…" : "Confirm reservation"}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Free to cancel up to 2 hours before your booking.
      </p>
    </aside>
  );
}
