import type {
  BusinessHour,
  RestaurantInfo,
  RestaurantTable,
  Review,
} from "@/types/restaurant";

/**
 * Mock data ported from prototype/assets/js/data.js, shaped like the Prisma
 * models in context/project-spec.md so it can be swapped for API responses
 * once the backend exists.
 */

export const RESTAURANT: RestaurantInfo = {
  name: "Tavola",
  tagline: "Wood-fired Mediterranean, served family style",
  description:
    "An open wood-fired kitchen, seasonal produce from local farms, and plates built for sharing. Open daily except Tuesday.",
  phone: "+966 55 123 4567",
  email: "hello@tavola.example",
  address: "1204 Prince Turki Rd, Al Khobar",
  timezone: "Asia/Riyadh",
  slotDurationMinutes: 30,
  bookingDurationMinutes: 90,
  maxGuestsOnline: 10,
  bookingWindowDays: 30,
  rating: 4.8,
  ratingCount: 620,
};

// Tuesday off; late nights Thu–Sat; Friday service starts after prayers.
export const BUSINESS_HOURS: BusinessHour[] = ([0, 1, 2, 3, 4, 5, 6] as const).map(
  (dayOfWeek) => ({
    dayOfWeek,
    opensAtMinutes: dayOfWeek === 5 ? 13 * 60 : 12 * 60,
    closesAtMinutes: dayOfWeek >= 4 ? 24 * 60 : 23 * 60,
    isClosed: dayOfWeek === 2,
  })
);

export const TABLES: RestaurantTable[] = [
  { id: "tbl_1", name: "Table 1", capacity: 2, section: "Window", isActive: true },
  { id: "tbl_2", name: "Table 2", capacity: 2, section: "Window", isActive: true },
  { id: "tbl_3", name: "Table 3", capacity: 4, section: "Main hall", isActive: true },
  { id: "tbl_4", name: "Table 4", capacity: 4, section: "Main hall", isActive: true },
  { id: "tbl_5", name: "Table 5", capacity: 4, section: "Terrace", isActive: true },
  { id: "tbl_6", name: "Family Table", capacity: 6, section: "Main hall", isActive: true },
  { id: "tbl_7", name: "Terrace 2", capacity: 6, section: "Terrace", isActive: false },
  { id: "tbl_8", name: "VIP Table", capacity: 8, section: "Private room", isActive: true },
  { id: "tbl_9", name: "Chef's Counter", capacity: 10, section: "Kitchen", isActive: true },
];

export const REVIEWS: Review[] = [
  {
    id: "rev_1",
    author: "Layla A.",
    initials: "LA",
    stars: 5,
    quote:
      "Booked at 6pm, table was ready at 6pm. The mixed grill is worth the trip on its own.",
    dinedWhen: "Dined last week",
  },
  {
    id: "rev_2",
    author: "Hassan K.",
    initials: "HK",
    stars: 5,
    quote:
      "Booking for eight people is usually a phone-call marathon. Took two minutes here.",
    dinedWhen: "Dined this month",
  },
  {
    id: "rev_3",
    author: "Nora Z.",
    initials: "NZ",
    stars: 4,
    quote:
      "Terrace was full so we sat inside — still a great night. Loved the pistachio basbousa.",
    dinedWhen: "Dined this month",
  },
];

export const ACTIVE_TABLE_COUNT = TABLES.filter(
  (table) => table.isActive
).length;
