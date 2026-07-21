"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  label: string;
}

export function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "rounded-full px-3 py-1.5 text-[0.9375rem] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
        isActive && "bg-secondary text-foreground"
      )}
    >
      {label}
    </Link>
  );
}
