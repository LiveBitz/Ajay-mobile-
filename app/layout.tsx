import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import { ConditionalNavbar } from "@/components/layout/ConditionalNavbar";
import { Footer } from "@/components/layout/Footer";
import prisma from "@/lib/prisma";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Toaster } from "@/components/ui/toaster";

const siteUrl = "https://www.priyamobilepark.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Priya Mobile Park | Best Smartphones & Mobile Phones in Jaipur",
    template: "%s | Priya Mobile Park",
  },
  description:
    "Buy latest smartphones, iPhones, Samsung Galaxy, OnePlus & accessories at best prices. Genuine products, fast delivery & easy returns. Priya Mobile Park — Jaipur's trusted mobile store.",
  keywords: [
    "Priya Mobile Park",
    "buy smartphones Jaipur",
    "mobile phones Jaipur",
    "iPhone price Jaipur",
    "Samsung Galaxy Jaipur",
    "OnePlus phones",
    "best mobile shop Jaipur",
    "smartphone store Rajasthan",
    "buy phone online India",
    "Apple iPhone India",
    "mobile accessories Jaipur",
    "priyamobilepark.com",
  ],
  authors: [{ name: "Priya Mobile Park", url: siteUrl }],
  creator: "Priya Mobile Park",
  publisher: "Priya Mobile Park",
  category: "electronics",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Priya Mobile Park",
    title: "Priya Mobile Park | Best Smartphones & Mobile Phones in Jaipur",
    description:
      "Buy latest smartphones, iPhones, Samsung Galaxy, OnePlus & accessories at best prices. Genuine products, fast delivery & easy returns.",
    images: [
      {
        url: "/images/cropped_circle_image.png",
        width: 512,
        height: 512,
        alt: "Priya Mobile Park Logo",
      },
    ],
  },
  icons: {
    icon: "/images/cropped_circle_image.png",
    shortcut: "/images/cropped_circle_image.png",
    apple: "/images/cropped_circle_image.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Priya Mobile Park | Best Smartphones in Jaipur",
    description:
      "Buy latest smartphones at best prices. Genuine products, fast delivery & easy returns. Jaipur's trusted mobile store.",
    images: ["/images/cropped_circle_image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "", // Add your Google Search Console verification code here
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Priya Mobile Park",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/images/cropped_circle_image.png`,
        width: 512,
        height: 512,
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-83360-84672",
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Jaipur",
        addressRegion: "Rajasthan",
        addressCountry: "IN",
      },
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Priya Mobile Park",
      publisher: { "@id": `${siteUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/search?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Store",
      name: "Priya Mobile Park",
      image: `${siteUrl}/images/cropped_circle_image.png`,
      url: siteUrl,
      telephone: "+91-83360-84672",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Jaipur",
        addressRegion: "Rajasthan",
        postalCode: "303007",
        addressCountry: "IN",
      },
      priceRange: "₹₹",
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        opens: "09:00",
        closes: "21:00",
      },
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await prisma.category.findMany({
    select: { name: true },
    take: 10
  });

  const categoryNames = categories.map(c => c.name);

  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${dmSans.variable} h-full antialiased font-body selection:bg-brand/20 text-[15px]`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-zinc-900">
        <CartProvider>
          <WishlistProvider>
            <ConditionalNavbar categoryNames={categoryNames} />
            <main>
              {children}
            </main>
            <Footer />
            <Toaster />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
