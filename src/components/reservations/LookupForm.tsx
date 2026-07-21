"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LookupForm({ initialCode = "" }: { initialCode?: string }) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed) router.push(`/reservations/manage/${trimmed}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-input bg-card p-5"
    >
      <Label htmlFor="code">Confirmation code</Label>
      <div className="mt-2 flex gap-2">
        <Input
          id="code"
          name="code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="e.g. R7K2QX"
          required
          autoComplete="off"
          className="h-10 font-mono tracking-widest uppercase"
        />
        <Button type="submit" size="lg" className="shrink-0">
          Find booking
        </Button>
      </div>
    </form>
  );
}
