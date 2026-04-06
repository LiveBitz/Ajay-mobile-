"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

export function NewsletterBanner() {
  return (
    <section className="py-20 px-4 md:px-8 lg:px-16 container mx-auto mb-10 overflow-hidden">
      <div className="relative w-full overflow-hidden rounded-3xl bg-brand text-white p-8 md:p-16 lg:p-24 flex flex-col lg:flex-row items-center gap-12 group">
        {/* Visual elements */}
        <div className="absolute right-0 top-0 w-1/4 h-full bg-white/10 skew-x-12 transform -translate-x-1/2" />
        <div className="absolute left-[-5%] bottom-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex-1 space-y-6 text-center lg:text-left">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold font-heading tracking-tighter leading-tight">
              GET 10% OFF <br />
              <span className="text-zinc-900/40">YOUR FIRST ORDER</span>
            </h2>
            <p className="text-white/90 text-sm md:text-lg max-w-md font-medium uppercase tracking-wide mx-auto lg:mx-0">
              Subscribe to our newsletter for exclusive deals, new drops, and early access.
            </p>
          </div>
        </div>
        
        <div className="relative z-10 w-full max-w-md bg-white/10 p-2 rounded-2xl md:rounded-full backdrop-blur-md border border-white/20 shadow-2xl">
          <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
            <div className="relative flex-1 group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 group-focus-within:text-white" />
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-transparent border-none text-white placeholder:text-white/40 focus-visible:ring-0 pl-12 h-14 md:h-12"
                required
              />
            </div>
            <Button className="bg-white text-zinc-950 hover:bg-zinc-100 px-8 h-12 rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95 shrink-0">
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
