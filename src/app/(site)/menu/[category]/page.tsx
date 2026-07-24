import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { MenuUnavailable } from "@/components/menu/MenuUnavailable";
import { CtaBand } from "@/components/site/CtaBand";
import { findCategoryBySlug } from "@/lib/menu";
import { loadPublicMenu } from "@/lib/menu-data";
import { RESTAURANT } from "@/lib/mock-data";

interface MenuCategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({
  params,
}: MenuCategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const menu = await loadPublicMenu();
  const match = menu
    ? findCategoryBySlug(menu, decodeURIComponent(category))
    : null;

  if (!match) return { title: `Menu — ${RESTAURANT.name}` };

  return {
    title: `${match.name} — Menu — ${RESTAURANT.name}`,
    description:
      match.description ??
      `Browse the ${match.name} section of the menu. Prices include VAT.`,
  };
}

export default async function MenuCategoryPage({
  params,
}: MenuCategoryPageProps) {
  const { category } = await params;
  const menu = await loadPublicMenu();
  if (!menu) return <MenuUnavailable />;

  // Inactive categories are absent from the public payload, so a stale link
  // to one lands here too.
  const slug = decodeURIComponent(category);
  const match = findCategoryBySlug(menu, slug);
  if (!match) notFound();

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-5 py-10 md:py-14">
        <h1 className="text-[clamp(1.75rem,4vw,2.5rem)]">The menu</h1>
        <p className="mt-2 text-muted-foreground">
          Prices include VAT. Dishes we&apos;ve run out of today are dimmed.
        </p>
        <MenuBrowser categories={menu} activeSlug={slug} />
      </div>
      <CtaBand />
    </>
  );
}
