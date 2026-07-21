import type { Metadata } from "next";
import Link from "next/link";

import { ReservationActions } from "@/components/admin/ReservationActions";
import { StatusPill } from "@/components/reservations/StatusPill";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminReservations, getRestaurant } from "@/lib/api";
import { formatDateInZone, formatTimeInZone } from "@/lib/format";
import { RESTAURANT } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { AdminReservation, ReservationStatus } from "@/types/reservation";

export const metadata: Metadata = {
  title: `Reservations — Staff — ${RESTAURANT.name}`,
};

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

function ReservationRow({
  reservation,
  timeZone,
}: {
  reservation: AdminReservation;
  timeZone: string;
}) {
  return (
    <li className="rounded-2xl border border-input bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-heading text-base font-semibold">
            {reservation.customer.name}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {reservation.guests}{" "}
              {reservation.guests === 1 ? "guest" : "guests"}
            </span>
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatDateInZone(reservation.startAt, timeZone)} ·{" "}
            {formatTimeInZone(reservation.startAt, timeZone)} –{" "}
            {formatTimeInZone(reservation.endAt, timeZone)}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {reservation.customer.phone}
            {reservation.table && <> · {reservation.table.name}</>} ·{" "}
            <span className="font-mono text-xs tracking-widest text-primary">
              {reservation.confirmationCode}
            </span>
          </p>
          {reservation.customerNotes && (
            <p className="mt-1 text-sm text-muted-foreground italic">
              &ldquo;{reservation.customerNotes}&rdquo;
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusPill status={reservation.status} />
          <ReservationActions
            id={reservation.id}
            status={reservation.status}
            customerName={reservation.customer.name}
          />
        </div>
      </div>
    </li>
  );
}

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const date = first(params.date) || undefined;
  const statusParam = first(params.status);
  const status = STATUSES.some((s) => s.value === statusParam)
    ? (statusParam as ReservationStatus)
    : undefined;
  const search = first(params.search)?.trim() || undefined;
  const hasFilters = Boolean(date || status || search);

  let reservations: AdminReservation[];
  let timeZone: string;
  try {
    const restaurant = await getRestaurant();
    timeZone = restaurant.timezone;
    reservations = await getAdminReservations(restaurant.id, {
      date,
      status,
      search,
    });
  } catch {
    return (
      <div className="mx-auto w-full max-w-4xl px-5 py-16 text-center">
        <p className="rounded-xl border border-dashed border-input px-4 py-8 text-sm text-muted-foreground">
          Could not reach the booking API — is it running?
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8 md:py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-[clamp(1.5rem,3.5vw,2rem)]">Reservations</h1>
        <p className="text-sm text-muted-foreground">
          {reservations.length}{" "}
          {reservations.length === 1 ? "booking" : "bookings"}
          {hasFilters ? " match the filters" : " total"}
        </p>
      </div>

      <form
        method="get"
        className="mt-5 grid items-end gap-3 rounded-2xl border border-input bg-card p-4 sm:grid-cols-[10rem_11rem_minmax(0,1fr)_auto]"
      >
        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={date ?? ""}
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
              href="/admin/reservations"
              className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {reservations.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-input px-4 py-10 text-center text-sm text-muted-foreground">
          <span aria-hidden className="mb-2 block text-2xl">
            📅
          </span>
          No reservations{hasFilters ? " match these filters." : " yet."}
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {reservations.map((reservation) => (
            <ReservationRow
              key={reservation.id}
              reservation={reservation}
              timeZone={timeZone}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
