import type { Metadata } from "next";

import { LookupForm } from "@/components/reservations/LookupForm";
import { RESTAURANT } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: `Manage booking — ${RESTAURANT.name}`,
};

export default function ManageLookupPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 md:py-14">
      <h1 className="text-[clamp(1.75rem,4vw,2.25rem)]">Manage a booking</h1>
      <p className="mt-2 text-muted-foreground">
        Enter the confirmation code from your booking to view or cancel it.
      </p>
      <div className="mt-6">
        <LookupForm />
      </div>
    </div>
  );
}
