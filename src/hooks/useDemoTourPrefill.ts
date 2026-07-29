"use client";

import { useEffect, useState } from "react";

import {
  DEMO_TOUR_CONTACT,
  DEMO_TOUR_START_EVENT,
  activeDemoTourId,
} from "@/lib/demo-tours";

/**
 * Demo contact details for a form step of a guided tour: `null` normally,
 * `DEMO_TOUR_CONTACT` once the given tour is running. Resolved after
 * hydration (sessionStorage is client-only) and again when a tour starts on
 * the current page, so forms can remount with pre-filled defaults.
 */
export function useDemoTourPrefill(
  tourId: string
): typeof DEMO_TOUR_CONTACT | null {
  const [contact, setContact] = useState<typeof DEMO_TOUR_CONTACT | null>(null);

  useEffect(() => {
    const sync = () => {
      if (activeDemoTourId() === tourId) setContact(DEMO_TOUR_CONTACT);
    };
    sync();
    window.addEventListener(DEMO_TOUR_START_EVENT, sync);
    return () => window.removeEventListener(DEMO_TOUR_START_EVENT, sync);
  }, [tourId]);

  return contact;
}
