import type { Metadata } from "next";

import { CartView } from "@/components/cart/CartView";
import { RESTAURANT } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: `Your order — ${RESTAURANT.name}`,
  description: "Review your pickup order before checkout.",
};

export default function CartPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 md:py-14">
      <h1 className="text-[clamp(1.75rem,4vw,2.5rem)]">Your order</h1>
      <p className="mt-2 text-muted-foreground">
        Pickup from the restaurant — pay at the counter when you collect.
      </p>
      <CartView />
    </div>
  );
}
