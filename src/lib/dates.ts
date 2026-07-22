/**
 * Calendar-date helpers for the booking flow. A "date key" is a YYYY-MM-DD
 * string naming a calendar day in the restaurant's timezone; all arithmetic
 * happens on the key itself so results never depend on the visitor's clock
 * or timezone.
 */

import type { DayOfWeek } from "@/types/restaurant";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function partsOf(dateKey: string): [number, number, number] {
  const [year, month, day] = dateKey.split("-").map(Number);
  return [year, month, day];
}

/** Today's date key in the given timezone. */
export function dateKeyInTimeZone(at: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

export function addDaysToKey(dateKey: string, days: number): string {
  const [year, month, day] = partsOf(dateKey);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday. */
export function dayOfWeekOfKey(dateKey: string): DayOfWeek {
  const [year, month, day] = partsOf(dateKey);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay() as DayOfWeek;
}

/** Deterministic short labels for the date strip, e.g. Sat / 25 / Jul. */
export function stripLabelsOf(dateKey: string): {
  dow: string;
  day: number;
  month: string;
} {
  const [, month, day] = partsOf(dateKey);
  return {
    dow: WEEKDAYS[dayOfWeekOfKey(dateKey)],
    day,
    month: MONTHS[month - 1],
  };
}

/** "2026-07-25" → "Saturday, July 25, 2026" (timezone-independent). */
export function formatDateKeyLong(dateKey: string): string {
  const [year, month, day] = partsOf(dateKey);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
