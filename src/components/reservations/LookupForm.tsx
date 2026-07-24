"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type LookupMode = "code" | "phone";

const MODES: { key: LookupMode; label: string }[] = [
  { key: "code", label: "Booking code" },
  { key: "phone", label: "Phone number" },
];

export function LookupForm({
  initialCode = "",
  initialPhone = "",
}: {
  initialCode?: string;
  initialPhone?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<LookupMode>(
    initialPhone && !initialCode ? "phone" : "code"
  );
  const [code, setCode] = useState(initialCode);
  const [phone, setPhone] = useState(initialPhone);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "code") {
      const trimmed = code.trim().toUpperCase();
      if (trimmed) router.push(`/reservations/manage/${trimmed}`);
    } else {
      const trimmed = phone.trim();
      if (trimmed) {
        router.push(
          `/reservations/manage?phone=${encodeURIComponent(trimmed)}`
        );
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-input bg-card p-5"
    >
      <div
        role="group"
        aria-label="Find your booking by"
        className="mb-4 flex gap-2"
      >
        {MODES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-pressed={mode === key}
            onClick={() => setMode(key)}
            className={cn(
              "rounded-full border border-input px-3.5 py-1.5 text-sm text-muted-foreground transition-colors",
              "hover:border-primary/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              "aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "code" ? (
        <>
          <Label htmlFor="code">Confirmation code</Label>
          <div className="mt-2 flex gap-2">
            <Input
              id="code"
              name="code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="e.g. R7K2QX"
              required
              autoComplete="off"
              className="h-10 font-mono tracking-widest uppercase"
            />
            <Button type="submit" size="lg" className="shrink-0">
              Find booking
            </Button>
          </div>
        </>
      ) : (
        <>
          <Label htmlFor="lookup-phone">Phone number</Label>
          <div className="mt-2 flex gap-2">
            <Input
              id="lookup-phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="e.g. +966 55 123 4567"
              required
              autoComplete="tel"
              className="h-10"
            />
            <Button type="submit" size="lg" className="shrink-0">
              Find bookings
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Use the same phone number you booked with.
          </p>
        </>
      )}
    </form>
  );
}
