"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { MenuActionResult } from "@/actions/menu";
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

interface ConfirmDeleteDialogProps {
  /** Visible label of the trigger button, e.g. "Delete". */
  triggerLabel: string;
  /** Accessible name when several delete buttons share a page. */
  triggerAriaLabel?: string;
  title: string;
  /** Explains the consequence — and when deactivation is the safer choice. */
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<MenuActionResult>;
}

/**
 * Accessible destructive-action dialog: explains the consequence, runs the
 * server action and surfaces backend conflicts (409s) instead of failing
 * silently.
 */
export function ConfirmDeleteDialog({
  triggerLabel,
  triggerAriaLabel,
  title,
  description,
  confirmLabel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirm() {
    setError(null);
    startTransition(async () => {
      const result = await onConfirm();
      if (!result.success) {
        setError(result.error ?? "The delete failed — try again.");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setError(null);
      }}
    >
      <DialogTrigger
        render={
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive"
            aria-label={triggerAriaLabel}
          />
        }
      >
        {triggerLabel}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Keep it</DialogClose>
          <Button variant="destructive" disabled={isPending} onClick={confirm}>
            {isPending ? "Deleting…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
