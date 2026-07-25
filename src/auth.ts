import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import type { UserRole } from "@/types/auth";

// Same server-only base URL the api client uses. NEVER exposed to the browser.
const API_URL = process.env.API_URL ?? "http://localhost:3001";

// Keep the session cookie in step with the backend refresh-token TTL (7d).
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

// Refresh a little before the access token actually expires, so an in-flight
// admin request never rides an already-dead token.
const REFRESH_BUFFER_MS = 30_000;

const REQUEST_TIMEOUT_MS = 10_000;

interface BackendTokens {
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
async function backendLogin(
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

async function backendRefresh(refreshToken: string): Promise<BackendTokens> {
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const email =
          typeof credentials?.email === "string" ? credentials.email : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const result = await backendLogin(email, password);
        if (!result) return null;

        // Everything here flows into the jwt callback as `user` on first sign-in.
        return {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          restaurantId: result.user.restaurantId,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          accessTokenExpires: result.accessTokenExpires,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // First sign-in — copy the backend tokens + identity onto the JWT.
      if (user) {
        token.role = user.role;
        token.restaurantId = user.restaurantId;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = user.accessTokenExpires;
        return token;
      }

      // Access token still fresh — reuse as-is.
      if (Date.now() < token.accessTokenExpires - REFRESH_BUFFER_MS) {
        return token;
      }

      // Otherwise silently reissue from the refresh token.
      try {
        const refreshed = await backendRefresh(token.refreshToken);
        token.accessToken = refreshed.accessToken;
        token.refreshToken = refreshed.refreshToken;
        token.accessTokenExpires = refreshed.accessTokenExpires;
        token.error = undefined;
      } catch {
        // The refresh token is gone/expired — surface it so the guard bounces
        // the user to /admin/login instead of looping on a dead token.
        token.error = "RefreshTokenError";
      }
      return token;
    },
    session({ session, token }) {
      // Deliberately minimal: the backend tokens never reach the browser.
      session.user.role = token.role;
      session.user.restaurantId = token.restaurantId;
      session.error = token.error;
      return session;
    },
  },
});
