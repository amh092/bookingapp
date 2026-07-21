import { StatusPill } from "@/components/reservations/StatusPill";
import { formatDateInZone, formatTimeInZone } from "@/lib/format";
import type { Reservation } from "@/types/reservation";

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-3 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium">{children}</dd>
    </div>
  );
}

export function ReservationDetails({
  reservation,
}: {
  reservation: Reservation;
}) {
  const timeZone = reservation.restaurant.timezone;
  const { table } = reservation;

  return (
    <dl>
      <Row label="Code">
        <span className="font-mono tracking-widest text-primary">
          {reservation.confirmationCode}
        </span>
      </Row>
      <Row label="Date">{formatDateInZone(reservation.startAt, timeZone)}</Row>
      <Row label="Time">
        {formatTimeInZone(reservation.startAt, timeZone)} –{" "}
        {formatTimeInZone(reservation.endAt, timeZone)}
      </Row>
      <Row label="Guests">{reservation.guests}</Row>
      {table && (
        <Row label="Table">
          {table.name}
          {table.section ? ` · ${table.section}` : ""}
        </Row>
      )}
      <Row label="Status">
        <StatusPill status={reservation.status} />
      </Row>
      {reservation.customerNotes && (
        <Row label="Your note">
          <span className="font-normal text-muted-foreground">
            {reservation.customerNotes}
          </span>
        </Row>
      )}
    </dl>
  );
}
