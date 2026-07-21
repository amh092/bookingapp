"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { cancelReservationAction } from "@/actions/reservations";
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

interface CancelReservationButtonProps {
  id: string;
  confirmationCode: string;
}

export function CancelReservationButton({
  id,
  confirmationCode,
}: CancelReservationButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirmCancel() {
    startTransition(async () => {
      const result = await cancelReservationAction(id, confirmationCode);
      if (!result.success) {
        setError(result.error ?? "Could not cancel the booking.");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" />}>
        Cancel booking
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this booking?</DialogTitle>
          <DialogDescription>
            Your table will be released and this cannot be undone. You can
            always book a new table later.
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
            onClick={confirmCancel}
          >
            {isPending ? "Cancelling…" : "Cancel booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
