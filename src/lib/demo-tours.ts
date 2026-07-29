export type TourAdvance = "click" | "next";
export type TourSide = "top" | "right" | "bottom" | "left";
export type TourAlign = "start" | "center" | "end";

export interface DemoTourStep {
  /** Pathname pattern(s) this step happens on: `"/x"` exact, `"/x/*"` nested. */
  path: string | string[];
  /** CSS selector of the highlighted element (the `data-tour` anchors). */
  element: string;
  title: string;
  /** Plain text/HTML rendered inside the popover. */
  description: string;
  /**
   * "click" — the visitor advances by clicking the highlighted element
   * (cross-page clicks advance when the next page arrives).
   * "next" — the popover shows a Next button.
   */
  advance: TourAdvance;
  side?: TourSide;
  align?: TourAlign;
  /** Skip this step when its element is not visible (e.g. mobile). */
  optional?: boolean;
  /** Navigate here instead when a "click" target is not visible (e.g. mobile). */
  fallbackHref?: string;
}

export interface DemoTour {
  id: string;
  emoji: string;
  title: string;
  description: string;
  /** Where the tour begins; the guide button navigates here on start. */
  startPath: string;
  steps: DemoTourStep[];
}

export interface DemoTourProgress {
  tourId: string;
  step: number;
}

/** `"/x"` matches exactly; `"/x/*"` matches nested paths like `/x/abc`. */
export function matchTourPath(
  pattern: string | string[],
  pathname: string
): boolean {
  if (Array.isArray(pattern)) {
    return pattern.some((entry) => matchTourPath(entry, pathname));
  }
  if (pattern.endsWith("/*")) {
    const base = pattern.slice(0, -2);
    return pathname.startsWith(`${base}/`) && pathname.length > base.length + 1;
  }
  return pathname === pattern;
}

const STORAGE_KEY = "tavola.demoTour";

/** Fired on `window` after progress is written, so the runner re-syncs. */
export const DEMO_TOUR_START_EVENT = "tavola:demo-tour-start";

/**
 * Contact details pre-filled into tour forms (see `useDemoTourPrefill`) so
 * visitors click through instead of typing. No email on purpose — a fake
 * address would make the API send confirmation mail to a dead domain.
 */
export const DEMO_TOUR_CONTACT = {
  name: "Demo Visitor",
  phone: "+966 55 000 0000",
};

export function activeDemoTourId(): string | null {
  return readTourProgress()?.tourId ?? null;
}

export function readTourProgress(): DemoTourProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "tourId" in parsed &&
      typeof parsed.tourId === "string" &&
      "step" in parsed &&
      typeof parsed.step === "number"
    ) {
      return { tourId: parsed.tourId, step: parsed.step };
    }
    return null;
  } catch {
    return null;
  }
}

export function writeTourProgress(tourId: string, step: number): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ tourId, step }));
  } catch {
    // Storage unavailable (private mode) — the tour just won't survive navigation.
  }
}

export function clearTourProgress(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}

const MENU_PATHS = ["/menu", "/menu/*"];

export const DEMO_TOURS: DemoTour[] = [
  {
    id: "book-table",
    emoji: "🍽️",
    title: "Book a table",
    description:
      "Reserve a table in under a minute and get a confirmation code.",
    startPath: "/reservations",
    steps: [
      {
        path: "/reservations",
        element: '[data-tour="guest-count"]',
        title: "Choose your party size",
        description: "Click the number of guests joining you.",
        advance: "click",
        side: "bottom",
      },
      {
        path: "/reservations",
        element: '[data-tour="date-strip"]',
        title: "Pick a date",
        description: "Click a day — greyed-out days are closed.",
        advance: "click",
        side: "bottom",
      },
      {
        path: "/reservations",
        element: '[data-tour="slot-grid"]',
        title: "Choose a time",
        description:
          "Only times with a free table for your party show up. Click one.",
        advance: "click",
        side: "bottom",
      },
      {
        path: "/reservations",
        element: '[data-tour="booking-details"]',
        title: "Your details",
        description:
          "We've pre-filled demo contact details for you — adjust them if you like, then press Next.",
        advance: "next",
      },
      {
        path: "/reservations",
        element: '[data-tour="booking-submit"]',
        title: "Confirm it",
        description: "Click to create the reservation.",
        advance: "click",
        side: "left",
      },
      {
        path: "/reservations/confirmation/*",
        element: '[data-tour="confirmation-code"]',
        title: "You're booked!",
        description:
          "This code is the key to your booking — with an email on the form, it lands in your inbox too.",
        advance: "next",
        side: "bottom",
      },
      {
        path: "/reservations/confirmation/*",
        element: '[data-tour="manage-booking-link"]',
        title: "Manage the booking",
        description: "Click here to open the booking you just made.",
        advance: "click",
        side: "bottom",
      },
      {
        path: "/reservations/manage/*",
        element: '[data-tour="cancel-booking"]',
        title: "Cancel any time",
        description:
          "From here you can cancel the booking — free up to 2 hours before. That's the whole flow!",
        advance: "next",
        side: "bottom",
      },
    ],
  },
  {
    id: "manage-booking",
    emoji: "📋",
    title: "Find & manage a booking",
    description:
      "Look up an existing reservation by confirmation code or phone.",
    startPath: "/reservations/manage",
    steps: [
      {
        path: "/reservations/manage",
        element: '[data-tour="lookup-form"]',
        title: "Look up your booking",
        description:
          "Enter a confirmation code, or switch to phone search to list your upcoming bookings. Open one and the guide continues there.",
        advance: "next",
        side: "bottom",
      },
      {
        path: "/reservations/manage/*",
        element: '[data-tour="cancel-booking"]',
        title: "Your booking",
        description:
          "Details, status, and a cancel button when the booking is still upcoming. That's it!",
        advance: "next",
        side: "bottom",
      },
    ],
  },
  {
    id: "order-pickup",
    emoji: "🛍️",
    title: "Order food for pickup",
    description: "Browse the menu, build a cart and place a pickup order.",
    startPath: "/menu",
    steps: [
      {
        path: MENU_PATHS,
        element: '[data-tour="menu-controls"]',
        title: "Browse the menu",
        description:
          "Search dishes or filter by category — featured dishes carry a badge.",
        advance: "next",
        side: "bottom",
      },
      {
        path: MENU_PATHS,
        element: '[data-tour="add-to-cart"]',
        title: "Add a dish",
        description: 'Click "Add to order" on any dish you like.',
        advance: "click",
        side: "bottom",
      },
      {
        path: MENU_PATHS,
        element: '[data-tour="cart-button"]',
        title: "Open your cart",
        description: "Your order lives up here — click the bag to review it.",
        advance: "click",
        side: "bottom",
      },
      {
        path: "/cart",
        element: '[data-tour="checkout-link"]',
        title: "Check out",
        description:
          "Adjust quantities or add kitchen notes above, then continue to checkout.",
        advance: "click",
        side: "top",
      },
      {
        path: "/checkout",
        element: '[data-tour="checkout-form"]',
        title: "Your details",
        description:
          "We've pre-filled demo contact details for you — adjust them if you like, then press Next.",
        advance: "next",
      },
      {
        path: "/checkout",
        element: '[data-tour="place-order"]',
        title: "Place the order",
        description: "Click to send your pickup order to the kitchen.",
        advance: "click",
        side: "top",
      },
      {
        path: "/orders/*",
        element: '[data-tour="order-status"]',
        title: "Track it live",
        description:
          "This page updates by itself as staff move your order along — no refresh needed. Done!",
        advance: "next",
        side: "bottom",
      },
    ],
  },
  {
    id: "track-order",
    emoji: "📦",
    title: "Track an order",
    description: "Find an existing pickup order and watch its status.",
    startPath: "/orders",
    steps: [
      {
        path: "/orders",
        element: '[data-tour="order-lookup"]',
        title: "Find your order",
        description:
          "Enter the order number from checkout, or your phone number — orders placed on this device also appear below.",
        advance: "next",
        side: "bottom",
      },
    ],
  },
  {
    id: "admin-panel",
    emoji: "🔐",
    title: "Explore the staff panel",
    description:
      "Sign in with the demo staff account and run the reservation book.",
    startPath: "/admin/login",
    steps: [
      {
        path: "/admin/login",
        element: '[data-tour="login-submit"]',
        title: "Sign in",
        description:
          "The demo staff account is pre-filled — just click Sign in.",
        advance: "click",
        side: "bottom",
      },
      {
        path: "/admin",
        element: '[data-tour="admin-stats"]',
        title: "Today at a glance",
        description:
          "Bookings, guests expected, pending requests and no-show rate for the day.",
        advance: "next",
        side: "bottom",
      },
      {
        path: "/admin",
        element: '[data-tour="admin-nav"]',
        title: "Everything staff need",
        description:
          "Reservations, a booking calendar, the menu and incoming orders — all in one sidebar.",
        advance: "next",
        side: "right",
        optional: true,
      },
      {
        path: "/admin",
        element: '[data-tour="admin-nav-reservations"]',
        title: "Open the reservation book",
        description: "Click Reservations to manage bookings.",
        advance: "click",
        side: "right",
        fallbackHref: "/admin/reservations",
      },
      {
        path: "/admin/reservations",
        element: '[data-tour="reservation-filters"]',
        title: "Filter the book",
        description:
          "Narrow bookings by date, status, or search by name, phone or booking number.",
        advance: "next",
        side: "bottom",
      },
      {
        path: "/admin/reservations",
        element: '[data-tour="reservation-list"]',
        title: "Run the service",
        description:
          "Confirm, complete or mark bookings as no-show — click any row for details, table assignment and rescheduling. Tour complete!",
        advance: "next",
        side: "top",
      },
    ],
  },
];
