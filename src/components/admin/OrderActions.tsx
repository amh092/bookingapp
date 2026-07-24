"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateOrderStatusAction } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { OrderStatus, OrderType } from "@/types/order";

/**
 * The next step in the flow per status — mirrors the API's transition map.
 * Pickup orders jump from READY straight to COMPLETED; delivery orders (a
 * later feature) pass through OUT_FOR_DELIVERY.
 */
function advanceFor(
  status: OrderStatus,
  type: OrderType
): { next: OrderStatus; label: string } | null {
  switch (status) {
    case "PENDING":
      return { next: "CONFIRMED", label: "Confirm" };
    case "CONFIRMED":
      return { next: "PREPARING", label: "Start preparing" };
    case "PREPARING":
      return { next: "READY", label: "Mark ready" };
    case "READY":
      return type === "DELIVERY"
        ? { next: "OUT_FOR_DELIVERY", label: "Out for delivery" }
        : { next: "COMPLETED", label: "Picked up" };
    case "OUT_FOR_DELIVERY":
      return { next: "COMPLETED", label: "Delivered" };
    default:
      return null;
  }
}

/** Cancelling stops making sense once the food is ready. */
const CANCELLABLE: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING"];

interface OrderActionsProps {
  id: string;
  status: OrderStatus;
  type: OrderType;
  customerName: string;
}

export function OrderActions({
  id,
  status,
  type,
  customerName,
}: OrderActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const advance = advanceFor(status, type);
  const cancellable = CANCELLABLE.includes(status);
  if (!advance && !cancellable) return null;

  function run(next: OrderStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction(id, next);
      if (!result.success) {
        setError(result.error ?? "The action failed — try again.");
        return;
      }
      setCancelOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap justify-end gap-1.5">
        {advance && (
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => run(advance.next)}
          >
            {advance.label}
          </Button>
        )}
        {cancellable && (
          <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
            <DialogTrigger
              render={
                <Button size="sm" variant="ghost" className="text-destructive" />
              }
            >
              Cancel
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel {customerName}&apos;s order?</DialogTitle>
                <DialogDescription>
                  The order is closed and the customer keeps their money. This
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  Keep order
                </DialogClose>
                <Button
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => run("CANCELLED")}
                >
                  {isPending ? "Working…" : "Cancel order"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      {error && !cancelOpen && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
