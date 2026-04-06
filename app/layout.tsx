import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
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

export const metadata: Metadata = {
  title: "SOULED | Premium Clothing Store",
  description: "Experience premium, conversion-focused clothing shop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${dmSans.variable} h-full antialiased font-body selection:bg-brand/20`}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-950">
        <Navbar />
        <main className="flex-1 pt-[72px] md:pt-[84px] lg:pt-[92px]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
