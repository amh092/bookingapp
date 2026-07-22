"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  getAvailabilityAction,
  rescheduleReservationAction,
} from "@/actions/reservations";
import { SlotGrid } from "@/components/reservations/SlotGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dateKeyInTimeZone } from "@/lib/dates";
import { hhMmToMinutes, minutesToTimeLabel } from "@/lib/format";
import type { Availability, AvailabilitySlot } from "@/types/reservation";

interface RescheduleFormProps {
  reservationId: string;
  restaurantId: string;
  guests: number;
  /** Current booking start, used to preselect its calendar date. */
  startAt: string;
  timeZone: string;
}

export function RescheduleForm({
  reservationId,
  restaurantId,
  guests,
  startAt,
  timeZone,
}: RescheduleFormProps) {
  const router = useRouter();
  const todayKey = dateKeyInTimeZone(new Date(), timeZone);
  const [date, setDate] = useState(() =>
    dateKeyInTimeZone(new Date(startAt), timeZone)
  );
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AvailabilitySlot | null>(null);
  const [moved, setMoved] = useState(false);
  const [isLoading, startLoading] = useTransition();
  const [isMoving, startMoving] = useTransition();

  function loadSlots() {
    setMoved(false);
    setLoadError(null);
    setMoveError(null);
    setSelected(null);
    startLoading(async () => {
      const result = await getAvailabilityAction({
        restaurantId,
        date,
        guests,
        excludeReservationId: reservationId,
      });
      if (!result.success || !result.data) {
        setAvailability(null);
        setLoadError(result.error ?? "Could not load times — try again.");
        return;
      }
      setAvailability(result.data);
    });
  }

  function move() {
    if (!selected) return;
    setMoveError(null);
    startMoving(async () => {
      const result = await rescheduleReservationAction({
        id: reservationId,
        startAt: selected.startAt,
      });
      if (!result.success) {
        setMoveError(result.error ?? "The move failed — try again.");
        return;
      }
      setAvailability(null);
      setSelected(null);
      setMoved(true);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor={`reschedule-date-${reservationId}`}>New date</Label>
          <Input
            id={`reschedule-date-${reservationId}`}
            type="date"
            value={date}
            min={todayKey}
            onChange={(event) => setDate(event.target.value)}
            className="h-10"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={isLoading || !date}
          onClick={loadSlots}
        >
          {isLoading ? "Loading…" : "Find times"}
        </Button>
      </div>

      <SlotGrid
        availability={availability}
        loading={isLoading}
        error={loadError}
        selected={selected}
        onSelect={setSelected}
        onRetry={loadSlots}
      />

      {selected && (
        <Button
          type="button"
          className="w-full"
          disabled={isMoving}
          onClick={move}
        >
          {isMoving
            ? "Moving…"
            : `Move to ${minutesToTimeLabel(hhMmToMinutes(selected.time))}`}
        </Button>
      )}
      {moveError && (
        <p role="alert" className="text-sm text-destructive">
          {moveError}
        </p>
      )}
      {moved && (
        <p role="status" className="text-sm text-green-700 dark:text-green-400">
          Booking moved.
        </p>
      )}
    </div>
  );
}
