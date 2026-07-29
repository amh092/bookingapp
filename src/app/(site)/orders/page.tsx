import type { Metadata } from "next";
import Link from "next/link";

import { OrderLookupForm } from "@/components/orders/OrderLookupForm";
import { OrderStatusPill } from "@/components/orders/OrderStatusPill";
import { RecentOrders } from "@/components/orders/RecentOrders";
import { buttonVariants } from "@/components/ui/button";
import { lookupOrdersByPhone } from "@/lib/api";
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
  title: `Track your order — ${RESTAURANT.name}`,
};

// Mirrors the API's phone validation (see createOrderAction).
const PHONE_PATTERN = /^\+?[\d\s()-]{10,20}$/;

export default async function OrdersLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const { phone } = await searchParams;
  const queryPhone = typeof phone === "string" ? phone.trim() : "";

  let orders: Order[] | null = null;
  let loadError: string | null = null;
  if (queryPhone) {
    if (!PHONE_PATTERN.test(queryPhone)) {
      loadError = "That doesn't look like a phone number — please try again.";
    } else {
      try {
        orders = await lookupOrdersByPhone(queryPhone);
      } catch {
        loadError = "Could not search orders right now — please try again.";
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 md:py-14">
      <h1 className="text-[clamp(1.75rem,4vw,2.25rem)]">Track your order</h1>
      <p className="mt-2 text-muted-foreground">
        Enter your order number, or find your active orders with the phone
        number you ordered with.
      </p>
      <div data-tour="order-lookup" className="mt-6">
        <OrderLookupForm initialPhone={queryPhone} />
      </div>

      {loadError && (
        <div className="mt-6 rounded-xl border border-dashed border-input px-4 py-8 text-center text-sm text-muted-foreground">
          <span aria-hidden className="mb-2 block text-2xl">
            🔍
          </span>
          {loadError}
        </div>
      )}

      {orders && orders.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-input px-4 py-8 text-center text-sm text-muted-foreground">
          <span aria-hidden className="mb-2 block text-2xl">
            🔍
          </span>
          No active orders for this phone number. Finished orders can be
          opened with their order number.
        </div>
      )}

      {orders && orders.length > 0 && (
        <section aria-label="Your active orders" className="mt-6">
          <h2 className="font-heading text-lg">
            {orders.length === 1
              ? "1 active order"
              : `${orders.length} active orders`}
          </h2>
          <ul className="mt-3 space-y-4">
            {orders.map((order) => {
              const timeZone = order.restaurant.timezone;
              const itemCount = order.items.reduce(
                (sum, item) => sum + item.quantity,
                0
              );
              return (
                <li
                  key={order.id}
                  className="rounded-2xl border border-input bg-card p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-heading text-base">
                      {formatDateInZone(order.createdAt, timeZone)}
                    </h3>
                    <OrderStatusPill status={order.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatTimeInZone(order.createdAt, timeZone)} · {itemCount}{" "}
                    {itemCount === 1 ? "item" : "items"} ·{" "}
                    {formatCents(priceToCents(order.total))} · number{" "}
                    <span className="font-mono tracking-widest text-primary">
                      {order.orderNumber}
                    </span>
                  </p>
                  <div className="mt-4">
                    <Link
                      href={`/orders/${order.orderNumber}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" })
                      )}
                    >
                      Track order
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <RecentOrders />
    </div>
  );
}
