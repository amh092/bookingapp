"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";

import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start text-muted-foreground"
      disabled={isPending}
      onClick={() => startTransition(() => signOutAction())}
    >
      <LogOut aria-hidden className="size-4 shrink-0" />
      {isPending ? "Signing out…" : "Log out"}
    </Button>
  );
}
