import { cn } from "@/lib/utils";

/** The "photo": a layered gradient plate, like the prototype, until real images exist. */
export function ArtPanel({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-[radial-gradient(120%_90%_at_70%_15%,oklch(0.55_0.12_45/0.55),transparent_60%),linear-gradient(160deg,var(--color-secondary),var(--color-elevated))] shadow-2xl",
        className
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 grid place-items-center text-[clamp(5rem,16vw,9rem)] drop-shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
      >
        🍽️
      </div>
      {children}
    </div>
  );
}
