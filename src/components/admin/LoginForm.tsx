"use client";

import { useActionState } from "react";

import { signInAction, type SignInState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL: SignInState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInAction, INITIAL);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          placeholder="owner@goldenfork.sa"
          aria-invalid={Boolean(state.error)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? "login-error" : undefined}
        />
      </div>

      {state.error && (
        <p
          id="login-error"
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="w-full font-semibold"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
