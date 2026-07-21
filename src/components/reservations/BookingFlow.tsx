"use client";

import { useActionState, useRef, useState, useTransition } from "react";

import {
  createReservationAction,
  getAvailabilityAction,
  type BookingFormState,
} from "@/actions/reservations";
import { BookingSummary } from "@/components/reservations/BookingSummary";
import { DateStrip, type StripDay } from "@/components/reservations/DateStrip";
import { SlotGrid } from "@/components/reservations/SlotGrid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Availability, AvailabilitySlot } from "@/types/reservation";

interface BookingFlowProps {
  restaurantId: string;
  days: StripDay[];
  maxGuests: number;
  bookingDurationMinutes: number;
  initialDateKey: string;
  initialAvailability: Availability | null;
  initialError: string | null;
}

const DEFAULT_GUESTS = 2;

function Panel({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-input bg-card p-5">
      <h2 className="flex items-center gap-3 font-heading text-lg">
        <span
          aria-hidden
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary"
        >
          {step}
        </span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function BookingFlow({
  restaurantId,
  days,
  maxGuests,
  bookingDurationMinutes,
  initialDateKey,
  initialAvailability,
  initialError,
}: BookingFlowProps) {
  const [guests, setGuests] = useState(DEFAULT_GUESTS);
  const [dateKey, setDateKey] = useState(initialDateKey);
  const [availability, setAvailability] = useState(initialAvailability);
  const [loadError, setLoadError] = useState<string | null>(initialError);
  const [selected, setSelected] = useState<AvailabilitySlot | null>(null);
  const [isLoading, startTransition] = useTransition();
  const requestToken = useRef(0);

  const [formState, formAction, isSubmitting] = useActionState<
    BookingFormState,
    FormData
  >(createReservationAction, {});
  const fieldErrors = formState.fieldErrors ?? {};

  function loadSlots(nextDateKey: string, nextGuests: number) {
    const token = ++requestToken.current;
    setSelected(null);
    startTransition(async () => {
      const result = await getAvailabilityAction({
        restaurantId,
        date: nextDateKey,
        guests: nextGuests,
      });
      if (token !== requestToken.current) return;
      if (result.success && result.data) {
        setAvailability(result.data);
        setLoadError(null);
      } else {
        setAvailability(null);
        setLoadError(result.error ?? "Could not load available times.");
      }
    });
  }

  function selectGuests(next: number) {
    setGuests(next);
    loadSlots(dateKey, next);
  }

  function selectDate(next: string) {
    setDateKey(next);
    loadSlots(next, guests);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20.5rem] lg:items-start">
      <form id="booking-form" action={formAction} className="space-y-5">
        <input type="hidden" name="restaurantId" value={restaurantId} />
        <input type="hidden" name="guests" value={guests} />
        <input type="hidden" name="startAt" value={selected?.startAt ?? ""} />

        <Panel step={1} title="How many guests?">
          <div role="group" aria-label="Number of guests" className="flex flex-wrap gap-2">
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={n === guests}
                onClick={() => selectGuests(n)}
                className={cn(
                  "h-11 min-w-11 rounded-lg border border-input bg-transparent px-3 text-sm font-medium transition-colors",
                  "hover:border-primary/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  "aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Party of more than {maxGuests}? Call us and we&apos;ll arrange it.
          </p>
        </Panel>

        <Panel step={2} title="Pick a date">
          <DateStrip days={days} selectedKey={dateKey} onSelect={selectDate} />
        </Panel>

        <Panel step={3} title="Choose a time">
          <SlotGrid
            availability={availability}
            loading={isLoading}
            error={loadError}
            selected={selected}
            onSelect={setSelected}
            onRetry={() => loadSlots(dateKey, guests)}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Tables are held for {bookingDurationMinutes} minutes.
          </p>
        </Panel>

        <Panel step={4} title="Your details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="name" error={fieldErrors.name}>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                required
                aria-invalid={fieldErrors.name ? true : undefined}
                placeholder="Your name"
              />
            </Field>
            <Field label="Phone" htmlFor="phone" error={fieldErrors.phone}>
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                aria-invalid={fieldErrors.phone ? true : undefined}
                placeholder="+966 5X XXX XXXX"
              />
            </Field>
            <Field
              label="Email"
              htmlFor="email"
              error={fieldErrors.email}
              className="sm:col-span-2"
            >
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-invalid={fieldErrors.email ? true : undefined}
                placeholder="you@example.com"
              />
            </Field>
            <Field
              label="Special requests (optional)"
              htmlFor="customerNotes"
              error={fieldErrors.customerNotes}
              className="sm:col-span-2"
            >
              <Textarea
                id="customerNotes"
                name="customerNotes"
                rows={3}
                maxLength={500}
                aria-invalid={fieldErrors.customerNotes ? true : undefined}
                placeholder="Allergies, occasions, seating preferences…"
              />
            </Field>
          </div>
        </Panel>

        {formState.error && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm"
          >
            {formState.error}
          </div>
        )}
      </form>

      <BookingSummary
        guests={guests}
        dateKey={dateKey}
        slot={selected}
        bookingDurationMinutes={bookingDurationMinutes}
        submitting={isSubmitting}
      />
    </div>
  );
}
