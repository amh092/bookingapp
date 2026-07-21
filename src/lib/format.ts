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
