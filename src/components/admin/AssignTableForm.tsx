"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { assignTableAction } from "@/actions/reservations";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { AdminTable } from "@/types/reservation";

interface AssignTableFormProps {
  reservationId: string;
  guests: number;
  currentTableId: string | null;
  /** Active tables offered for assignment; the API re-validates every rule. */
  tables: AdminTable[];
}

export function AssignTableForm({
  reservationId,
  guests,
  currentTableId,
  tables,
}: AssignTableFormProps) {
  const router = useRouter();
  const [tableId, setTableId] = useState(currentTableId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [assigned, setAssigned] = useState(false);
  const [isPending, startTransition] = useTransition();

  function assign() {
    setError(null);
    setAssigned(false);
    startTransition(async () => {
      const result = await assignTableAction({ id: reservationId, tableId });
      if (!result.success) {
        setError(result.error ?? "The assignment failed — try again.");
        return;
      }
      setAssigned(true);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor={`assign-table-${reservationId}`}>Table</Label>
          <select
            id={`assign-table-${reservationId}`}
            value={tableId}
            onChange={(event) => setTableId(event.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="">Choose a table</option>
            {tables.map((table) => (
              <option
                key={table.id}
                value={table.id}
                disabled={table.capacity < guests}
              >
                {table.name} · seats {table.capacity}
                {table.section ? ` · ${table.section}` : ""}
                {table.capacity < guests ? " — too small" : ""}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={isPending || !tableId || tableId === currentTableId}
          onClick={assign}
        >
          {isPending ? "Assigning…" : "Assign"}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {assigned && (
        <p role="status" className="text-sm text-green-700 dark:text-green-400">
          Table updated.
        </p>
      )}
    </div>
  );
}
