"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategorySelectionModal } from "./CategorySelectionModal";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface AddProductButtonProps {
  categories: Category[];
}

export function AddProductButton({ categories }: AddProductButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-brand hover:bg-brand/90 text-white gap-3 rounded-[24px] h-16 px-10 shadow-2xl shadow-brand/20 transition-all hover:scale-[1.02] active:scale-95 font-extrabold w-full lg:w-auto"
      >
        <Plus className="w-6 h-6" />
        Add New Product
      </Button>

      <CategorySelectionModal 
        categories={categories}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
