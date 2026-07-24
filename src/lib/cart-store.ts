/**
 * The customer's cart: a module-level store persisted to localStorage, read
 * by components through `useSyncExternalStore` (see `useCart`). Client-side
 * only — the server always sees an empty cart.
 */

/** Matches the backend's per-line quantity ceiling. */
export const MAX_LINE_QUANTITY = 20;

export interface CartLine {
  menuItemId: string;
  /** Dish snapshot for display — the API reprices from the DB at checkout. */
  name: string;
  /** Two-decimal string as the menu returns it, e.g. "28.50". */
  price: string;
  imageUrl: string | null;
  quantity: number;
  notes: string;
}

const STORAGE_KEY = "tavola-cart";

/** null until the first client read — the lazy load keeps SSR clean. */
let lines: CartLine[] | null = null;
const listeners = new Set<() => void>();

const EMPTY: CartLine[] = [];

/** Keeps a stale or hand-edited localStorage payload from crashing the UI. */
function parseStoredLines(raw: string | null): CartLine[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter(
      (line): line is CartLine =>
        typeof line === "object" &&
        line !== null &&
        typeof (line as CartLine).menuItemId === "string" &&
        typeof (line as CartLine).name === "string" &&
        typeof (line as CartLine).price === "string" &&
        typeof (line as CartLine).quantity === "number" &&
        (line as CartLine).quantity >= 1 &&
        typeof (line as CartLine).notes === "string"
    );
  } catch {
    return EMPTY;
  }
}

function commit(next: CartLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // private mode — the cart still works, it just won't survive a reload
  }
  for (const listener of listeners) listener();
}

export function subscribeToCart(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCartLines(): CartLine[] {
  lines ??= parseStoredLines(window.localStorage.getItem(STORAGE_KEY));
  return lines;
}

export function getServerCartLines(): CartLine[] {
  return EMPTY;
}

export function addCartLine(dish: {
  id: string;
  name: string;
  price: string;
  imageUrl: string | null;
}): void {
  const current = getCartLines();
  const existing = current.find((line) => line.menuItemId === dish.id);
  commit(
    existing
      ? current.map((line) =>
          line.menuItemId === dish.id
            ? {
                ...line,
                quantity: Math.min(line.quantity + 1, MAX_LINE_QUANTITY),
              }
            : line
        )
      : [
          ...current,
          {
            menuItemId: dish.id,
            name: dish.name,
            price: dish.price,
            imageUrl: dish.imageUrl,
            quantity: 1,
            notes: "",
          },
        ]
  );
}

/** A quantity below 1 removes the line. */
export function setCartQuantity(menuItemId: string, quantity: number): void {
  const current = getCartLines();
  commit(
    quantity < 1
      ? current.filter((line) => line.menuItemId !== menuItemId)
      : current.map((line) =>
          line.menuItemId === menuItemId
            ? { ...line, quantity: Math.min(quantity, MAX_LINE_QUANTITY) }
            : line
        )
  );
}

export function setCartNotes(menuItemId: string, notes: string): void {
  commit(
    getCartLines().map((line) =>
      line.menuItemId === menuItemId ? { ...line, notes } : line
    )
  );
}

export function removeCartLine(menuItemId: string): void {
  commit(getCartLines().filter((line) => line.menuItemId !== menuItemId));
}

export function clearCart(): void {
  commit(EMPTY);
}
