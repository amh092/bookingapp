import type { Metadata } from "next";
import Link from "next/link";

import {
  CalendarGrid,
  CalendarLegend,
  type CalendarColumn,
} from "@/components/admin/CalendarGrid";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminReservations, getAdminTables, getRestaurant } from "@/lib/api";
import {
  addDaysToKey,
  dateKeyInTimeZone,
  dayOfWeekOfKey,
  formatDateKeyLong,
  stripLabelsOf,
} from "@/lib/dates";
import { hourInZone } from "@/lib/format";
import { RESTAURANT } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type {
  AdminReservation,
  AdminTable,
  ReservationStatus,
  RestaurantProfile,
} from "@/types/reservation";

export const metadata: Metadata = {
  title: `Calendar — Staff — ${RESTAURANT.name}`,
};

type CalendarView = "day" | "week";

const STATUSES: { value: ReservationStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "COMPLETED", label: "Completed" },
  { value: "NO_SHOW", label: "No-show" },
];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** A well-formed, real calendar date or null — never trust the query string. */
function normalizeDateKey(value: string | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day));
  return probe.toISOString().slice(0, 10) === value ? value : null;
}

function weekStartOf(dateKey: string): string {
  return addDaysToKey(dateKey, -dayOfWeekOfKey(dateKey));
}

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const view: CalendarView = first(params.view) === "week" ? "week" : "day";
  const statusParam = first(params.status);
  const status = STATUSES.some((s) => s.value === statusParam)
    ? (statusParam as ReservationStatus)
    : undefined;
  const tableIdParam = first(params.tableId)?.trim() || undefined;
  const search = first(params.search)?.trim() || undefined;

  let restaurant: RestaurantProfile;
  let tables: AdminTable[];
  let reservations: AdminReservation[];
  let anchor: string;
  try {
    restaurant = await getRestaurant();
    anchor =
      normalizeDateKey(first(params.date)) ??
      dateKeyInTimeZone(new Date(), restaurant.timezone);
    const range =
      view === "day"
        ? { date: anchor }
        : { from: weekStartOf(anchor), to: addDaysToKey(weekStartOf(anchor), 6) };
    [tables, reservations] = await Promise.all([
      getAdminTables(restaurant.id),
      getAdminReservations(restaurant.id, {
        ...range,
        status,
        tableId: tableIdParam,
        search,
      }),
    ]);
  } catch {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-16 text-center">
        <p className="rounded-xl border border-dashed border-input px-4 py-8 text-sm text-muted-foreground">
          Could not reach the booking API — is it running?
        </p>
      </div>
    );
  }

  const timeZone = restaurant.timezone;
  const todayKey = dateKeyInTimeZone(new Date(), timeZone);
  const activeTables = tables.filter((table) => table.isActive);
  const hasFilters = Boolean(status || tableIdParam || search);
  const weekStart = weekStartOf(anchor);

  const hrefFor = (overrides: {
    view?: CalendarView;
    date?: string | null;
  }): string => {
    const query = new URLSearchParams();
    const nextView = overrides.view ?? view;
    if (nextView !== "day") query.set("view", nextView);
    const nextDate = "date" in overrides ? overrides.date : anchor;
    if (nextDate) query.set("date", nextDate);
    if (status) query.set("status", status);
    if (tableIdParam) query.set("tableId", tableIdParam);
    if (search) query.set("search", search);
    const suffix = query.size > 0 ? `?${query}` : "";
    return `/admin/calendar${suffix}`;
  };

  const step = view === "day" ? 1 : 7;
  const weekEnd = addDaysToKey(weekStart, 6);
  const startLabels = stripLabelsOf(weekStart);
  const endLabels = stripLabelsOf(weekEnd);
  const rangeLabel =
    view === "day"
      ? formatDateKeyLong(anchor)
      : `${startLabels.month} ${startLabels.day} – ${endLabels.month} ${endLabels.day}, ${weekEnd.slice(0, 4)}`;

  const isClosedDay = (dateKey: string) => {
    const hour = restaurant.businessHours.find(
      (h) => h.dayOfWeek === dayOfWeekOfKey(dateKey)
    );
    return !hour || hour.isClosed;
  };

  const byDay = new Map<string, AdminReservation[]>();
  for (const reservation of reservations) {
    const key = dateKeyInTimeZone(new Date(reservation.startAt), timeZone);
    byDay.set(key, [...(byDay.get(key) ?? []), reservation]);
  }

  const columnKeys =
    view === "day"
      ? [anchor]
      : Array.from({ length: 7 }, (_, i) => addDaysToKey(weekStart, i));
  const columns: CalendarColumn[] = columnKeys.map((dateKey) => {
    const labels = stripLabelsOf(dateKey);
    return {
      key: dateKey,
      title: labels.dow,
      sub: `${labels.day} ${labels.month}`,
      isToday: dateKey === todayKey,
      isClosed: isClosedDay(dateKey),
      reservations: byDay.get(dateKey) ?? [],
    };
  });

  // Hour rows span the restaurant's widest opening window, stretched to fit
  // any booking that falls outside it.
  const openHours = restaurant.businessHours.filter((hour) => !hour.isClosed);
  let firstHour = openHours.length
    ? Math.min(...openHours.map((h) => Math.floor(h.opensAtMinutes / 60)))
    : 12;
  let lastHour = openHours.length
    ? Math.max(...openHours.map((h) => Math.ceil(h.closesAtMinutes / 60)))
    : 24;
  for (const reservation of reservations) {
    const hour = hourInZone(reservation.startAt, timeZone);
    firstHour = Math.min(firstHour, hour);
    lastHour = Math.max(lastHour, hour + 1);
  }
  firstHour = Math.max(firstHour, 0);
  lastHour = Math.min(lastHour, 24);
  const hours = Array.from(
    { length: Math.max(lastHour - firstHour, 0) },
    (_, i) => firstHour + i
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-[clamp(1.5rem,3.5vw,2rem)]">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          {reservations.length}{" "}
          {reservations.length === 1 ? "booking" : "bookings"}
          {hasFilters ? " match the filters" : ""}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <nav
          aria-label="Calendar navigation"
          className="flex items-center gap-1.5"
        >
          <Link
            href={hrefFor({ date: addDaysToKey(anchor, -step) })}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <span aria-hidden>‹</span> Previous {view}
          </Link>
          <Link
            href={hrefFor({ date: null })}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Today
          </Link>
          <Link
            href={hrefFor({ date: addDaysToKey(anchor, step) })}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Next {view} <span aria-hidden>›</span>
          </Link>
        </nav>
        <p className="font-heading text-sm font-semibold">{rangeLabel}</p>
        <nav
          aria-label="Calendar view"
          className="flex items-center gap-1 rounded-full border border-input p-1 text-sm"
        >
          {(["day", "week"] as const).map((option) => (
            <Link
              key={option}
              href={hrefFor({ view: option })}
              aria-current={view === option ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-1 capitalize transition-colors",
                view === option
                  ? "bg-secondary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option}
            </Link>
          ))}
        </nav>
      </div>

      <form
        method="get"
        className="mt-4 grid items-end gap-3 rounded-2xl border border-input bg-card p-4 sm:grid-cols-[10rem_10rem_11rem_minmax(0,1fr)_auto]"
      >
        {view !== "day" && <input type="hidden" name="view" value={view} />}
        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={anchor}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="">All statuses</option>
            {STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tableId">Table</Label>
          <select
            id="tableId"
            name="tableId"
            defaultValue={tableIdParam ?? ""}
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="">All tables</option>
            {tables.map((table) => (
              <option key={table.id} value={table.id}>
                {table.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="search">Customer</Label>
          <Input
            id="search"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Name or phone"
            className="h-10"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="lg">
            Filter
          </Button>
          {hasFilters && (
            <Link
              href={hrefFor({})}
              className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <CalendarLegend />
        <p className="text-xs text-muted-foreground">
          Click any booking to open it — confirm, reschedule, reassign its
          table, or mark the guest as a no-show.
        </p>
      </div>

      <CalendarGrid
        columns={columns}
        hours={hours}
        tables={activeTables}
        timeZone={timeZone}
      />

      {reservations.length === 0 && (
        <p className="mt-4 rounded-xl border border-dashed border-input px-4 py-6 text-center text-sm text-muted-foreground">
          No reservations{hasFilters ? " match these filters" : ""} for this{" "}
          {view}.
        </p>
      )}
    </div>
  );
}
