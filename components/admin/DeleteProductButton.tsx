"use client";

import React, { useState } from "react";
import { Trash2, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProduct, restoreProduct } from "@/app/admin/actions/product";
import { useToast } from "@/hooks/use-toast";

interface DeleteProductButtonProps {
  id: string;
  name: string;
  isArchived?: boolean;
}

export function DeleteProductButton({ id, name, isArchived }: DeleteProductButtonProps) {
  const [isWorking, setIsWorking] = useState(false);
  const { toast } = useToast();

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    setIsWorking(true);
    try {
      const result = await deleteProduct(id);
      if (result.success) {
        toast({
          title: result.archived ? "Product archived" : "Product deleted",
          description: result.archived
            ? result.message || `"${name}" has order history, so it was archived instead of deleted.`
            : `"${name}" has been removed successfully.`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete product.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsWorking(false);
    }
  }

  async function handleRestore() {
    setIsWorking(true);
    try {
      const result = await restoreProduct(id);
      if (result.success) {
        toast({
          title: "Product restored",
          description: `"${name}" is visible in the store again. Remember to update its stock.`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to restore product.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsWorking(false);
    }
  }

  if (isArchived) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled={isWorking}
        onClick={handleRestore}
        title="Restore product"
        className="w-10 h-10 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"
      >
        {isWorking ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RotateCcw className="w-4 h-4" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isWorking}
      onClick={handleDelete}
      title="Delete product"
      className="w-10 h-10 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all"
    >
      {isWorking ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </Button>
  );
}
