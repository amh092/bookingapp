import { cn } from "@/lib/utils";
import type { ReservationStatus } from "@/types/reservation";

const STATUS_STYLES: Record<ReservationStatus, string> = {
  PENDING: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  CONFIRMED: "bg-green-500/15 text-green-700 dark:text-green-400",
  CANCELLED: "bg-red-500/15 text-red-700 dark:text-red-400",
  COMPLETED: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  NO_SHOW: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
};

const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  NO_SHOW: "No-show",
};

export function StatusPill({ status }: { status: ReservationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
