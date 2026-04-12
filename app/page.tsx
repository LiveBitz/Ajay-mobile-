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
    <div className="flex flex-col gap-0 bg-gradient-to-b from-stone-50 via-white to-stone-50/50">
      {/* Featured Categories - Stagger 1 */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
        <FeaturedCategoriesSection />
      </div>
      
      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-stone-200/50 to-transparent" />

      {/* Hero Banner - Stagger 2 */}
      <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <HeroBanner banners={heroBanners} />
      </div>
      
      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-stone-200/50 to-transparent" />

      {/* Hurry Up Section - Stagger 3 */}
      <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <HurryUpSection />
      </div>
      
      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-stone-200/50 to-transparent" />

      {/* Brand Carousel - Stagger 4 */}
      <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <BrandCarousel categories={dbCategories} />
      </div>
      
      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-stone-200/50 to-transparent" />

      {/* Best Sellers Section - Stagger 5 */}
      <div className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
        <BestSellersSection />
      </div>
      
      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-stone-200/50 to-transparent" />

      {/* New Arrivals - Stagger 6 */}
      <div className="animate-fade-in-up" style={{ animationDelay: "500ms" }}>
        <NewArrivals />
      </div>
      
      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-stone-200/50 to-transparent" />

      {/* Promo Banner - Stagger 7 */}
      <div className="animate-fade-in-up" style={{ animationDelay: "600ms" }}>
        <PromoBanner banner={activePromo} />
      </div>
      
      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-stone-200/50 to-transparent" />

      {/* Features Strip - Stagger 8 */}
      <div className="animate-fade-in-up" style={{ animationDelay: "700ms" }}>
        <FeaturesStrip />
      </div>
      
      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-stone-200/50 to-transparent" />

      {/* Newsletter Banner - Stagger 9 */}
      <div className="animate-fade-in-up" style={{ animationDelay: "800ms" }}>
        <NewsletterBanner banner={activeNewsletter} />
      </div>
    </div>
  );
}
