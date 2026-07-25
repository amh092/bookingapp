"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";

export interface SignInState {
  error?: string;
}

export async function signInAction(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  try {
    // On success this throws a redirect to /admin (rethrown below); on bad
    // credentials it throws an AuthError we map to a friendly message.
    await signIn("credentials", { email, password, redirectTo: "/admin" });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          error.type === "CredentialsSignin"
            ? "Invalid email or password."
            : "We couldn't sign you in right now. Please try again.",
      };
    }
    // Not an AuthError → it's the success redirect; let Next.js handle it.
    throw error;
  }

  return {};
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/admin/login" });
}
