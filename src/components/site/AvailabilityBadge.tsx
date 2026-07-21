"use client";

import { useSyncExternalStore } from "react";

import { BUSINESS_HOURS, RESTAURANT } from "@/lib/mock-data";

const EVENING_START_MINUTES = 17 * 60;

/**
 * Estimates tonight's open slots from opening hours and the clock only.
 * The real availability engine (tables, overlaps) arrives with the
 * reservation feature.
 */
function tonightLabel(now: Date): string {
  const hours = BUSINESS_HOURS.find((h) => h.dayOfWeek === now.getDay());
  if (!hours || hours.isClosed) return "Closed today — book for tomorrow";

  const lastStart = hours.closesAtMinutes - RESTAURANT.bookingDurationMinutes;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  let open = 0;
  for (
    let m = Math.max(hours.opensAtMinutes, EVENING_START_MINUTES);
    m <= lastStart;
    m += RESTAURANT.slotDurationMinutes
  ) {
    if (m > nowMinutes) open += 1;
  }

  if (open === 0) return "Fully booked tonight — book for tomorrow";
  return `${open} time${open === 1 ? "" : "s"} open tonight`;
}

const emptySubscribe = () => () => {};

export function AvailabilityBadge() {
  // Depends on the visitor's clock, so it can only resolve on the client.
  const label = useSyncExternalStore(
    emptySubscribe,
    () => tonightLabel(new Date()),
    () => "Checking tonight's availability…"
  );

  return (
    <div
      role="status"
      className="absolute bottom-4 left-4 z-10 flex items-center gap-2.5 rounded-xl border border-input bg-background/80 px-3.5 py-2.5 text-[0.8125rem] backdrop-blur-sm"
    >
      <span aria-hidden className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      {label}
    </div>
  );
}
