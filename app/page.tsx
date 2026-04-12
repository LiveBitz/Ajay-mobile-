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

// ✅ PHASE 2: Static regeneration - revalidate home page every 5 minutes for development
export const revalidate = 300;

export default async function Home() {
  const heroBanners = await getBanners("HERO");
  const promoBanners = await getBanners("PROMO");
  const newsletterBanners = await getBanners("NEWSLETTER");
  const dbCategories = await getCategories();

  // Use the first active newsletter banner
  const activeNewsletter = newsletterBanners.length > 0 ? newsletterBanners[0] : null;

  return (
    <div className="flex flex-col bg-white">
      {/* Featured Categories — above fold, no delay */}
      <FeaturedCategoriesSection />

      <div className="h-px bg-gradient-to-r from-transparent via-stone-200/50 to-transparent" />

      {/* Hero Banner — above fold with reliable rendering */}
      <div className="w-full">
        {heroBanners.length > 0 ? (
          <HeroBanner banners={heroBanners} />
        ) : (
          <div className="w-full h-[300px] bg-zinc-200 flex items-center justify-center text-center">
            <div>
              <p className="text-zinc-600 font-semibold">No hero banners available</p>
              <p className="text-zinc-500 text-sm">Banners: {heroBanners.length}</p>
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-stone-200/50 to-transparent" />

      {/* Below-fold sections fade in */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
        <HurryUpSection />
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-stone-200/50 to-transparent" />

      <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <BrandCarousel categories={dbCategories} />
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-stone-200/50 to-transparent" />

      <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <BestSellersSection />
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-stone-200/50 to-transparent" />

      <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <NewArrivals />
      </div>

      <div className="h-px bg-zinc-100" />

      <div className="animate-fade-in-up">
        <PromoBanner banners={promoBanners} />
      </div>

      <div className="h-px bg-zinc-100" />

      <div className="animate-fade-in-up">
        <FeaturesStrip />
      </div>

      <div className="h-px bg-zinc-100" />

      <div className="animate-fade-in-up">
        <NewsletterBanner banner={activeNewsletter} />
      </div>
    </div>
  );
}
