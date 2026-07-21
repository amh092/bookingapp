import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CtaBand() {
  return (
    <section className="pb-[clamp(3rem,7vw,5rem)]">
      <div className="mx-auto w-full max-w-6xl px-5">
        <div className="grid items-center gap-5 rounded-2xl border border-input bg-card bg-[radial-gradient(100%_140%_at_0%_0%,color-mix(in_oklab,var(--color-primary)_14%,transparent),transparent_55%)] p-8 md:grid-cols-[1fr_auto] md:p-12">
          <div>
            <h2 className="text-[clamp(1.5rem,3.5vw,2rem)]">Ready to book?</h2>
            <p className="mt-2 text-muted-foreground">
              Choose a time that works and we&apos;ll send your confirmation
              code straight away.
            </p>
          </div>
          <Link
            href="/reservations"
            className={cn(
              buttonVariants(),
              "h-11 rounded-full px-6 text-[0.9375rem] font-semibold"
            )}
          >
            Book now
          </Link>
        </div>
      </div>
    </section>
  );
}
