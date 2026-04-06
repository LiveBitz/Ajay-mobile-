import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { NewArrivals } from "@/components/home/NewArrivals";
import { PromoBanner } from "@/components/home/PromoBanner";
import { BestSellers } from "@/components/home/BestSellers";
import { FeaturesStrip } from "@/components/home/FeaturesStrip";
import { NewsletterBanner } from "@/components/home/NewsletterBanner";

export default function Home() {
  return (
    <div className="flex flex-col gap-0 pb-10">
      <HeroBanner />
      <CategoryGrid />
      <NewArrivals />
      <PromoBanner />
      <BestSellers />
      <FeaturesStrip />
      <NewsletterBanner />
    </div>
  );
}
