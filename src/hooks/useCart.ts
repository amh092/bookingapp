"use client";

import { useMemo, useSyncExternalStore } from "react";

import {
  addCartLine,
  clearCart,
  getCartLines,
  getServerCartLines,
  removeCartLine,
  setCartNotes,
  setCartQuantity,
  subscribeToCart,
  type CartLine,
} from "@/lib/cart-store";
import { priceToCents } from "@/lib/format";

export interface Cart {
  lines: CartLine[];
  /** False on the server and until hydration — render neutral UI before it. */
  hydrated: boolean;
  /** Total number of plates (sum of quantities). */
  count: number;
  /** Subtotal in whole cents, safe from float drift. */
  subtotalCents: number;
  addLine: typeof addCartLine;
  setQuantity: typeof setCartQuantity;
  setNotes: typeof setCartNotes;
  removeLine: typeof removeCartLine;
  clear: typeof clearCart;
}

const hydratedOnClient = () => true;
const hydratedOnServer = () => false;

export function useCart(): Cart {
  const lines = useSyncExternalStore(
    subscribeToCart,
    getCartLines,
    getServerCartLines
  );
  const hydrated = useSyncExternalStore(
    subscribeToCart,
    hydratedOnClient,
    hydratedOnServer
  );

  return useMemo(
    () => ({
      lines,
      hydrated,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotalCents: lines.reduce(
        (sum, line) => sum + priceToCents(line.price) * line.quantity,
        0
      ),
      addLine: addCartLine,
      setQuantity: setCartQuantity,
      setNotes: setCartNotes,
      removeLine: removeCartLine,
      clear: clearCart,
    }),
    [lines, hydrated]
  );
}
