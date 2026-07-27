import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import {
  backendLogin,
  backendRefresh,
  REFRESH_BUFFER_MS,
} from "@/lib/auth-tokens";

// Keep the session cookie in step with the backend refresh-token TTL (7d).
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

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
