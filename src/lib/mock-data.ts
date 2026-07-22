import type {
  BusinessHour,
  MenuCategory,
  MenuItem,
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

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: "cat_1", name: "Appetizers", position: 1, isActive: true },
  { id: "cat_2", name: "Main Courses", position: 2, isActive: true },
  { id: "cat_3", name: "From the Grill", position: 3, isActive: true },
  { id: "cat_4", name: "Desserts", position: 4, isActive: true },
  { id: "cat_5", name: "Drinks", position: 5, isActive: true },
];

function item(
  id: string,
  categoryId: string,
  name: string,
  description: string,
  price: number,
  emoji: string,
  opts: Partial<
    Pick<MenuItem, "isFeatured" | "isAvailable" | "preparationMinutes" | "tags">
  > = {}
): MenuItem {
  return {
    id,
    categoryId,
    name,
    description,
    price,
    emoji,
    isFeatured: opts.isFeatured ?? false,
    isAvailable: opts.isAvailable ?? true,
    preparationMinutes: opts.preparationMinutes ?? 15,
    tags: opts.tags ?? [],
  };
}

export const MENU_ITEMS: MenuItem[] = [
  item("mi_1", "cat_1", "Charred Hummus", "Chickpea purée, smoked olive oil, warm saj bread", 28, "🫓", { isFeatured: true, preparationMinutes: 10, tags: ["Vegetarian"] }),
  item("mi_2", "cat_1", "Muhammara", "Roasted red pepper, walnut, pomegranate molasses", 32, "🌶️", { preparationMinutes: 10, tags: ["Vegan", "Nuts"] }),
  item("mi_3", "cat_1", "Burrata & Tomato", "Heirloom tomato, basil oil, aged balsamic", 46, "🍅", { isFeatured: true, preparationMinutes: 8, tags: ["Vegetarian"] }),
  item("mi_4", "cat_1", "Fried Calamari", "Lemon aioli, crisp herbs", 42, "🦑", { preparationMinutes: 14 }),
  item("mi_5", "cat_2", "Truffle Mushroom Risotto", "Arborio rice, wild mushroom, parmesan", 68, "🍄", { isFeatured: true, preparationMinutes: 22, tags: ["Vegetarian"] }),
  item("mi_6", "cat_2", "Seafood Linguine", "Prawns, clams, chilli, white wine reduction", 84, "🍝", { preparationMinutes: 20, tags: ["Shellfish"] }),
  item("mi_7", "cat_2", "Wood-fired Margherita", "San Marzano, fior di latte, basil", 52, "🍕", { preparationMinutes: 12, tags: ["Vegetarian"] }),
  item("mi_8", "cat_2", "Lamb Ouzi Rice", "Slow-cooked lamb shoulder, spiced rice, almonds", 96, "🍛", { preparationMinutes: 25, tags: ["Nuts"] }),
  item("mi_9", "cat_3", "Mixed Grill Platter", "Kofta, shish tawook, lamb chop, grilled vegetables", 145, "🍢", { isFeatured: true, preparationMinutes: 28 }),
  item("mi_10", "cat_3", "Ribeye 400g", "Dry-aged, rosemary butter, triple-cooked chips", 189, "🥩", { preparationMinutes: 30 }),
  item("mi_11", "cat_3", "Grilled Sea Bass", "Whole fish, lemon, charred fennel", 128, "🐟", { preparationMinutes: 26 }),
  item("mi_12", "cat_3", "Chicken Shish", "Garlic marinade, sumac onion, flatbread", 74, "🍗", { preparationMinutes: 20 }),
  item("mi_13", "cat_4", "Pistachio Basbousa", "Semolina cake, orange blossom syrup, clotted cream", 34, "🍰", { isFeatured: true, preparationMinutes: 8, tags: ["Nuts"] }),
  item("mi_14", "cat_4", "Dark Chocolate Fondant", "Salted caramel, vanilla gelato", 38, "🍫", { preparationMinutes: 15 }),
  item("mi_15", "cat_4", "Seasonal Sorbet", "Three scoops, seasonal fruit", 26, "🍧", { preparationMinutes: 5, tags: ["Vegan"] }),
  item("mi_16", "cat_5", "Mint Lemonade", "Fresh mint, house lemonade", 22, "🍹", { preparationMinutes: 5, tags: ["Vegan"] }),
  item("mi_17", "cat_5", "Arabic Coffee", "Cardamom, served with dates", 18, "☕", { preparationMinutes: 5 }),
  item("mi_18", "cat_5", "Hibiscus Iced Tea", "Cold brewed, light honey", 20, "🧋", { isAvailable: false, preparationMinutes: 5 }),
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

export const FEATURED_ITEMS: MenuItem[] = MENU_ITEMS.filter(
  (menuItem) => menuItem.isFeatured
);

export const ACTIVE_TABLE_COUNT = TABLES.filter(
  (table) => table.isActive
).length;
