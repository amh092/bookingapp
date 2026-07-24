"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { DishCard } from "@/components/menu/DishCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { categorySlug } from "@/lib/menu";
import { cn } from "@/lib/utils";
import type { PublicMenuCategory } from "@/types/menu";

interface MenuBrowserProps {
  /** Every active category, for the filter chips. */
  categories: PublicMenuCategory[];
  /** Slug of the selected category, or null for the whole menu. */
  activeSlug: string | null;
}

function CategoryChip({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        isActive
          ? "border-transparent bg-primary font-semibold text-primary-foreground"
          : "border-input text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}

/**
 * Client shell of the public menu: local search over the fetched dishes plus
 * category chips that link to `/menu` and `/menu/[category]`.
 */
export function MenuBrowser({ categories, activeSlug }: MenuBrowserProps) {
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();

  const visibleCategories = activeSlug
    ? categories.filter((category) => categorySlug(category.name) === activeSlug)
    : categories;

  const sections = visibleCategories
    .map((category) => ({
      category,
      items: category.items.filter(
        (item) =>
          !search ||
          item.name.toLowerCase().includes(search) ||
          (item.nameAr ?? "").includes(query.trim()) ||
          (item.description ?? "").toLowerCase().includes(search) ||
          item.dietaryTags.some((tag) => tag.toLowerCase().includes(search))
      ),
    }))
    .filter((section) => section.items.length > 0);

  const shownCount = sections.reduce(
    (count, section) => count + section.items.length,
    0
  );

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative md:max-w-xs md:flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Label htmlFor="menu-search" className="sr-only">
            Search the menu
          </Label>
          <Input
            id="menu-search"
            type="search"
            placeholder="Search the menu"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 pl-9"
          />
        </div>

        <nav aria-label="Menu categories" className="flex flex-wrap gap-2">
          <CategoryChip href="/menu" label="All" isActive={activeSlug === null} />
          {categories.map((category) => {
            const slug = categorySlug(category.name);
            return (
              <CategoryChip
                key={category.id}
                href={`/menu/${slug}`}
                label={category.name}
                isActive={slug === activeSlug}
              />
            );
          })}
        </nav>
      </div>

      <p role="status" className="sr-only">
        {shownCount} {shownCount === 1 ? "dish" : "dishes"} shown
      </p>

      {sections.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-input px-4 py-12 text-center text-sm text-muted-foreground">
          <span aria-hidden className="mb-2 block text-2xl">
            🍽️
          </span>
          <strong className="block text-foreground">
            No dishes match your search
          </strong>
          Try another word, or pick a different category.
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {sections.map(({ category, items }) => (
            <section key={category.id} aria-labelledby={`menu-${category.id}`}>
              <h2
                id={`menu-${category.id}`}
                className="text-[clamp(1.35rem,3vw,1.75rem)]"
              >
                {category.name}
              </h2>
              {category.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {category.description}
                </p>
              )}
              <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-5">
                {items.map((item) => (
                  <DishCard key={item.id} dish={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
