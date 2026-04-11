"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleBestSeller, toggleNewArrival } from "@/app/admin/actions/product";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ProductQuickToggleProps {
  productId: string;
  productName: string;
  initialIsBestSeller: boolean;
  initialIsNew: boolean;
}

export function ProductQuickToggle({
  productId,
  productName,
  initialIsBestSeller,
  initialIsNew,
}: ProductQuickToggleProps) {
  const { toast } = useToast();
  const [isBestSeller, setIsBestSeller] = useState(initialIsBestSeller);
  const [isNew, setIsNew] = useState(initialIsNew);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleBestSeller = async () => {
    setIsLoading(true);
    try {
      const result = await toggleBestSeller(productId);
      if (result.success) {
        setIsBestSeller(result.isBestSeller!);
        toast({
          title: "Updated",
          description: result.isBestSeller
            ? `${productName} marked as bestseller`
            : `${productName} removed from bestsellers`,
          duration: 2000,
        });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleNew = async () => {
    setIsLoading(true);
    try {
      const result = await toggleNewArrival(productId);
      if (result.success) {
        setIsNew(result.isNew!);
        toast({
          title: "Updated",
          description: result.isNew
            ? `${productName} marked as new arrival`
            : `${productName} removed from new arrivals`,
          duration: 2000,
        });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Bestseller Toggle */}
      <Button
        variant="ghost"
        size="sm"
        disabled={isLoading}
        onClick={handleToggleBestSeller}
        className={cn(
          "h-8 w-8 p-0 rounded-lg transition-all",
          isBestSeller
            ? "bg-brand/10 text-brand hover:bg-brand/20"
            : "bg-zinc-50 text-zinc-400 hover:bg-zinc-100"
        )}
        title={isBestSeller ? "Remove from bestsellers" : "Mark as bestseller"}
      >
        <Star className="w-4 h-4" fill={isBestSeller ? "currentColor" : "none"} />
      </Button>

      {/* New Arrival Toggle */}
      <Button
        variant="ghost"
        size="sm"
        disabled={isLoading}
        onClick={handleToggleNew}
        className={cn(
          "h-8 w-8 p-0 rounded-lg transition-all",
          isNew
            ? "bg-zinc-900/10 text-zinc-900 hover:bg-zinc-900/20"
            : "bg-zinc-50 text-zinc-400 hover:bg-zinc-100"
        )}
        title={isNew ? "Remove from new arrivals" : "Mark as new arrival"}
      >
        <span
          className={cn(
            "text-xs font-bold",
            isNew ? "opacity-100" : "opacity-60"
          )}
        >
          NEW
        </span>
      </Button>
    </div>
  );
}
