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
      <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-r from-brand via-red-600 to-red-700 text-white p-8 md:p-12 lg:p-16 space-y-6 md:space-y-0 md:flex md:items-center md:justify-between gap-8 shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply" />
        </div>
        <div className="relative z-10 flex-1 space-y-3">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
            {displayTitle}
          </h2>
          {displaySubtitle && (
            <p className="text-white/90 text-sm md:text-base font-medium">
              {displaySubtitle}
            </p>
          )}
        </div>

        <div className="relative z-10 w-full md:w-auto">
          <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
            <div className="relative flex-1 sm:flex-none group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/20 border-2 border-white/30 text-white placeholder:text-white/50 focus:border-white focus-visible:ring-0 pl-10 h-12 rounded-lg backdrop-blur-sm font-medium transition-all duration-300"
                required
              />
            </div>
            <Button className="bg-white text-brand hover:bg-stone-100 px-8 h-12 rounded-lg font-bold text-sm transition-all duration-300 hover:scale-105 shrink-0 shadow-lg">
              {displayButtonText}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
