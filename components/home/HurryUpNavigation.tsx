"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function HurryUpNavigation() {
  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-3">
        <button className="p-3 rounded-full bg-white/60 hover:bg-white shadow-sm transition-all hover:shadow-md active:scale-95">
          <ChevronLeft className="w-5 h-5 text-zinc-700" />
        </button>
        <button className="p-3 rounded-full bg-white/60 hover:bg-white shadow-sm transition-all hover:shadow-md active:scale-95">
          <ChevronRight className="w-5 h-5 text-zinc-700" />
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className="flex md:hidden items-center justify-center gap-3 mt-8">
        <button className="p-3 rounded-full bg-white/60 hover:bg-white shadow-sm transition-all hover:shadow-md active:scale-95">
          <ChevronLeft className="w-5 h-5 text-zinc-700" />
        </button>
        <button className="p-3 rounded-full bg-white/60 hover:bg-white shadow-sm transition-all hover:shadow-md active:scale-95">
          <ChevronRight className="w-5 h-5 text-zinc-700" />
        </button>
      </div>
    </>
  );
}
