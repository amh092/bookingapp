"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Kitchen statuses change every few minutes at most — 10s keeps the page
 * feeling live without hammering the API.
 */
const REFRESH_INTERVAL_MS = 10_000;

/**
 * Re-fetches the server-rendered order while it is still in progress, so
 * the tracking page follows the kitchen without manual reloads. Skips
 * ticks while the tab is hidden and catches up the moment it is visible
 * again; renders nothing.
 */
export function OrderStatusRefresher({ active }: { active: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      if (!document.hidden) router.refresh();
    }, REFRESH_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (!document.hidden) router.refresh();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [active, router]);

  return null;
}
