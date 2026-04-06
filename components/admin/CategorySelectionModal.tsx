"use client";

import React from "react";
import { 
  X, 
  Shirt, 
  Watch, 
  FlaskConical, 
  Briefcase,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategorySelectionModalProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; description: string }> = {
  "men": { 
    icon: Shirt, 
    color: "bg-blue-500/10 text-blue-600", 
    description: "Signature apparel, oversized tees, and premium menswear." 
  },
  "watches": { 
    icon: Watch, 
    color: "bg-emerald-500/10 text-emerald-600", 
    description: "Luxury timepieces and precision craftsmanship." 
  },
  "perfumes": { 
    icon: FlaskConical, 
    color: "bg-purple-500/10 text-purple-600", 
    description: "SOULED signature scents and artisanal fragrances." 
  },
  "accessories": { 
    icon: Briefcase, 
    color: "bg-amber-500/10 text-amber-600", 
    description: "Lifestyle essentials, bags, and luxury additions." 
  },
};

export function CategorySelectionModal({ categories, isOpen, onClose }: CategorySelectionModalProps) {
  const router = useRouter();

  // Filter to only the 4 core categories mentioned by the user
  const coreCategories = categories.filter(c => 
    ["men", "watches", "perfumes", "accessories"].includes(c.name.toLowerCase())
  );

  const handleSelect = (categoryId: string) => {
    onClose();
    router.push(`/admin/products/new?catId=${categoryId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 border-none bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <DialogHeader className="p-8 pb-4 border-b border-zinc-50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold tracking-tight text-zinc-900">Choose Collection</DialogTitle>
              <DialogDescription className="text-zinc-500 font-medium">Select a primary cluster for this new product.</DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl h-10 w-10 text-zinc-400">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-4">
            {coreCategories.map((cat) => {
              const config = CATEGORY_CONFIG[cat.name.toLowerCase()] || { icon: Shirt, color: "bg-zinc-50 text-zinc-900" };
              const Icon = config.icon;
              
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelect(cat.id)}
                  className="group flex flex-col items-center justify-center p-8 rounded-3xl border border-zinc-100 hover:border-brand/40 hover:bg-brand/[0.02] transition-all duration-200 text-center space-y-4"
                >
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-brand group-hover:text-white", config.color)}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-zinc-900 tracking-tight group-hover:text-brand transition-colors text-lg">{cat.name}</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Select</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-8 py-6 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between">
           <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Digital Inventory Management</p>
           <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-brand uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              SOULED Standard
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
