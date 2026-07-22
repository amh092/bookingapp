import { Fragment } from "react";

import { ReservationDetailsDialog } from "@/components/admin/ReservationDetailsDialog";
import { formatTimeInZone, hourInZone, minutesToTimeLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  AdminReservation,
  AdminTable,
  ReservationStatus,
} from "@/types/reservation";

/** Left accent + soft fill per status, mirroring the prototype's event blocks. */
const EVENT_STYLES: Record<ReservationStatus, string> = {
  PENDING: "border-yellow-500 bg-yellow-500/15",
  CONFIRMED: "border-green-500 bg-green-500/15",
  COMPLETED: "border-blue-500 bg-blue-500/15",
  CANCELLED: "border-red-500 bg-red-500/15 opacity-70 line-through",
  NO_SHOW: "border-zinc-500 bg-zinc-500/15 opacity-70",
};

const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  NO_SHOW: "No-show",
};

export interface CalendarColumn {
  key: string;
  /** Short weekday heading, e.g. "Thu". */
  title: string;
  /** Date line under the heading, e.g. "23 Jul". */
  sub: string;
  isToday: boolean;
  isClosed: boolean;
  reservations: AdminReservation[];
}

interface CalendarGridProps {
  columns: CalendarColumn[];
  /** Hours of day (0–23) to render as rows, in order. */
  hours: number[];
  /** Active tables passed through to the details dialog. */
  tables: AdminTable[];
  timeZone: string;
}

/**
 * The prototype's calendar: a time gutter plus one column per day, events
 * placed in the cell of their local start hour. One component serves the day
 * view (single column) and the week view (seven columns).
 */
export function CalendarGrid({
  columns,
  hours,
  tables,
  timeZone,
}: CalendarGridProps) {
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-input">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `4.5rem repeat(${columns.length}, minmax(7rem, 1fr))`,
        }}
      >
        <div className="border-b border-border/60 bg-card" />
        {columns.map((column) => (
          <div
            key={column.key}
            className={cn(
              "border-b border-l border-border/60 bg-card px-2 py-2 text-center",
              column.isToday && "text-primary"
            )}
          >
            <p className="font-heading text-base font-semibold">
              {column.title}
            </p>
            <p
              className={cn(
                "text-xs",
                column.isToday ? "text-primary/80" : "text-muted-foreground"
              )}
            >
              {column.sub}
              {column.isClosed && " · Closed"}
            </p>
          </div>
        ))}

        {hours.map((hour) => (
          <Fragment key={hour}>
            <div className="border-b border-border/60 px-2 py-1 text-right text-xs text-muted-foreground">
              {minutesToTimeLabel(hour * 60)}
            </div>
            {columns.map((column) => (
              <div
                key={column.key}
                className="min-h-13 space-y-1 border-b border-l border-border/60 p-1 transition-colors hover:bg-secondary/40"
              >
                {column.reservations
                  .filter(
                    (reservation) =>
                      hourInZone(reservation.startAt, timeZone) === hour
                  )
                  .map((reservation) => (
                    <ReservationDetailsDialog
                      key={reservation.id}
                      reservation={reservation}
                      tables={tables}
                      timeZone={timeZone}
                      triggerClassName="rounded-md"
                    >
                      <span
                        className={cn(
                          "block rounded-md border-l-[3px] px-1.5 py-1 text-start text-xs leading-tight",
                          EVENT_STYLES[reservation.status]
                        )}
                      >
                        <span className="sr-only">
                          {STATUS_LABELS[reservation.status]}:
                        </span>
                        <span className="block truncate font-semibold">
                          {formatTimeInZone(reservation.startAt, timeZone)} ·{" "}
                          {reservation.customer.name}
                        </span>
                        <span className="block truncate text-muted-foreground">
                          {reservation.guests}{" "}
                          {reservation.guests === 1 ? "guest" : "guests"} ·{" "}
                          {reservation.table?.name ?? "Unassigned"}
                        </span>
                      </span>
                    </ReservationDetailsDialog>
                  ))}
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

/** Color key for the event blocks, matching the prototype's legend. */
export function CalendarLegend() {
  const dots: { status: ReservationStatus; dot: string }[] = [
    { status: "PENDING", dot: "bg-yellow-500" },
    { status: "CONFIRMED", dot: "bg-green-500" },
    { status: "COMPLETED", dot: "bg-blue-500" },
    { status: "CANCELLED", dot: "bg-red-500" },
    { status: "NO_SHOW", dot: "bg-zinc-500" },
  ];
  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {dots.map(({ status, dot }) => (
        <li key={status} className="inline-flex items-center gap-1.5">
          <i aria-hidden className={cn("size-2.5 rounded-[3px]", dot)} />
          {STATUS_LABELS[status]}
        </li>
      ))}
    </ul>
  );
}
