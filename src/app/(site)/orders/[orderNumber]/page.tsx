import type { Metadata } from "next";
import Link from "next/link";

import { OrderStatusPill } from "@/components/orders/OrderStatusPill";
import { OrderStatusRefresher } from "@/components/orders/OrderStatusRefresher";
import { OrderStatusTimeline } from "@/components/orders/OrderStatusTimeline";
import { buttonVariants } from "@/components/ui/button";
import { ApiError, getOrder } from "@/lib/api";
import {
  formatCents,
  formatDateInZone,
  formatTimeInZone,
  priceToCents,
} from "@/lib/format";
import { RESTAURANT } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/order";

export const metadata: Metadata = {
  title: `Your order — ${RESTAURANT.name}`,
};

function NotFoundBlock({ orderNumber }: { orderNumber: string }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-16 text-center">
      <h1 className="text-[clamp(1.75rem,4vw,2.25rem)]">Order not found</h1>
      <p className="mt-4 rounded-xl border border-dashed border-input px-4 py-8 text-sm text-muted-foreground">
        <span aria-hidden className="mb-2 block text-2xl">
          🔍
        </span>
        No order matches the number{" "}
        <span className="font-mono uppercase">{orderNumber}</span>.
        Double-check the number from your confirmation.
      </p>
      <Link
        href="/orders"
        className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
      >
        Look up an order
      </Link>
    </div>
  );
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  let order: Order;
  try {
    order = await getOrder(orderNumber);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return <NotFoundBlock orderNumber={orderNumber} />;
    }
    throw error;
  }

  const cancelled = order.status === "CANCELLED";
  const inProgress = !cancelled && order.status !== "COMPLETED";
  const timeZone = order.restaurant.timezone;

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 md:py-14">
      <OrderStatusRefresher active={inProgress} />
      <div className="text-center">
        <span
          aria-hidden
          className={cn(
            "mx-auto flex size-14 items-center justify-center rounded-full text-2xl animate-in zoom-in-50 duration-300",
            cancelled
              ? "bg-destructive/15 text-destructive"
              : "bg-primary/15 text-primary"
          )}
        >
          {cancelled ? "✕" : "✓"}
        </span>
        <h1 className="mt-4 text-[clamp(1.75rem,4vw,2.25rem)]">
          {cancelled ? "This order was cancelled" : "Order received"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {cancelled
            ? "Nothing was charged — you can order again any time."
            : order.customer.email
              ? `We've emailed your confirmation to ${order.customer.email} — quote your order number at the pickup counter.`
              : "Save your order number and quote it at the pickup counter."}
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-primary/40 bg-card px-5 py-4 text-center">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">
          Order number
        </p>
        <p className="mt-1 font-mono text-2xl font-semibold tracking-[0.15em] text-primary">
          {order.orderNumber}
        </p>
      </div>

      <div
        data-tour="order-status"
        className="mt-6 rounded-2xl border border-input bg-card p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            Status
            {inProgress && (
              <span
                className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground"
                title="Checks for updates every few seconds"
              >
                <span
                  aria-hidden
                  className="size-1.5 animate-pulse rounded-full bg-green-500"
                />
                Live
              </span>
            )}
          </h2>
          <OrderStatusPill status={order.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Placed {formatDateInZone(order.createdAt, timeZone)} at{" "}
          {formatTimeInZone(order.createdAt, timeZone)}.
          {inProgress && " This page updates automatically."}
        </p>
        {!cancelled && (
          <div className="mt-5">
            <OrderStatusTimeline order={order} />
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-input bg-card p-5">
        <h2 className="text-lg font-semibold">
          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
        </h2>
        <ul className="mt-3 divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {item.quantity} × {item.menuItem.name}
                </p>
                {item.notes && (
                  <p className="mt-0.5 text-sm text-muted-foreground italic">
                    &ldquo;{item.notes}&rdquo;
                  </p>
                )}
              </div>
              <span className="text-sm whitespace-nowrap text-muted-foreground">
                {formatCents(priceToCents(item.unitPrice) * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
          <p className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCents(priceToCents(order.subtotal))}</span>
          </p>
          <p className="flex justify-between font-semibold">
            <span>Total — pay at the counter</span>
            <span className="text-primary">
              {formatCents(priceToCents(order.total))}
            </span>
          </p>
        </div>
        {order.notes && (
          <p className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground italic">
            Order note: &ldquo;{order.notes}&rdquo;
          </p>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-input bg-card p-5 text-sm">
        <p className="font-medium">📍 Pickup from {order.restaurant.name}</p>
        {order.restaurant.address && (
          <p className="mt-1 text-muted-foreground">{order.restaurant.address}</p>
        )}
        {order.restaurant.phone && (
          <p className="mt-1 text-muted-foreground">{order.restaurant.phone}</p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/menu" className={cn(buttonVariants())}>
          {cancelled ? "Order again" : "Order something else"}
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }))}>
          Back home
        </Link>
      </div>
    </div>
  );
}
