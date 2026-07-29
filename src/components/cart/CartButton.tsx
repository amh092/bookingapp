"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";

import { useCart } from "@/hooks/useCart";

/** Header link to the cart with a live plate count. */
export function CartButton() {
  const { hydrated, count } = useCart();
  const showCount = hydrated && count > 0;

  return (
    <Link
      href="/cart"
      aria-label={showCount ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart"}
      data-tour="cart-button"
      className="relative grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <ShoppingBag aria-hidden className="size-[18px]" />
      {showCount && (
        <span
          aria-hidden
          className="absolute -top-0.5 -right-0.5 grid min-w-[1.125rem] place-items-center rounded-full bg-primary px-1 text-[0.6875rem] font-bold text-primary-foreground"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
