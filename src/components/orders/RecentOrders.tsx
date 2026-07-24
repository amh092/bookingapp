"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { buttonVariants } from "@/components/ui/button";
import { formatCents, priceToCents } from "@/lib/format";
import {
  getRecentOrders,
  getServerRecentOrders,
  subscribeToRecentOrders,
} from "@/lib/recent-orders";
import { cn } from "@/lib/utils";

/** Orders placed from this device — renders nothing when there are none. */
export function RecentOrders() {
  const orders = useSyncExternalStore(
    subscribeToRecentOrders,
    getRecentOrders,
    getServerRecentOrders
  );

  if (orders.length === 0) return null;

  return (
    <section aria-label="Orders placed from this device" className="mt-8">
      <h2 className="font-heading text-lg">Recent orders on this device</h2>
      <ul className="mt-3 space-y-3">
        {orders.map((order) => (
          <li
            key={order.orderNumber}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-input bg-card px-5 py-4"
          >
            <div>
              <p className="font-mono text-sm font-semibold tracking-widest text-primary">
                {order.orderNumber}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                }).format(new Date(order.placedAt))}{" "}
                · {formatCents(priceToCents(order.total))}
              </p>
            </div>
            <Link
              href={`/orders/${order.orderNumber}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Track order
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
