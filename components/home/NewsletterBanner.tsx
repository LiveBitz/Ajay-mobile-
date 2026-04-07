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
      <div className="relative w-full overflow-hidden rounded-2xl bg-brand text-white p-8 md:p-12 lg:p-16 space-y-6 md:space-y-0 md:flex md:items-center md:justify-between gap-8">
        <div className="flex-1 space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
            {displayTitle}
          </h2>
          {displaySubtitle && (
            <p className="text-white/80 text-sm md:text-base font-medium">
              {displaySubtitle}
            </p>
          )}
        </div>
        
        <div className="w-full md:w-auto">
          <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
            <div className="relative flex-1 sm:flex-none group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus-visible:ring-0 pl-10 h-11 rounded-lg"
                required
              />
            </div>
            <Button className="bg-white text-brand hover:bg-zinc-100 px-6 h-11 rounded-lg font-semibold text-sm transition-all shrink-0">
              {displayButtonText}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
