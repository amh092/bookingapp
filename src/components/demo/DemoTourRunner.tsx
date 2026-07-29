"use client";

import { driver as createDriver } from "driver.js";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import {
  DEMO_TOUR_START_EVENT,
  DEMO_TOURS,
  clearTourProgress,
  matchTourPath,
  readTourProgress,
  writeTourProgress,
  type DemoTour,
} from "@/lib/demo-tours";

type DriverInstance = ReturnType<typeof createDriver>;
type PopoverButton = "next" | "previous" | "close";

const ELEMENT_WAIT_MS = 3500;
const ELEMENT_POLL_MS = 150;

/**
 * First on-screen match for a selector. `[inert]` subtrees are skipped so a
 * closed admin drawer (kept mounted off-canvas) never gets highlighted, and
 * `display: none` copies (e.g. the desktop sidebar on mobile) fail the
 * client-rect check.
 */
function findVisible(selector: string): Element | null {
  for (const element of document.querySelectorAll(selector)) {
    if (element.getClientRects().length > 0 && !element.closest("[inert]")) {
      return element;
    }
  }
  return null;
}

function waitForVisible(
  selector: string,
  isCancelled: () => boolean
): Promise<Element | null> {
  return new Promise((resolve) => {
    const deadline = Date.now() + ELEMENT_WAIT_MS;
    const check = () => {
      if (isCancelled()) return resolve(null);
      const element = findVisible(selector);
      if (element) return resolve(element);
      if (Date.now() >= deadline) return resolve(null);
      window.setTimeout(check, ELEMENT_POLL_MS);
    };
    check();
  });
}

/**
 * Drives the active demo tour (see `src/lib/demo-tours.ts`). Mounted once in
 * the root layout so tours can cross between the public site and `/admin`.
 * Progress lives in sessionStorage; each step is its own driver.js instance,
 * and steps on a *different* page advance when that page arrives — so a
 * failed form submit keeps the guide in place instead of losing the visitor.
 */
export function DemoTourRunner() {
  const pathname = usePathname();
  const router = useRouter();
  const driverRef = useRef<DriverInstance | null>(null);
  const removeClickListenerRef = useRef<(() => void) | null>(null);
  // True while WE tear a driver down (next step, navigation). Only the
  // visitor closing the popover (✕ / overlay) should end the tour.
  const internalDestroyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;

    const destroyDriver = () => {
      removeClickListenerRef.current?.();
      removeClickListenerRef.current = null;
      const active = driverRef.current;
      if (!active) return;
      driverRef.current = null;
      internalDestroyRef.current = true;
      active.destroy();
      internalDestroyRef.current = false;
    };

    const finishTour = () => {
      clearTourProgress();
      destroyDriver();
    };

    function advanceFrom(tour: DemoTour, index: number) {
      const nextIndex = index + 1;
      if (nextIndex >= tour.steps.length) {
        finishTour();
        return;
      }
      writeTourProgress(tour.id, nextIndex);
      if (matchTourPath(tour.steps[nextIndex].path, pathname)) {
        void showStep(tour, nextIndex);
      } else {
        // The next step lives on another page — drop the overlay and let the
        // pathname effect resume the tour on arrival.
        destroyDriver();
      }
    }

    async function showStep(tour: DemoTour, index: number) {
      const step = tour.steps[index];
      // An anchor that is in the DOM but invisible is hidden by the viewport
      // (e.g. the desktop sidebar on mobile), not still loading — skip or
      // fall back right away instead of sitting out the poll timeout.
      const hiddenByViewport =
        (step.optional || step.fallbackHref) &&
        document.querySelector(step.element) !== null &&
        !findVisible(step.element);
      const element = hiddenByViewport
        ? null
        : await waitForVisible(step.element, isCancelled);
      if (cancelled) return;

      if (!element) {
        if (step.optional) {
          advanceFrom(tour, index);
          return;
        }
        if (step.fallbackHref) {
          destroyDriver();
          router.push(step.fallbackHref);
          return;
        }
        // Fall through: driver.js centers the popover when the element is
        // missing, so the instructions still reach the visitor.
      }

      destroyDriver();
      const isLast = index === tour.steps.length - 1;
      const showButtons: PopoverButton[] =
        step.advance === "next" ? ["next", "close"] : ["close"];

      const instance = createDriver({
        animate: true,
        smoothScroll: true,
        stagePadding: 6,
        stageRadius: 14,
        overlayOpacity: 0.55,
        // Arrow keys would call driver's own moveNext and skip our advance
        // logic (ending the single-step tour) — advance stays click/button only.
        allowKeyboardControl: false,
        popoverClass: "tavola-tour",
        nextBtnText: isLast ? "Finish" : "Next",
        doneBtnText: isLast ? "Finish" : "Next",
        onNextClick: () => advanceFrom(tour, index),
        onDestroyed: () => {
          if (internalDestroyRef.current) return;
          driverRef.current = null;
          removeClickListenerRef.current?.();
          removeClickListenerRef.current = null;
          clearTourProgress();
        },
        steps: [
          {
            element: element ?? step.element,
            popover: {
              title: step.title,
              description: `<p>${step.description}</p><p class="tavola-tour-progress">${tour.title} — step ${index + 1} of ${tour.steps.length}</p>`,
              side: step.side,
              align: step.align,
              showButtons,
            },
          },
        ],
      });
      driverRef.current = instance;
      instance.drive();

      // "Click" steps advance on any element matching the selector (so every
      // "Add to order" button counts, not just the highlighted one). Steps
      // whose successor is on another page need no listener — arrival advances
      // them, which keeps the guide up when a submit fails validation.
      const next = tour.steps[index + 1] as DemoTour["steps"][number] | undefined;
      const advancesOnThisPage = next && matchTourPath(next.path, pathname);
      if (step.advance === "click" && (advancesOnThisPage || !next)) {
        const onClick = (event: MouseEvent) => {
          const target =
            event.target instanceof Element ? event.target : null;
          if (!target?.closest(step.element)) return;
          document.removeEventListener("click", onClick, true);
          removeClickListenerRef.current = null;
          advanceFrom(tour, index);
        };
        document.addEventListener("click", onClick, true);
        removeClickListenerRef.current = () =>
          document.removeEventListener("click", onClick, true);
      }
    }

    function sync() {
      const progress = readTourProgress();
      if (!progress) {
        destroyDriver();
        return;
      }
      const tour = DEMO_TOURS.find((entry) => entry.id === progress.tourId);
      if (!tour || progress.step >= tour.steps.length) {
        clearTourProgress();
        destroyDriver();
        return;
      }

      let index = progress.step;
      if (!matchTourPath(tour.steps[index].path, pathname)) {
        // Cross-page advance: the visitor navigated (click step or form
        // redirect) — jump to the first upcoming step for this page.
        const ahead = tour.steps.findIndex(
          (step, stepIndex) =>
            stepIndex > index && matchTourPath(step.path, pathname)
        );
        if (ahead === -1) {
          // Off the tour's path — stay dormant until the visitor returns.
          destroyDriver();
          return;
        }
        index = ahead;
        writeTourProgress(tour.id, index);
      }
      void showStep(tour, index);
    }

    sync();
    window.addEventListener(DEMO_TOUR_START_EVENT, sync);
    return () => {
      cancelled = true;
      window.removeEventListener(DEMO_TOUR_START_EVENT, sync);
      destroyDriver();
    };
  }, [pathname, router]);

  return null;
}
