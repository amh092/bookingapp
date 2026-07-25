import { handlers } from "@/auth";

// The Auth.js catch-all route: /api/auth/* (session, callback, csrf, signout…).
export const { GET, POST } = handlers;
