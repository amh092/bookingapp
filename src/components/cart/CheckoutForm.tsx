"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { createOrderAction, type CheckoutResult } from "@/actions/orders";
import { useCart } from "@/hooks/useCart";
import { useDemoTourPrefill } from "@/hooks/useDemoTourPrefill";
import { formatCents, priceToCents } from "@/lib/format";
import { addRecentOrder } from "@/lib/recent-orders";
import { cn } from "@/lib/utils";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  );
}

export function CheckoutForm({
  pickupAddress,
}: {
  pickupAddress: string | null;
}) {
  const { lines, hydrated, count, subtotalCents, clear } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<CheckoutResult>({ success: true });
  const demoContact = useDemoTourPrefill("order-pickup");

  if (!hydrated) {
    return (
      <div className="mt-8 space-y-3">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mt-10 rounded-xl border border-dashed border-input px-4 py-12 text-center text-sm text-muted-foreground">
        <span aria-hidden className="mb-2 block text-2xl">
          🛍️
        </span>
        <strong className="block text-foreground">
          There&apos;s nothing to check out yet
        </strong>
        Add a few dishes from the menu first.
        <div className="mt-5">
          <Link href="/menu" className={cn(buttonVariants(), "rounded-full")}>
            Browse the menu
          </Link>
        </div>
      </div>
    );
  }

  const fieldErrors = result.fieldErrors ?? {};

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const outcome = await createOrderAction({
        items: lines.map((line) => ({
          menuItemId: line.menuItemId,
          quantity: line.quantity,
          notes: line.notes.trim() || undefined,
        })),
        name: String(formData.get("name") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        email: String(formData.get("email") ?? "").trim() || undefined,
        notes: String(formData.get("notes") ?? "").trim() || undefined,
      });

      if (outcome.success && outcome.orderNumber) {
        addRecentOrder({
          orderNumber: outcome.orderNumber,
          placedAt: new Date().toISOString(),
          total: outcome.total ?? "0.00",
        });
        clear();
        router.push(`/orders/${outcome.orderNumber}`);
        return;
      }
      setResult(outcome);
    });
  };

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_18rem] md:items-start">
      <form
        onSubmit={handleSubmit}
        noValidate
        data-tour="checkout-form"
        className="space-y-4"
      >
        <div className="rounded-2xl border border-input bg-card p-5">
          <h2 className="text-lg font-semibold">Your details</h2>

          <div
            // Uncontrolled inputs only read defaultValue on mount — remount
            // the fields when the demo-tour prefill arrives after hydration.
            key={demoContact ? "demo" : "blank"}
            className="mt-4 space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                required
                defaultValue={demoContact?.name}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "name-error" : undefined}
              />
              <FieldError id="name-error" message={fieldErrors.name} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="05x xxx xxxx"
                required
                defaultValue={demoContact?.phone}
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
              />
              <FieldError id="phone-error" message={fieldErrors.phone} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">
                Email{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
              />
              <FieldError id="email-error" message={fieldErrors.email} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">
                Order notes{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                maxLength={500}
                placeholder="Anything the kitchen should know?"
                aria-invalid={Boolean(fieldErrors.notes)}
                aria-describedby={fieldErrors.notes ? "notes-error" : undefined}
              />
              <FieldError id="notes-error" message={fieldErrors.notes} />
            </div>
          </div>
        </div>

        {!result.success && result.error && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {result.error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          data-tour="place-order"
          className="w-full rounded-full font-semibold"
        >
          {isPending ? "Placing your order…" : "Place pickup order"}
        </Button>
      </form>

      <aside className="rounded-2xl border border-input bg-card p-5">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Order summary
        </h2>
        <ul className="mt-3 space-y-2 text-sm">
          {lines.map((line) => (
            <li
              key={line.menuItemId}
              className="flex items-baseline justify-between gap-3"
            >
              <span className="min-w-0 truncate">
                {line.quantity} × {line.name}
              </span>
              <span className="whitespace-nowrap text-muted-foreground">
                {formatCents(priceToCents(line.price) * line.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">
            Total · {count} {count === 1 ? "item" : "items"}
          </span>
          <span className="font-bold text-primary">
            {formatCents(subtotalCents)}
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          🛍️ Pickup{pickupAddress ? ` from ${pickupAddress}` : " at the restaurant"} —
          pay at the counter. Prices are confirmed by the kitchen when the
          order is placed.
        </p>
        <Link
          href="/cart"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          Edit the order
        </Link>
      </aside>
    </div>
  );
}
