"use client";

import { AssignTableForm } from "@/components/admin/AssignTableForm";
import { RescheduleForm } from "@/components/admin/RescheduleForm";
import { ReservationActions } from "@/components/admin/ReservationActions";
import { StatusPill } from "@/components/reservations/StatusPill";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDateInZone, formatTimeInZone } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminReservation, AdminTable } from "@/types/reservation";

interface ReservationDetailsDialogProps {
  reservation: AdminReservation;
  /** Active tables offered by the assignment form. */
  tables: AdminTable[];
  timeZone: string;
  /** Chip content rendered inside the trigger button. */
  children: React.ReactNode;
  triggerClassName?: string;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
    </h3>
  );
}

export function ReservationDetailsDialog({
  reservation,
  tables,
  timeZone,
  children,
  triggerClassName,
}: ReservationDetailsDialogProps) {
  const active =
    reservation.status === "PENDING" || reservation.status === "CONFIRMED";

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            className={cn(
              "block w-full rounded-xl text-left transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              triggerClassName
            )}
          />
        }
      >
        {children}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{reservation.customer.name}</DialogTitle>
          <DialogDescription>
            {formatDateInZone(reservation.startAt, timeZone)} ·{" "}
            {formatTimeInZone(reservation.startAt, timeZone)} –{" "}
            {formatTimeInZone(reservation.endAt, timeZone)} ·{" "}
            {reservation.guests}{" "}
            {reservation.guests === 1 ? "guest" : "guests"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={reservation.status} />
          <span className="font-mono text-xs tracking-widest text-primary">
            {reservation.confirmationCode}
          </span>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-muted-foreground">Phone</dt>
          <dd>{reservation.customer.phone}</dd>
          {reservation.customer.email && (
            <>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="break-all">{reservation.customer.email}</dd>
            </>
          )}
          <dt className="text-muted-foreground">Table</dt>
          <dd>
            {reservation.table
              ? `${reservation.table.name}${
                  reservation.table.section
                    ? ` · ${reservation.table.section}`
                    : ""
                }`
              : "Unassigned"}
          </dd>
          {reservation.customerNotes && (
            <>
              <dt className="text-muted-foreground">Note</dt>
              <dd className="italic">
                &ldquo;{reservation.customerNotes}&rdquo;
              </dd>
            </>
          )}
        </dl>

        {active && (
          <div className="border-t border-border/60 pt-3">
            <ReservationActions
              id={reservation.id}
              status={reservation.status}
              customerName={reservation.customer.name}
            />
          </div>
        )}

        {active && (
          <div className="space-y-3 border-t border-border/60 pt-3">
            <SectionTitle>Reschedule</SectionTitle>
            <RescheduleForm
              reservationId={reservation.id}
              restaurantId={reservation.restaurantId}
              guests={reservation.guests}
              startAt={reservation.startAt}
              timeZone={timeZone}
            />
          </div>
        )}

        {active && (
          <div className="space-y-3 border-t border-border/60 pt-3">
            <SectionTitle>Assigned table</SectionTitle>
            <AssignTableForm
              reservationId={reservation.id}
              guests={reservation.guests}
              currentTableId={reservation.tableId}
              tables={tables}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
