"use client";

import { Check, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/menu";

/** Per-dish "Add to order" control on the menu cards. */
export function AddToCartButton({ dish }: { dish: MenuItem }) {
  const { addLine } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    []
  );

  const handleAdd = () => {
    addLine({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      imageUrl: dish.imageUrl,
    });
    setJustAdded(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={cn(
        "mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        justAdded
          ? "border-transparent bg-green-600/15 text-green-700 dark:text-green-400"
          : "border-input text-foreground hover:border-transparent hover:bg-primary hover:text-primary-foreground"
      )}
    >
      {justAdded ? (
        <>
          <Check aria-hidden className="size-4" />
          Added to order
        </>
      ) : (
        <>
          <Plus aria-hidden className="size-4" />
          Add to order
        </>
      )}
    </button>
  );
}
