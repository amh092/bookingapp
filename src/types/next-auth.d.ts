import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/types/auth";

/**
 * Module augmentation for Auth.js.
 *
 * The backend access/refresh tokens live ONLY on the encrypted JWT, never on
 * the `Session` — anything on `Session` is shipped to the browser via
 * `/api/auth/session`. The session exposes only `role`, `restaurantId`, and a
 * refresh `error` flag.
 */
declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole;
      restaurantId: string;
    } & DefaultSession["user"];
    error?: "RefreshTokenError";
  }

  /** What the Credentials `authorize` returns on a successful login. */
  interface User {
    role: UserRole;
    restaurantId: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    restaurantId: string;
    accessToken: string;
    refreshToken: string;
    /** Epoch ms; the jwt callback refreshes shortly before this. */
    accessTokenExpires: number;
    error?: "RefreshTokenError";
  }
}
