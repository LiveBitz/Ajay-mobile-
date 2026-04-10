import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { NewArrivals } from "@/components/home/NewArrivals";
import { PromoBanner } from "@/components/home/PromoBanner";
import { BestSellers } from "@/components/home/BestSellers";
import { FeaturesStrip } from "@/components/home/FeaturesStrip";
import { NewsletterBanner } from "@/components/home/NewsletterBanner";
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
    <div className="flex flex-col gap-0 pb-10">
      <HeroBanner banners={heroBanners} />
      <CategoryGrid categories={dbCategories} />
      <NewArrivals />
      <PromoBanner banner={activePromo} />
      <BestSellers />
      <FeaturesStrip />
      <NewsletterBanner banner={activeNewsletter} />
    </div>
  );
}
