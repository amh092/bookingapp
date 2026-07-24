import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  CONFIRMED: "bg-green-500/15 text-green-700 dark:text-green-400",
  PREPARING: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  READY: "bg-teal-500/15 text-teal-700 dark:text-teal-400",
  OUT_FOR_DELIVERY: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  COMPLETED: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  CANCELLED: "bg-red-500/15 text-red-700 dark:text-red-400",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  OUT_FOR_DELIVERY: "Out for delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        STATUS_STYLES[status]
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
