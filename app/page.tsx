import { HeroBanner } from "@/components/home/HeroBanner";
import { NewArrivals } from "@/components/home/NewArrivals";
import { PromoBanner } from "@/components/home/PromoBanner";
import { HurryUpSection } from "@/components/home/HurryUpSection";
import { FeaturesStrip } from "@/components/home/FeaturesStrip";
import { NewsletterBanner } from "@/components/home/NewsletterBanner";
import { BrandCarousel } from "@/components/home/BrandCarousel";
import { BestSellersSection } from "@/components/home/BestSellersSection";
import { FeaturedCategoriesSection } from "@/components/home/FeaturedCategoriesSection";
import { getBanners } from "@/lib/actions/banner-actions";
import { getCategories } from "@/lib/actions/category-actions";

// ✅ PHASE 2: Static regeneration - revalidate home page every 30 minutes
export const revalidate = 1800;

export default async function Home() {
  const heroBanners = await getBanners("HERO");
  const promoBanners = await getBanners("PROMO");
  const newsletterBanners = await getBanners("NEWSLETTER");
  const dbCategories = await getCategories();
  
  // Use the first active promo banner for the section
  const activePromo = promoBanners.length > 0 ? promoBanners[0] : null;

  // Use the first active newsletter banner
  const activeNewsletter = newsletterBanners.length > 0 ? newsletterBanners[0] : null;

  return (
    <div className="flex flex-col gap-0 bg-[#FFE4EB]">
      <FeaturedCategoriesSection />
      <HeroBanner banners={heroBanners} />
      <HurryUpSection />
      <BrandCarousel categories={dbCategories} />
      <BestSellersSection />
      <NewArrivals />
      <PromoBanner banner={activePromo} />
      <FeaturesStrip />
      <NewsletterBanner banner={activeNewsletter} />
    </div>
  );
}
