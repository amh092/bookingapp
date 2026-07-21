"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { hhMmToMinutes, minutesToTimeLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Availability, AvailabilitySlot } from "@/types/reservation";

interface SlotGridProps {
  availability: Availability | null;
  loading: boolean;
  error: string | null;
  selected: AvailabilitySlot | null;
  onSelect: (slot: AvailabilitySlot) => void;
  onRetry: () => void;
}

function EmptyState({
  emoji,
  children,
}: {
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-input px-4 py-8 text-center text-sm text-muted-foreground">
      <span aria-hidden className="mb-2 block text-2xl">
        {emoji}
      </span>
      {children}
    </div>
  );
}

export function SlotGrid({
  availability,
  loading,
  error,
  selected,
  onSelect,
  onRetry,
}: SlotGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-6 text-center text-sm"
      >
        <p>{error}</p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  if (!availability) return null;

  if (!availability.isOpen) {
    return (
      <EmptyState emoji="🌙">
        We&apos;re closed that day — pick another date.
      </EmptyState>
    );
  }

  if (availability.slots.length === 0) {
    return (
      <EmptyState emoji="📅">
        No tables left for{" "}
        {`${availability.guests} ${availability.guests === 1 ? "guest" : "guests"}`}{" "}
        that day — try another date or party size.
      </EmptyState>
    );
  }

  return (
    <div
      role="group"
      aria-label="Available times"
      aria-live="polite"
      className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2"
    >
      {availability.slots.map((slot) => (
        <button
          key={slot.startAt}
          type="button"
          aria-pressed={selected?.startAt === slot.startAt}
          onClick={() => onSelect(slot)}
          className={cn(
            "group flex h-12 flex-col items-center justify-center rounded-lg border border-input bg-transparent text-sm font-medium transition-colors",
            "hover:border-primary/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            "aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          )}
        >
          {minutesToTimeLabel(hhMmToMinutes(slot.time))}
          {slot.tablesLeft <= 2 && (
            <span className="text-[0.65rem] font-normal text-muted-foreground group-aria-pressed:text-primary-foreground/80">
              {slot.tablesLeft} left
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
