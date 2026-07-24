"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type LookupMode = "number" | "phone";

const MODES: { key: LookupMode; label: string }[] = [
  { key: "number", label: "Order number" },
  { key: "phone", label: "Phone number" },
];

/** "zahmj5" / "ord-zahmj5" → "ORD-ZAHMJ5". */
function normalizeOrderNumber(input: string): string {
  const bare = input.trim().toUpperCase().replace(/\s+/g, "");
  if (!bare) return "";
  return bare.startsWith("ORD-") ? bare : `ORD-${bare}`;
}

export function OrderLookupForm({
  initialPhone = "",
}: {
  initialPhone?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<LookupMode>(
    initialPhone ? "phone" : "number"
  );
  const [number, setNumber] = useState("");
  const [phone, setPhone] = useState(initialPhone);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "number") {
      const normalized = normalizeOrderNumber(number);
      if (normalized) router.push(`/orders/${normalized}`);
    } else {
      const trimmed = phone.trim();
      if (trimmed) {
        router.push(`/orders?phone=${encodeURIComponent(trimmed)}`);
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
        aria-label="Find your order by"
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

      {mode === "number" ? (
        <>
          <Label htmlFor="order-number">Order number</Label>
          <div className="mt-2 flex gap-2">
            <Input
              id="order-number"
              name="orderNumber"
              value={number}
              onChange={(event) => setNumber(event.target.value)}
              placeholder="e.g. ORD-R7K2QX"
              required
              autoComplete="off"
              className="h-10 font-mono tracking-widest uppercase"
            />
            <Button type="submit" size="lg" className="shrink-0">
              Find order
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
              Find orders
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Use the same phone number you ordered with. Finished orders can
            still be opened with their order number.
          </p>
        </>
      )}
    </form>
  );
}
