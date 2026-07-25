import { auth } from "@/auth";

/**
 * Route guard for the admin area (Next.js 16's `proxy`, formerly `middleware`).
 *
 * The login page is explicitly allowed through so redirecting an unauthenticated
 * visitor to it can't loop. A session whose silent refresh failed
 * (`RefreshTokenError`) is treated as signed-out and bounced to login.
 */
export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    return; // always renderable, signed in or not
  }

  const signedOut = !req.auth || req.auth.error === "RefreshTokenError";
  if (signedOut) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
