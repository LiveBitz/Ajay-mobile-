"use client";

import React, { useEffect, useState } from "react";
import { 
  Layers, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Plus,
  Trash2,
  X
} from "lucide-react";
import { getCategories, updateCategoryImage, createCategory, deleteCategory } from "@/lib/actions/category-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  // Add category form state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    setLoading(false);
  };

  const handleUpdateImage = async (id: string, newUrl: string) => {
    setUpdatingId(id);
    const result = await updateCategoryImage(id, newUrl);
    
    if (result.success) {
      toast({
        title: "Visual Assets Synchronized",
        description: "The category image has been professionally updated.",
      });
      setCategories(prev => prev.map(c => c.id === id ? { ...c, image: newUrl } : c));
    } else {
      toast({
        title: "Synchronization Error",
        description: result.error as string,
        variant: "destructive",
      });
    }
    setUpdatingId(null);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    const result = await createCategory(newCategoryName, newCategoryImage);
    
    if (result.success) {
      toast({
        title: "Category Created",
        description: `${newCategoryName} has been added successfully.`,
      });
      setCategories([...categories, result.category]);
      setNewCategoryName("");
      setNewCategoryImage("");
      setShowAddForm(false);
    } else {
      toast({
        title: "Creation Error",
        description: result.error as string,
        variant: "destructive",
      });
    }
    setIsCreating(false);
  };

  const handleDeleteCategory = async (id: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    const result = await deleteCategory(id);
    
    if (result.success) {
      toast({
        title: "Category Deleted",
        description: `${categoryName} has been removed successfully.`,
      });
      setCategories(categories.filter(c => c.id !== id));
    } else {
      toast({
        title: "Deletion Error",
        description: result.error as string,
        variant: "destructive",
      });
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
        <p className="text-zinc-500 font-bold text-sm tracking-tight animate-pulse">Orchestrating Visual Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header Orchestration */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand/5 rounded-2xl flex items-center justify-center">
               <Layers className="w-5 h-5 text-brand" />
             </div>
             <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-zinc-900">
               Visual Console
             </h1>
          </div>
          <p className="text-zinc-500 font-medium text-sm leading-relaxed max-w-xl">
             Manage your flagship&apos;s <span className="text-zinc-900 font-bold underline decoration-brand/30">Category Orchestration</span>. 
             Create, update and delete categories in real-time.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={fetchCategories}
            className="h-12 rounded-2xl border-zinc-100 hover:bg-zinc-50 font-extrabold text-zinc-900 shadow-sm gap-2 transition-all active:scale-95"
          >
            <RefreshCw className={cn("w-4 h-4 text-zinc-400", loading && "animate-spin")} />
            Sync Dataset
          </Button>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-12 rounded-2xl bg-brand text-white hover:bg-brand/90 font-extrabold shadow-lg shadow-brand/20 gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="bg-white rounded-[32px] border border-zinc-100 shadow-lg p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-zinc-900">Create New Category</h2>
            <button 
              onClick={() => setShowAddForm(false)}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">
              Category Name *
            </label>
            <Input 
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. Electronics, Fashion, Home Decor"
              className="h-12 rounded-2xl border-zinc-100 bg-zinc-50/30 text-sm font-bold placeholder:text-zinc-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">
              Category Image (Optional)
            </label>
            <Input 
              value={newCategoryImage}
              onChange={(e) => setNewCategoryImage(e.target.value)}
              placeholder="e.g. https://domain.com/image.jpg"
              className="h-12 rounded-2xl border-zinc-100 bg-zinc-50/30 text-sm font-bold placeholder:text-zinc-400"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button 
              onClick={handleAddCategory}
              disabled={isCreating || !newCategoryName.trim()}
              className="h-12 rounded-2xl bg-brand text-white hover:bg-brand/90 font-extrabold gap-2 transition-all active:scale-95"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Category
                </>
              )}
            </Button>
            <Button 
              onClick={() => setShowAddForm(false)}
              variant="outline"
              className="h-12 rounded-2xl border-zinc-100 hover:bg-zinc-50"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Grid Orchestration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 sm:gap-10">
        {categories.map((cat) => (
          <CategoryCard 
            key={cat.id} 
            category={cat} 
            isUpdating={updatingId === cat.id}
            isDeleting={deletingId === cat.id}
            onUpdate={handleUpdateImage}
            onDelete={handleDeleteCategory}
          />
        ))}
      </div>

      {categories.length === 0 && (
        <div className="py-24 text-center bg-white rounded-[48px] border border-zinc-100 shadow-sm flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center border-4 border-white shadow-xl">
              <Layers className="w-9 h-9 text-zinc-200" />
            </div>
            <p className="font-extrabold text-xl text-zinc-900">No categories found in the flagship.</p>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="mt-4 h-12 rounded-2xl bg-brand text-white hover:bg-brand/90 font-extrabold gap-2 shadow-lg shadow-brand/20"
            >
              <Plus className="w-4 h-4" />
              Create First Category
            </Button>
        </div>
      )}
    </div>
  );
}

function CategoryCard({ category, onUpdate, onDelete, isUpdating, isDeleting }: { category: any, onUpdate: (id: string, url: string) => void, onDelete: (id: string, name: string) => void, isUpdating: boolean, isDeleting: boolean }) {
  const [tempUrl, setTempUrl] = useState(category.image || "");
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    setTempUrl(category.image || "");
    setIsModified(false);
  }, [category.image]);

  return (
    <div className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-500 flex flex-col h-full">
      {/* Visual Preview */}
      <div className="relative aspect-square overflow-hidden bg-zinc-50">
        {tempUrl ? (
          <img 
            src={tempUrl} 
            alt={category.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as any).src = "https://placehold.co/600/400/f4f4f5/9ca3af?text=Invalid+Image+Address";
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-zinc-100">
               <ImageIcon className="w-6 h-6 text-zinc-300" />
             </div>
             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">No Visual Assigned</p>
          </div>
        )}
        <div className="absolute top-4 left-4">
           <span className="bg-zinc-950/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/10 shadow-lg">
             {category.name}
           </span>
        </div>
      </div>

      {/* Orchestration Controls */}
      <div className="p-6 space-y-5 flex-1 flex flex-col">
        <div className="space-y-2.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">
             Asset Orchestration (Image Address)
          </label>
          <div className="relative group/input">
             <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within/input:text-brand transition-colors" />
             <Input 
               value={tempUrl}
               onChange={(e) => {
                 setTempUrl(e.target.value);
                 setIsModified(e.target.value !== category.image);
               }}
               placeholder="e.g. https://domain.com/image.jpg"
               className="h-12 pl-12 rounded-2xl border-zinc-100 bg-zinc-50/30 text-xs font-bold text-zinc-900 focus:bg-white transition-all shadow-sm"
             />
          </div>
        </div>

        <div className="mt-auto pt-4 flex flex-col gap-3">
           <div className="flex items-center justify-between gap-4">
             <div className="flex items-center gap-2">
               {isModified ? (
                 <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                   <AlertCircle className="w-3 h-3" />
                   Unsaved Changes
                 </div>
               ) : (
                 <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                   <CheckCircle2 className="w-3 h-3" />
                   Synchronized
                 </div>
               )}
             </div>

             <Button
               disabled={!isModified || isUpdating}
               onClick={() => onUpdate(category.id, tempUrl)}
               className={cn(
                 "rounded-2xl h-11 px-6 font-bold text-xs uppercase tracking-widest transition-all",
                 isModified 
                   ? "bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-200 active:scale-95" 
                   : "bg-zinc-50 text-zinc-300"
               )}
             >
               {isUpdating ? (
                 <Loader2 className="w-4 h-4 animate-spin" />
               ) : (
                 <div className="flex items-center gap-2">
                   <Save className="w-4 h-4" />
                   Save Visual
                 </div>
               )}
             </Button>
           </div>

           {/* Delete Button */}
           <Button
             disabled={isDeleting}
             onClick={() => onDelete(category.id, category.name)}
             variant="outline"
             className="h-11 rounded-2xl border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 font-bold text-xs uppercase tracking-widest gap-2 transition-all active:scale-95"
           >
             {isDeleting ? (
               <>
                 <Loader2 className="w-4 h-4 animate-spin" />
                 Deleting...
               </>
             ) : (
               <>
                 <Trash2 className="w-4 h-4" />
                 Delete Category
               </>
             )}
           </Button>
        </div>
      </div>
    </div>
  );
}
