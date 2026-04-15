import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import { ConditionalNavbar } from "@/components/layout/ConditionalNavbar";
import { Footer } from "@/components/layout/Footer";
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

export const metadata: Metadata = {
  title: "NEXUS | Premium Smartphones & Mobile Phones",
  description: "Shop the latest smartphones from top brands — Apple, Samsung, OnePlus & more. Premium phones, unbeatable prices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${dmSans.variable} h-full antialiased font-body selection:bg-brand/20 text-[15px]`}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900">
        <CartProvider>
          <WishlistProvider>
            <ConditionalNavbar />
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
