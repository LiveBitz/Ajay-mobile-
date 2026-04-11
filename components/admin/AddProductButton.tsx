"use client";

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AddProductButton() {
  return (
    <Link href="/admin/products/new">
      <Button 
        className="bg-brand hover:bg-brand/90 text-white gap-3 rounded-[24px] h-16 px-10 shadow-2xl shadow-brand/20 transition-all hover:scale-[1.02] active:scale-95 font-extrabold w-full lg:w-auto"
      >
        <Plus className="w-6 h-6" />
        Add New Product
      </Button>
    </Link>
  );
}
