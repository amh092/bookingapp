/** Friendly fallback for the public menu pages when the API is unreachable. */
export function MenuUnavailable() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-16 text-center">
      <h1 className="text-[clamp(1.75rem,4vw,2.25rem)]">The menu</h1>
      <p className="mt-4 rounded-xl border border-dashed border-input px-4 py-8 text-sm text-muted-foreground">
        The menu is unavailable right now — please try again in a few minutes.
      </p>
    </div>
  );
}
