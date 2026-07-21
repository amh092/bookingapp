import { RESTAURANT, REVIEWS } from "@/lib/mock-data";

export function ReviewsSection() {
  return (
    <section className="py-[clamp(3rem,7vw,5rem)]">
      <div className="mx-auto w-full max-w-6xl px-5">
        <div className="mb-8">
          <h2 className="text-[clamp(1.6rem,3.6vw,2.25rem)]">Guest reviews</h2>
          <p className="mt-2 text-muted-foreground">
            Rated {RESTAURANT.rating} out of 5 across {RESTAURANT.ratingCount}{" "}
            guests.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {REVIEWS.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div
                aria-label={`${review.stars} out of 5`}
                className="mb-2.5 tracking-[0.1em] text-primary"
              >
                {"★".repeat(review.stars) + "☆".repeat(5 - review.stars)}
              </div>
              <p>{review.quote}</p>
              <div className="mt-4 flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="grid size-9 place-items-center rounded-full border border-border bg-secondary text-[0.8125rem] font-bold text-muted-foreground"
                >
                  {review.initials}
                </span>
                <div>
                  <div className="text-sm font-semibold">{review.author}</div>
                  <div className="text-xs text-muted-foreground">
                    {review.dinedWhen}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
