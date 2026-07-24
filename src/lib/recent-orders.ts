/**
 * Orders placed from this device, so a customer can get back to the
 * tracking page without retyping the number. Same shape of store as the
 * cart: module-level, localStorage-persisted, read via `useSyncExternalStore`.
 */

export interface RecentOrder {
  orderNumber: string;
  /** ISO instant the order was placed. */
  placedAt: string;
  /** API-confirmed total, e.g. "93.75". */
  total: string;
}

const STORAGE_KEY = "tavola-recent-orders";
const MAX_ENTRIES = 5;

/** null until the first client read — the lazy load keeps SSR clean. */
let orders: RecentOrder[] | null = null;
const listeners = new Set<() => void>();

const EMPTY: RecentOrder[] = [];

/** Keeps a stale or hand-edited localStorage payload from crashing the UI. */
function parseStored(raw: string | null): RecentOrder[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter(
      (order): order is RecentOrder =>
        typeof order === "object" &&
        order !== null &&
        typeof (order as RecentOrder).orderNumber === "string" &&
        typeof (order as RecentOrder).placedAt === "string" &&
        typeof (order as RecentOrder).total === "string"
    );
  } catch {
    return EMPTY;
  }
}

export function subscribeToRecentOrders(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRecentOrders(): RecentOrder[] {
  orders ??= parseStored(window.localStorage.getItem(STORAGE_KEY));
  return orders;
}

export function getServerRecentOrders(): RecentOrder[] {
  return EMPTY;
}

/** Newest first, capped, deduped by order number. */
export function addRecentOrder(order: RecentOrder): void {
  const next = [
    order,
    ...getRecentOrders().filter(
      (entry) => entry.orderNumber !== order.orderNumber
    ),
  ].slice(0, MAX_ENTRIES);

  orders = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // private mode — the list just won't survive a reload
  }
  for (const listener of listeners) listener();
}
