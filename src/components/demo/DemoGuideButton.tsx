"use client";

import { Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DEMO_TOUR_START_EVENT,
  DEMO_TOURS,
  writeTourProgress,
  type DemoTour,
} from "@/lib/demo-tours";

/**
 * Floating "Demo tour" button for portfolio visitors: opens a dialog listing
 * everything the site can do; picking an action starts its guided spotlight
 * tour (driven by `DemoTourRunner` in the root layout).
 */
export function DemoGuideButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  function startTour(tour: DemoTour) {
    writeTourProgress(tour.id, 0);
    setOpen(false);
    window.dispatchEvent(new Event(DEMO_TOUR_START_EVENT));
    if (pathname !== tour.startPath) router.push(tour.startPath);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-5 bottom-5 z-40 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg transition-transform outline-none hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Sparkles aria-hidden className="size-4" />
        Demo tour
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take a guided tour</DialogTitle>
            <DialogDescription>
              Pick something to try — a highlight ring will show you exactly
              where to click, step by step.
            </DialogDescription>
          </DialogHeader>
          <ul className="grid gap-2">
            {DEMO_TOURS.map((tour) => (
              <li key={tour.id}>
                <button
                  type="button"
                  onClick={() => startTour(tour)}
                  className="flex w-full items-start gap-3 rounded-xl border border-input bg-card p-3 text-left transition-colors outline-none hover:border-primary/50 hover:bg-secondary/50 focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span aria-hidden className="text-xl leading-none">
                    {tour.emoji}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {tour.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {tour.description}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            You can leave a tour any time with the ✕ on the tip.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
