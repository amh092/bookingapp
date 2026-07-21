"use client";

import { useSyncExternalStore } from "react";

import { minutesToTimeLabel } from "@/lib/format";
import { BUSINESS_HOURS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const emptySubscribe = () => () => {};

export function HoursList() {
  // The page is prerendered, so the server can't know the visitor's weekday;
  // render without a highlight there and resolve it on the client.
  const today = useSyncExternalStore<number | null>(
    emptySubscribe,
    () => new Date().getDay(),
    () => null
  );

  return (
    <div className="mt-4 grid">
      {BUSINESS_HOURS.map((hours) => (
        <div
          key={hours.dayOfWeek}
          className={cn(
            "flex items-center justify-between gap-4 rounded-lg px-3.5 py-2.5 text-[0.9375rem]",
            hours.dayOfWeek === today && "bg-primary/15 font-semibold",
            hours.isClosed && "text-muted-foreground/75"
          )}
        >
          <span>{DAY_NAMES[hours.dayOfWeek]}</span>
          <span className={hours.isClosed ? "text-muted-foreground" : undefined}>
            {hours.isClosed
              ? "Closed"
              : `${minutesToTimeLabel(hours.opensAtMinutes)} – ${minutesToTimeLabel(hours.closesAtMinutes)}`}
          </span>
        </div>
      ))}
    </div>
  );
}
