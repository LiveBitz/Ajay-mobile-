import { HeroBanner } from "@/components/home/HeroBanner";
import { HeroSubBanners } from "@/components/home/HeroSubBanners";
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
import { getSiteSetting } from "@/lib/actions/settings-actions";

export const revalidate = 300;

// ✅ Reusable divider — dark variant for between dark sections, light for between light sections
function Divider({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  return (
    <div
      className={`h-px ${className}`}
      style={{
        background: dark
          ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)"
          : "linear-gradient(90deg, transparent, #e4e4e7, transparent)",
      }}
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

  // ✅ Check visibility of featured section
  const showFeatured = (await getSiteSetting("show_featured_categories", "true")) === "true";

  return (
    <main
      className="flex flex-col w-full pt-10 md:pt-4"
      style={{ backgroundColor: "#0a0a0a" }}
    >

      {/* ── 1. Featured Categories ── dark */}
      {showFeatured && (
        <>
          <Section className="mt-2 md:mt-7">
            <FeaturedCategoriesSection />
          </Section>
          <Divider dark />
        </>
      )}

      {/* ── 2. Hero Banner ── dark */}
      <Section>
        {heroBanners.length > 0 ? (
          <HeroBanner banners={heroBanners} />
        ) : (
          <div className="w-full flex items-center justify-center border-y border-zinc-800"
            style={{ minHeight: "320px", backgroundColor: "#0a0a0a" }}
          >
            <div className="text-center space-y-1 px-4">
              <p className="text-zinc-500 font-semibold text-sm">No hero banners configured</p>
              <p className="text-zinc-600 text-xs">Add banners from the admin dashboard</p>
            </div>
          </div>
        )}
      </Section>

      <Divider dark />

      {/* ── 3. Flash Sale ── dark */}
      <Section delay={0}>
        <HurryUpSection />
      </Section>

      {heroBanners.length > 0 && (
        <Section delay={50}>
          <HeroSubBanners banners={heroBanners} startIndex={0} maxItems={2} heading="Fresh Drops to Explore" />
        </Section>
      )}

      <Divider dark />

      {/* ── 4. Brand Carousel ── light: white */}
      <Section delay={100}>
        <BrandCarousel categories={dbCategories} />
      </Section>

      <Divider />

      {/* ── 5. Best Sellers ── dark */}
      <Section delay={150}>
        <BestSellersSection />
      </Section>

      {heroBanners.length > 2 && (
        <Section delay={170}>
          <HeroSubBanners
            banners={heroBanners}
            startIndex={2}
            maxItems={3}
            heading="Swipe and Steal the Deals"
            showMobileEdgeFades
            emphasizeMobileCards
          />
        </Section>
      )}

      <Divider dark />

      {/* ── 6. New Arrivals ── light: white */}
      <Section delay={200}>
        <NewArrivals />
      </Section>

      {/* ── 7. Promo Banner ── light: zinc-50 (conditional) */}
      {promoBanners.length > 0 && (
        <>
          <Divider />
          <Section delay={250}>
            <PromoBanner banners={promoBanners} />
          </Section>
        </>
      )}


      {/* ── 9. Newsletter ── dark: bookends the page */}
      {activeNewsletter && (
        <Section delay={350}>
          <NewsletterBanner banner={activeNewsletter} />
        </Section>
      )}

    </main>
  );
}