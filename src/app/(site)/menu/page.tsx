import type { Metadata } from "next";

import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { MenuUnavailable } from "@/components/menu/MenuUnavailable";
import { CtaBand } from "@/components/site/CtaBand";
import { loadPublicMenu } from "@/lib/menu-data";
import { RESTAURANT } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: `Menu — ${RESTAURANT.name}`,
  description:
    "Browse the full menu by category — starters, mains, grills, desserts and drinks. Prices include VAT.",
};

export default async function MenuPage() {
  const menu = await loadPublicMenu();
  if (!menu) return <MenuUnavailable />;

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-5 py-10 md:py-14">
        <h1 className="text-[clamp(1.75rem,4vw,2.5rem)]">The menu</h1>
        <p className="mt-2 text-muted-foreground">
          Prices include VAT. Dishes we&apos;ve run out of today are dimmed.
        </p>
        <MenuBrowser categories={menu} activeSlug={null} />
      </div>
      <CtaBand />
    </>
  );
}
