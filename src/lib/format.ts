/** "13:30" as minutes-from-midnight → "1:30 PM"; 1440 wraps to 12:00 AM. */
export function minutesToTimeLabel(minutes: number): string {
  const hours24 = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(mins).padStart(2, "0")} ${period}`;
}

/** A decimal-string price from the API ("28.00", "28.50") → "28 SAR", "28.5 SAR". */
export function formatMenuPrice(price: string): string {
  const value = Number(price);
  if (Number.isNaN(value)) return `${price} SAR`;
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })} SAR`;
}

/** "28.50" → 2850. Money math happens in whole cents so floats cannot drift. */
export function priceToCents(price: string): number {
  const value = Number(price);
  return Number.isNaN(value) ? 0 : Math.round(value * 100);
}

/** 2850 → "28.5 SAR", matching the menu price style. */
export function formatCents(cents: number): string {
  return `${(cents / 100).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })} SAR`;
}

/** "17:00" → minutes-from-midnight (1020). */
export function hhMmToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/** A UTC ISO instant rendered as a 12h time in the given timezone. */
export function formatTimeInZone(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Hour of day (0–23) of a UTC ISO instant in the given timezone. */
export function hourInZone(iso: string, timeZone: string): number {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date(iso))
  );
}

/** A UTC ISO instant rendered as a short date in the given timezone, e.g. "Jul 23". */
export function formatShortDateInZone(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

/** A UTC ISO instant rendered as a long date in the given timezone. */
export function formatDateInZone(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}
