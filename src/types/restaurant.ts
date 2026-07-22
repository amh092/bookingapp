export interface RestaurantInfo {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  timezone: string;
  slotDurationMinutes: number;
  bookingDurationMinutes: number;
  maxGuestsOnline: number;
  bookingWindowDays: number;
  rating: number;
  ratingCount: number;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface BusinessHour {
  /** 0 = Sunday … 6 = Saturday */
  dayOfWeek: DayOfWeek;
  opensAtMinutes: number;
  closesAtMinutes: number;
  isClosed: boolean;
}

export interface RestaurantTable {
  id: string;
  name: string;
  capacity: number;
  section: string;
  isActive: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  position: number;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  isFeatured: boolean;
  isAvailable: boolean;
  preparationMinutes: number;
  tags: string[];
}

export interface Review {
  id: string;
  author: string;
  initials: string;
  stars: number;
  quote: string;
  dinedWhen: string;
}
