import type { Metadata } from "next";
import Link from "next/link";

import { ReservationActions } from "@/components/admin/ReservationActions";
import { ReservationDetailsDialog } from "@/components/admin/ReservationDetailsDialog";
import { StatusPill } from "@/components/reservations/StatusPill";
import { buttonVariants } from "@/components/ui/button";
import { getAdminReservations, getAdminTables, getRestaurant } from "@/lib/api";
import {
  addDaysToKey,
  dateKeyInTimeZone,
  formatDateKeyLong,
} from "@/lib/dates";
import {
  formatShortDateInZone,
  formatTimeInZone,
  hourInZone,
  minutesToTimeLabel,
} from "@/lib/format";
import { RESTAURANT } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { AdminReservation, AdminTable } from "@/types/reservation";

export const metadata: Metadata = {
  title: `Dashboard — Staff — ${RESTAURANT.name}`,
};

const NO_SHOW_WINDOW_DAYS = 30;
const PENDING_PREVIEW_COUNT = 4;
const UPCOMING_PREVIEW_COUNT = 8;

function byStartAt(a: AdminReservation, b: AdminReservation): number {
  return a.startAt.localeCompare(b.startAt);
}

function guestsLabel(count: number): string {
  return `${count} ${count === 1 ? "guest" : "guests"}`;
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-input bg-card p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-heading text-2xl font-semibold">{value}</dd>
      {hint && <dd className="mt-0.5 text-xs text-muted-foreground">{hint}</dd>}
    </div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-input bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-input px-4 py-3 sm:px-5">
        <h2 className="font-heading text-base font-semibold">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

export default async function AdminDashboardPage() {
  let timeZone: string;
  let requestedAt: Date;
  let todayKey: string;
  let today: AdminReservation[];
  let pendingAll: AdminReservation[];
  let week: AdminReservation[];
  let past: AdminReservation[];
  let tables: AdminTable[];
  try {
    const restaurant = await getRestaurant();
    timeZone = restaurant.timezone;
    requestedAt = new Date();
    todayKey = dateKeyInTimeZone(requestedAt, timeZone);
    [today, pendingAll, week, past, tables] = await Promise.all([
      getAdminReservations(restaurant.id, { date: todayKey }),
      getAdminReservations(restaurant.id, { status: "PENDING" }),
      getAdminReservations(restaurant.id, {
        from: todayKey,
        to: addDaysToKey(todayKey, 7),
      }),
      getAdminReservations(restaurant.id, {
        from: addDaysToKey(todayKey, -NO_SHOW_WINDOW_DAYS),
        to: todayKey,
      }),
      getAdminTables(restaurant.id),
    ]);
  } catch {
    return (
      <div className="mx-auto w-full max-w-4xl px-5 py-16 text-center">
        <p className="rounded-xl border border-dashed border-input px-4 py-8 text-sm text-muted-foreground">
          Could not reach the booking API — is it running?
        </p>
      </div>
    );
  }

  const activeTables = tables.filter((table) => table.isActive);
  const seats = activeTables.reduce((sum, table) => sum + table.capacity, 0);

  const confirmedToday = today.filter((r) => r.status === "CONFIRMED").length;
  const pendingToday = today.filter((r) => r.status === "PENDING").length;
  const cancelledToday = today.filter((r) => r.status === "CANCELLED").length;

  // "Expected" excludes bookings that never happen(ed); completed ones still
  // brought guests through the door today.
  const expectedToday = today.filter(
    (r) => r.status !== "CANCELLED" && r.status !== "NO_SHOW"
  );
  const guestsToday = expectedToday.reduce((sum, r) => sum + r.guests, 0);

  const finished = past.filter(
    (r) => r.status === "COMPLETED" || r.status === "NO_SHOW"
  );
  const noShows = finished.filter((r) => r.status === "NO_SHOW").length;
  const noShowRate =
    finished.length > 0 ? Math.round((noShows / finished.length) * 100) : null;

  const timeline = today
    .filter((r) => r.status !== "CANCELLED")
    .sort(byStartAt);

  const pending = [...pendingAll].sort(byStartAt);
  const pendingPreview = pending.slice(0, PENDING_PREVIEW_COUNT);

  const now = requestedAt.getTime();
  const upcoming = week
    .filter(
      (r) =>
        (r.status === "PENDING" || r.status === "CONFIRMED") &&
        Date.parse(r.startAt) >= now
    )
    .sort(byStartAt)
    .slice(0, UPCOMING_PREVIEW_COUNT);

  const peakHours = new Map<number, number>();
  for (const reservation of expectedToday) {
    const hour = hourInZone(reservation.startAt, timeZone);
    peakHours.set(hour, (peakHours.get(hour) ?? 0) + reservation.guests);
  }
  const peaks = [...peakHours.entries()]
    .sort(([a], [b]) => a - b)
    .map(([hour, guests]) => ({
      label: minutesToTimeLabel(hour * 60),
      guests,
    }));
  const peakMax = Math.max(1, ...peaks.map((peak) => peak.guests));

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-[clamp(1.5rem,3.5vw,2rem)]">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {formatDateKeyLong(todayKey)}
        </p>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="Reservations today" value={today.length} />
        <Stat
          label="Confirmed"
          value={confirmedToday}
          hint={`${pendingToday} awaiting review`}
        />
        <Stat
          label="Pending"
          value={pendingToday}
          hint={`${pending.length} open in total`}
        />
        <Stat label="Cancellations" value={cancelledToday} />
        <Stat
          label="Guests expected"
          value={guestsToday}
          hint={`${seats} active seats`}
        />
        <Stat
          label="No-show rate"
          value={noShowRate === null ? "—" : `${noShowRate}%`}
          hint={
            noShowRate === null
              ? `No finished bookings in ${NO_SHOW_WINDOW_DAYS} days`
              : `${noShows} of ${finished.length} finished · ${NO_SHOW_WINDOW_DAYS} days`
          }
        />
      </dl>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
        <Panel
          title={"Today's service"}
          action={
            <Link
              href="/admin/calendar"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Open calendar
            </Link>
          }
        >
          <div className="p-4 sm:p-5">
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing on the books for today yet.
              </p>
            ) : (
              <ol className="space-y-1.5">
                {timeline.map((reservation) => (
                  <li key={reservation.id} className="flex gap-3">
                    <span className="w-16 shrink-0 pt-2.5 text-right text-xs text-muted-foreground tabular-nums">
                      {formatTimeInZone(reservation.startAt, timeZone)}
                    </span>
                    <ReservationDetailsDialog
                      reservation={reservation}
                      tables={activeTables}
                      timeZone={timeZone}
                      isPast={Date.parse(reservation.endAt) < now}
                      hasStarted={Date.parse(reservation.startAt) <= now}
                      triggerClassName="min-w-0 flex-1 rounded-r-xl border-l-2 border-input p-2 pl-3 hover:bg-secondary/40"
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">
                          {reservation.customer.name}
                        </span>
                        <StatusPill status={reservation.status} />
                      </span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {guestsLabel(reservation.guests)} ·{" "}
                        {reservation.table?.name ?? "Unassigned"}
                        {reservation.customerNotes && (
                          <> · &ldquo;{reservation.customerNotes}&rdquo;</>
                        )}
                      </span>
                    </ReservationDetailsDialog>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </Panel>

        <div className="grid gap-6">
          <Panel
            title="Pending requests"
            action={
              <span className="rounded-full bg-yellow-500/15 px-2.5 py-1 text-xs font-semibold text-yellow-700 dark:text-yellow-400">
                {pending.length}
              </span>
            }
          >
            <div className="space-y-3 p-4 sm:p-5">
              {pending.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  All caught up 🎉
                </p>
              ) : (
                <>
                  {pendingPreview.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="rounded-xl border border-input p-3"
                    >
                      <ReservationDetailsDialog
                        reservation={reservation}
                        tables={activeTables}
                        timeZone={timeZone}
                        isPast={Date.parse(reservation.endAt) < now}
                        hasStarted={Date.parse(reservation.startAt) <= now}
                        triggerClassName="-m-1 w-auto rounded-lg p-1 hover:bg-secondary/40"
                      >
                        <span className="flex flex-wrap items-baseline justify-between gap-x-2">
                          <span className="text-sm font-medium">
                            {reservation.customer.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatShortDateInZone(
                              reservation.startAt,
                              timeZone
                            )}{" "}
                            · {formatTimeInZone(reservation.startAt, timeZone)}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {guestsLabel(reservation.guests)} ·{" "}
                          {reservation.customer.phone}
                        </span>
                      </ReservationDetailsDialog>
                      <div className="mt-2">
                        <ReservationActions
                          id={reservation.id}
                          status={reservation.status}
                          customerName={reservation.customer.name}
                          isPast={Date.parse(reservation.endAt) < now}
                          hasStarted={Date.parse(reservation.startAt) <= now}
                        />
                      </div>
                    </div>
                  ))}
                  {pending.length > PENDING_PREVIEW_COUNT && (
                    <Link
                      href="/admin/reservations?status=PENDING"
                      className="block text-sm text-primary hover:underline"
                    >
                      View all {pending.length} pending
                    </Link>
                  )}
                </>
              )}
            </div>
          </Panel>

          <Panel title="Peak times">
            <div className="space-y-3 p-4 sm:p-5">
              {peaks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No bookings today yet.
                </p>
              ) : (
                peaks.map((peak) => (
                  <div key={peak.label}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span>{peak.label}</span>
                      <span className="text-muted-foreground">
                        {guestsLabel(peak.guests)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.round((peak.guests / peakMax) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-6">
        <Panel
          title="Upcoming reservations"
          action={
            <Link
              href="/admin/reservations"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              View all
            </Link>
          }
        >
          {upcoming.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground sm:p-5">
              No upcoming reservations in the next week.
            </p>
          ) : (
            <ul className="divide-y divide-input">
              {upcoming.map((reservation) => (
                <li key={reservation.id}>
                  <ReservationDetailsDialog
                    reservation={reservation}
                    tables={activeTables}
                    timeZone={timeZone}
                    isPast={Date.parse(reservation.endAt) < now}
                    hasStarted={Date.parse(reservation.startAt) <= now}
                    triggerClassName="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-none px-4 py-3 first:rounded-t-none hover:bg-secondary/40 sm:px-5"
                  >
                    <span className="w-full shrink-0 text-sm text-muted-foreground tabular-nums sm:w-32">
                      {formatShortDateInZone(reservation.startAt, timeZone)} ·{" "}
                      {formatTimeInZone(reservation.startAt, timeZone)}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium">
                      {reservation.customer.name}
                      <span className="ml-2 font-normal text-muted-foreground">
                        {guestsLabel(reservation.guests)}
                        {reservation.table && <> · {reservation.table.name}</>}
                      </span>
                    </span>
                    <StatusPill status={reservation.status} />
                  </ReservationDetailsDialog>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
