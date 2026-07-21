/** "13:30" as minutes-from-midnight → "1:30 PM"; 1440 wraps to 12:00 AM. */
export function minutesToTimeLabel(minutes: number): string {
  const hours24 = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(mins).padStart(2, "0")} ${period}`;
}

export function formatPrice(value: number): string {
  return `${value.toLocaleString("en-US")} SAR`;
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
