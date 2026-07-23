"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  adminReservationAction,
  type AdminReservationCommand,
} from "@/actions/reservations";
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
import type { ReservationStatus } from "@/types/reservation";

interface ReservationActionsProps {
  id: string;
  status: ReservationStatus;
  customerName: string;
  /** Whether the booking's slot is already over (decided server-side). */
  isPast?: boolean;
}

export function ReservationActions({
  id,
  status,
  customerName,
  isPast = false,
}: ReservationActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [dialogFor, setDialogFor] = useState<AdminReservationCommand | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  function run(command: AdminReservationCommand) {
    setError(null);
    startTransition(async () => {
      const result = await adminReservationAction(id, command);
      if (!result.success) {
        setError(result.error ?? "The action failed — try again.");
        return;
      }
      setDialogFor(null);
      router.refresh();
    });
  }

  const active = status === "PENDING" || status === "CONFIRMED";
  if (!active) return null;

  // Once the slot is over, "Confirm" is meaningless — a stale pending booking is
  // closed out with Cancel instead. Complete / No-show / Cancel stay available,
  // since those are exactly the after-the-fact actions staff take for past bookings.

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap justify-end gap-1.5">
        {status === "PENDING" && !isPast && (
          <Button size="sm" disabled={isPending} onClick={() => run("confirm")}>
            Confirm
          </Button>
        )}
        {status === "CONFIRMED" && (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => run("complete")}
          >
            Complete
          </Button>
        )}
        <Dialog
          open={dialogFor !== null}
          onOpenChange={(open) => !open && setDialogFor(null)}
        >
          {status === "CONFIRMED" && (
            <DialogTrigger
              render={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDialogFor("no-show")}
                />
              }
            >
              No-show
            </DialogTrigger>
          )}
          <DialogTrigger
            render={
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => setDialogFor("cancel")}
              />
            }
          >
            Cancel
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogFor === "no-show"
                  ? `Mark ${customerName} as a no-show?`
                  : `Cancel ${customerName}'s booking?`}
              </DialogTitle>
              <DialogDescription>
                {dialogFor === "no-show"
                  ? "The table is released and the booking is recorded as a no-show. This cannot be undone."
                  : "The table is released and the customer's booking is cancelled. This cannot be undone."}
              </DialogDescription>
            </DialogHeader>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Keep booking
              </DialogClose>
              <Button
                variant="destructive"
                disabled={isPending}
                onClick={() => dialogFor && run(dialogFor)}
              >
                {isPending
                  ? "Working…"
                  : dialogFor === "no-show"
                    ? "Mark no-show"
                    : "Cancel booking"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {error && dialogFor === null && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
