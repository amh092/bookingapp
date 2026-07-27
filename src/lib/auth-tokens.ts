import type { UserRole } from "@/types/auth";

/**
 * Backend token protocol for booking-api's /auth endpoints. Server-only —
 * this is the single owner of login/refresh HTTP calls, shared by the
 * NextAuth config (src/auth.ts) and the API client (src/lib/api.ts).
 */

// Same server-only base URL the api client uses. NEVER exposed to the browser.
const API_URL = process.env.API_URL ?? "http://localhost:3001";

// Refresh a little before the access token actually expires, so an in-flight
// admin request never rides an already-dead token.
export const REFRESH_BUFFER_MS = 30_000;

const REQUEST_TIMEOUT_MS = 10_000;

export interface BackendTokens {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    restaurantId: string;
  };
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
}

function isTokens(value: unknown): value is BackendTokens {
  const v = value as Partial<BackendTokens> | null;
  return Boolean(
    v &&
      typeof v.accessToken === "string" &&
      typeof v.refreshToken === "string" &&
      typeof v.accessTokenExpires === "number" &&
      v.user &&
      typeof v.user.id === "string"
  );
}

/** Returns null for bad credentials (401); throws for a service/shape error. */
export async function backendLogin(
  email: string,
  password: string
): Promise<BackendTokens | null> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Login failed (${res.status})`);

  const data: unknown = await res.json();
  if (!isTokens(data)) throw new Error("Unexpected login response");
  return data;
}

export async function backendRefresh(
  refreshToken: string
): Promise<BackendTokens> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!res.ok) throw new Error(`Refresh failed (${res.status})`);

  const data: unknown = await res.json();
  if (!isTokens(data)) throw new Error("Unexpected refresh response");
  return data;
}
