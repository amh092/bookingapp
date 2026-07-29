"use client";

import { useActionState } from "react";

import { signInAction, type SignInState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL: SignInState = {};

interface LoginFormProps {
  /** Demo credentials pre-filled for portfolio visitors; empty in normal use. */
  defaultEmail?: string;
  defaultPassword?: string;
}

export function LoginForm({ defaultEmail, defaultPassword }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(signInAction, INITIAL);
  const hasDemoCredentials = Boolean(defaultEmail && defaultPassword);

  return (
    <form action={formAction} className="space-y-4">
      {hasDemoCredentials && (
        <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-muted-foreground">
          Demo account pre-filled — just press <b>Sign in</b> to try the admin
          panel.
        </p>
      )}

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
          defaultValue={defaultEmail}
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
          defaultValue={defaultPassword}
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
        data-tour="login-submit"
        className="w-full font-semibold"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
