import { ArtPanel } from "@/components/site/ArtPanel";
import { RESTAURANT } from "@/lib/mock-data";

const HIGHLIGHTS = [
  { emoji: "🔥", text: "Traditional wood-fired oven" },
  { emoji: "🌿", text: "Seasonal, locally sourced produce" },
  { emoji: "🥂", text: "Private room for events" },
];

export function AboutSection() {
  return (
    <section className="py-[clamp(3rem,7vw,5rem)]">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 lg:grid-cols-2">
        <div>
          <h2 className="text-[clamp(1.6rem,3.6vw,2.25rem)]">
            About {RESTAURANT.name}
          </h2>
          <p className="my-4 text-muted-foreground">{RESTAURANT.description}</p>
          <ul className="space-y-2.5">
            {HIGHLIGHTS.map((highlight) => (
              <li key={highlight.text} className="flex items-center gap-2">
                <span aria-hidden>{highlight.emoji}</span>
                {highlight.text}
              </li>
            ))}
          </ul>
        </div>
        <ArtPanel className="aspect-[4/3]" />
      </div>
    </section>
  );
}
