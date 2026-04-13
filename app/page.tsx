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

export const revalidate = 300;

// ✅ Reusable divider component
function Divider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent ${className}`}
    />
  );
}

// ✅ Reusable section wrapper with consistent spacing + optional animation delay
function Section({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <section
      className={`w-full animate-fade-in-up ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </section>
  );
}

export default async function Home() {
  // ✅ Parallel data fetching — all 3 banner calls run simultaneously
  const [heroBanners, promoBanners, newsletterBanners, dbCategories] =
    await Promise.all([
      getBanners("HERO"),
      getBanners("PROMO"),
      getBanners("NEWSLETTER"),
      getCategories(),
    ]);

  // ✅ Pick only the first active newsletter banner
  const activeNewsletter = newsletterBanners[0] ?? null;

  return (
    <main className="flex flex-col w-full bg-white overflow-x-hidden">

      {/* ── 1. Featured Categories ── above fold, no delay */}
      <Section className="mt-8 md:mt-10">
        <FeaturedCategoriesSection />
      </Section>

      <Divider />

      {/* ── 2. Hero Banner ── */}
      <Section>
        {heroBanners.length > 0 ? (
          <HeroBanner banners={heroBanners} />
        ) : (
          // ✅ Proper empty state — matches real banner height so layout doesn't jump
          <div className="w-full flex items-center justify-center bg-zinc-50 border-y border-zinc-100"
            style={{ minHeight: "320px" }}
          >
            <div className="text-center space-y-1 px-4">
              <p className="text-zinc-500 font-semibold text-sm">
                No hero banners configured
              </p>
              <p className="text-zinc-400 text-xs">
                Add banners from the admin dashboard
              </p>
            </div>
          </div>
        )}
      </Section>

      <Divider />

      {/* ── 3. Hurry Up / Flash Sale ── */}
      <Section delay={0}>
        <HurryUpSection />
      </Section>

      <Divider />

      {/* ── 4. Brand / Category Carousel ── */}
      <Section delay={100}>
        <BrandCarousel categories={dbCategories} />
      </Section>

      <Divider />

      {/* ── 5. Best Sellers ── */}
      <Section delay={150}>
        <BestSellersSection />
      </Section>

      <Divider />

      {/* ── 6. New Arrivals ── */}
      <Section delay={200}>
        <NewArrivals />
      </Section>

      <Divider />

      {/* ── 7. Promo Banner ── only render if banners exist */}
      {promoBanners.length > 0 && (
        <>
          <Section delay={250}>
            <PromoBanner banners={promoBanners} />
          </Section>
          <Divider />
        </>
      )}

      {/* ── 8. Features Strip ── */}
      <Section delay={300}>
        <FeaturesStrip />
      </Section>

      <Divider />

      {/* ── 9. Newsletter ── only render if banner exists */}
      {activeNewsletter && (
        <Section delay={350}>
          <NewsletterBanner banner={activeNewsletter} />
        </Section>
      )}

    </main>
  );
}