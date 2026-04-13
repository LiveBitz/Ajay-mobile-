"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

import { Banner } from "@prisma/client";

interface NewsletterBannerProps {
  banner?: Banner | null;
}

export function NewsletterBanner({ banner }: NewsletterBannerProps) {
  if (!banner) return null;

  const displayTitle = banner.title;
  const displaySubtitle = banner.subtitle || "";
  const displayButtonText = banner.buttonText || "Subscribe";

  return (
    <section className="py-16 md:py-20 px-4 md:px-6 lg:px-8 container mx-auto mb-8">
      <div className="relative w-full overflow-hidden rounded-2xl bg-zinc-900 text-white p-8 md:p-12 lg:p-16 space-y-6 md:space-y-0 md:flex md:items-center md:justify-between gap-8 shadow-xl">
        {/* Thin brand-red left accent */}
        <div className="absolute left-0 top-8 bottom-8 w-1 bg-brand rounded-r-full" />

        <div className="relative z-10 flex-1 space-y-3">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-white">
            {displayTitle}
          </h2>
          {displaySubtitle && (
            <p className="text-zinc-400 text-sm md:text-base font-medium">
              {displaySubtitle}
            </p>
          )}
        </div>

        <div className="relative z-10 w-full md:w-auto">
          <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
            <div className="relative flex-1 sm:flex-none group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-400 focus:border-zinc-500 focus-visible:ring-0 pl-10 h-12 rounded-lg font-medium transition-all duration-300"
                required
              />
            </div>
            <Button className="bg-brand text-white md:hover:bg-red-700 px-8 h-12 rounded-lg font-semibold text-sm transition-all duration-200 shrink-0">
              {displayButtonText}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
