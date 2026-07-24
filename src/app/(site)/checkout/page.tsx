import type { Metadata } from "next";

import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { getRestaurant } from "@/lib/api";
import { RESTAURANT } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: `Checkout — ${RESTAURANT.name}`,
  description: "Confirm your pickup order.",
};

export default async function CheckoutPage() {
  // The pickup location is a nice-to-have — the form still works (and the
  // submit surfaces its own error) if the API is unreachable right now.
  let pickupAddress: string | null = null;
  try {
    pickupAddress = (await getRestaurant()).address;
  } catch {
    pickupAddress = null;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 md:py-14">
      <h1 className="text-[clamp(1.75rem,4vw,2.5rem)]">Checkout</h1>
      <p className="mt-2 text-muted-foreground">
        Pickup order — we&apos;ll start preparing once the restaurant confirms.
      </p>
      <CheckoutForm pickupAddress={pickupAddress} />
    </div>
  );
}
