import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/order";

interface TimelineStep {
  status: OrderStatus;
  label: string;
  detail: string;
}

/** The happy path a pickup order walks through; delivery adds one stop. */
function stepsFor(order: Order): TimelineStep[] {
  const steps: TimelineStep[] = [
    {
      status: "PENDING",
      label: "Order received",
      detail: "Waiting for the restaurant to confirm",
    },
    {
      status: "CONFIRMED",
      label: "Confirmed",
      detail: "The kitchen has accepted your order",
    },
    { status: "PREPARING", label: "Preparing", detail: "Your food is being made" },
  ];

  if (order.type === "DELIVERY") {
    steps.push(
      { status: "READY", label: "Ready", detail: "Packed and waiting for the driver" },
      {
        status: "OUT_FOR_DELIVERY",
        label: "Out for delivery",
        detail: "On its way to you",
      },
      { status: "COMPLETED", label: "Delivered", detail: "Enjoy your meal!" }
    );
  } else {
    steps.push(
      {
        status: "READY",
        label: "Ready for pickup",
        detail: "Come to the counter and quote your order number",
      },
      { status: "COMPLETED", label: "Picked up", detail: "Enjoy your meal!" }
    );
  }

  return steps;
}

export function OrderStatusTimeline({ order }: { order: Order }) {
  const steps = stepsFor(order);
  const currentIndex = steps.findIndex((step) => step.status === order.status);

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === steps.length - 1;

        return (
          <li key={step.status} className="relative flex gap-3.5 pb-6 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-5 left-[0.5625rem] h-full w-0.5",
                  isDone ? "bg-primary" : "bg-border"
                )}
              />
            )}
            <span
              aria-hidden
              className={cn(
                "relative z-10 mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2",
                isDone || isCurrent
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card"
              )}
            >
              {isDone && (
                <svg viewBox="0 0 12 12" className="size-3 fill-none stroke-current stroke-2">
                  <path d="M2.5 6.5 5 9l4.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {isCurrent && (
                <span className="size-1.5 rounded-full bg-primary-foreground" />
              )}
            </span>
            <div className={cn(!isDone && !isCurrent && "opacity-50")}>
              <p className="text-sm leading-5 font-semibold">
                {step.label}
                {isCurrent && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[0.6875rem] font-bold tracking-wider text-primary uppercase">
                    Now
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {step.detail}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
