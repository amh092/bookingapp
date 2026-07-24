"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import { DishImage } from "@/components/menu/DishImage";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/useCart";
import { MAX_LINE_QUANTITY, type CartLine } from "@/lib/cart-store";
import { formatCents, priceToCents } from "@/lib/format";
import { cn } from "@/lib/utils";

const STEPPER_BUTTON_CLASS =
  "grid size-8 place-items-center rounded-full border border-input text-muted-foreground transition-colors outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40";

function EmptyCart() {
  return (
    <div className="mt-10 rounded-xl border border-dashed border-input px-4 py-12 text-center text-sm text-muted-foreground">
      <span aria-hidden className="mb-2 block text-2xl">
        🛍️
      </span>
      <strong className="block text-foreground">Your order is empty</strong>
      Browse the menu and add a few dishes.
      <div className="mt-5">
        <Link href="/menu" className={cn(buttonVariants(), "rounded-full")}>
          Browse the menu
        </Link>
      </div>
      <p className="mt-4">
        Already ordered?{" "}
        <Link href="/orders" className="text-primary hover:underline">
          Track your order
        </Link>
      </p>
    </div>
  );
}

function CartLineRow({ line }: { line: CartLine }) {
  const { setQuantity, setNotes, removeLine } = useCart();
  const lineCents = priceToCents(line.price) * line.quantity;

  return (
    <li className="rounded-2xl border border-input bg-card p-4">
      <div className="flex items-start gap-4">
        <div className="relative hidden size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-secondary to-elevated sm:grid">
          <DishImage src={line.imageUrl} alt="" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="truncate text-base font-semibold">{line.name}</h2>
            <span className="font-bold whitespace-nowrap text-primary">
              {formatCents(lineCents)}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(line.menuItemId, line.quantity - 1)}
                aria-label={`Remove one ${line.name}`}
                className={STEPPER_BUTTON_CLASS}
              >
                <Minus aria-hidden className="size-4" />
              </button>
              <span
                aria-label={`${line.quantity} × ${line.name}`}
                className="min-w-6 text-center font-semibold tabular-nums"
              >
                {line.quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(line.menuItemId, line.quantity + 1)}
                disabled={line.quantity >= MAX_LINE_QUANTITY}
                aria-label={`Add one ${line.name}`}
                className={STEPPER_BUTTON_CLASS}
              >
                <Plus aria-hidden className="size-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => removeLine(line.menuItemId)}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm text-muted-foreground transition-colors outline-none hover:bg-destructive/10 hover:text-destructive focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Trash2 aria-hidden className="size-4" />
              Remove
            </button>
          </div>

          <div className="mt-3 space-y-1.5">
            <Label
              htmlFor={`notes-${line.menuItemId}`}
              className="text-xs text-muted-foreground"
            >
              Notes for the kitchen (optional)
            </Label>
            <Input
              id={`notes-${line.menuItemId}`}
              value={line.notes}
              onChange={(event) =>
                setNotes(line.menuItemId, event.target.value)
              }
              maxLength={200}
              placeholder="e.g. no onions"
              className="h-9"
            />
          </div>
        </div>
      </div>
    </li>
  );
}

export function CartView() {
  const { lines, hydrated, count, subtotalCents } = useCart();

  if (!hydrated) {
    return (
      <div className="mt-8 space-y-3">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  if (lines.length === 0) return <EmptyCart />;

  return (
    <div className="mt-8">
      <ul className="space-y-3">
        {lines.map((line) => (
          <CartLineRow key={line.menuItemId} line={line} />
        ))}
      </ul>

      <div className="mt-6 rounded-2xl border border-input bg-card p-5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">
            Subtotal · {count} {count === 1 ? "item" : "items"}
          </span>
          <span className="text-lg font-bold text-primary">
            {formatCents(subtotalCents)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          No delivery fee — pickup orders are paid at the counter.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/checkout"
            className={cn(buttonVariants({ size: "lg" }), "rounded-full")}
          >
            Continue to checkout
          </Link>
          <Link
            href="/menu"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "rounded-full"
            )}
          >
            Add more dishes
          </Link>
        </div>
      </div>
    </div>
  );
}
