import type { Metadata } from "next";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";

import { OrderActions } from "@/components/admin/OrderActions";
import { OrderStatusPill } from "@/components/orders/OrderStatusPill";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminOrders, getRestaurant } from "@/lib/api";
import {
  formatCents,
  formatDateInZone,
  formatTimeInZone,
  priceToCents,
} from "@/lib/format";
import { RESTAURANT } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { AdminOrder, OrderStatus } from "@/types/order";

export const metadata: Metadata = {
  title: `Orders — Staff — ${RESTAURANT.name}`,
};

const STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY", label: "Ready" },
  { value: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function OrderRow({ order, timeZone }: { order: AdminOrder; timeZone: string }) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <li className="rounded-2xl border border-input bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-heading text-base font-semibold">
            {order.customer.name}
            <span className="ml-2 font-sans text-sm font-normal text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
              {formatCents(priceToCents(order.total))}
            </span>
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatDateInZone(order.createdAt, timeZone)} ·{" "}
            {formatTimeInZone(order.createdAt, timeZone)} ·{" "}
            {order.type === "PICKUP" ? "Pickup" : "Delivery"}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {order.customer.phone} ·{" "}
            <span className="font-mono text-xs tracking-widest text-primary">
              {order.orderNumber}
            </span>
          </p>
          <ul className="mt-2 space-y-0.5 text-sm text-muted-foreground">
            {order.items.map((item) => (
              <li key={item.id} className="truncate">
                {item.quantity} × {item.menuItem.name}
                {item.notes && (
                  <span className="italic">
                    {" "}
                    — &ldquo;{item.notes}&rdquo;
                  </span>
                )}
              </li>
            ))}
          </ul>
          {order.notes && (
            <p className="mt-1 text-sm text-muted-foreground italic">
              Order note: &ldquo;{order.notes}&rdquo;
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <OrderStatusPill status={order.status} />
          <OrderActions
            id={order.id}
            status={order.status}
            type={order.type}
            customerName={order.customer.name}
          />
        </div>
      </div>
    </li>
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const date = first(params.date) || undefined;
  const statusParam = first(params.status);
  const status = STATUSES.some((s) => s.value === statusParam)
    ? (statusParam as OrderStatus)
    : undefined;
  const search = first(params.search)?.trim() || undefined;
  const hasFilters = Boolean(date || status || search);

  let orders: AdminOrder[];
  let timeZone: string;
  try {
    const restaurant = await getRestaurant();
    timeZone = restaurant.timezone;
    orders = await getAdminOrders(restaurant.id, { date, status, search });
  } catch (error) {
    // Let the login redirect thrown by authHeaders() escape; only a real
    // API failure should render this fallback.
    unstable_rethrow(error);
    return (
      <div className="mx-auto w-full max-w-4xl px-5 py-16 text-center">
        <p className="rounded-xl border border-dashed border-input px-4 py-8 text-sm text-muted-foreground">
          Could not reach the booking API — is it running?
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8 md:py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-[clamp(1.5rem,3.5vw,2rem)]">Orders</h1>
        <p className="text-sm text-muted-foreground">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
          {hasFilters ? " match the filters" : " total"}
        </p>
      </div>

      <form
        method="get"
        className="mt-5 grid items-end gap-3 rounded-2xl border border-input bg-card p-4 sm:grid-cols-[10rem_11rem_minmax(0,1fr)_auto]"
      >
        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={date ?? ""}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="">All statuses</option>
            {STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Name, phone, or order #"
            className="h-10"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="lg">
            Filter
          </Button>
          {hasFilters && (
            <Link
              href="/admin/orders"
              className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-input px-4 py-10 text-center text-sm text-muted-foreground">
          <span aria-hidden className="mb-2 block text-2xl">
            🛍️
          </span>
          No orders{hasFilters ? " match these filters." : " yet."}
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} timeZone={timeZone} />
          ))}
        </ul>
      )}
    </div>
  );
}
