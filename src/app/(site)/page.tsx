import { AboutSection } from "@/components/site/AboutSection";
import { CtaBand } from "@/components/site/CtaBand";
import { FeaturedDishes } from "@/components/site/FeaturedDishes";
import { Hero } from "@/components/site/Hero";
import { HoursLocation } from "@/components/site/HoursLocation";
import { ReviewsSection } from "@/components/site/ReviewsSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedDishes />
      <AboutSection />
      <CtaBand />
      <HoursLocation />
      <ReviewsSection />
    </>
  );
}
