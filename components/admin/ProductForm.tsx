"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Save, 
  Trash2, 
  Image as ImageIcon, 
  Loader2, 
  Sparkles, 
  TrendingUp,
  Tag,
  DollarSign,
  Eye,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createProduct, updateProduct } from "@/app/admin/actions/product";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  categories: Category[];
  initialData?: any;
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    price: initialData?.price?.toString() || "",
    originalPrice: initialData?.originalPrice?.toString() || "",
    discount: initialData?.discount?.toString() || "0",
    categoryId: initialData?.categoryId || "",
    subCategory: initialData?.subCategory || "",
    image: initialData?.image || "",
    isNew: initialData?.isNew ?? true,
    isBestSeller: initialData?.isBestSeller ?? false,
    sizes: initialData?.sizes || [],
    colors: initialData?.colors || [],
    description: initialData?.description || "",
    features: initialData?.features || [],
  });

  const handleSlugify = (name: string) => {
    setFormData(prev => ({ 
      ...prev, 
      name, 
      slug: name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "") 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = isEdit 
        ? await updateProduct(initialData.id, formData)
        : await createProduct(formData);

      if (result.success) {
        toast({
          title: isEdit ? "Persistence Updated" : "Collection Created",
          description: `"${formData.name}" has been successfully synchronized.`,
        });
        router.push("/admin/products");
        router.refresh();
      } else {
        toast({
          title: "Synchronization Error",
          description: result.error || "Failed to commit changes.",
          variant: "destructive",
        });
      }
    } catch (error) {
       toast({
        title: "Network Error",
        description: "An unexpected error occurred during persistence.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 sm:space-y-16 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 z-40 bg-zinc-50/80 backdrop-blur-xl py-6 -mx-4 px-4 sm:-mx-8 sm:px-8 border-b border-zinc-100/50 transition-all duration-300">
        <div className="flex items-center gap-6">
          <Link href="/admin/products">
            <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl hover:bg-white shadow-sm transition-all active:scale-95 border border-zinc-100">
              <ChevronLeft className="w-6 h-6 text-zinc-900" />
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-zinc-900">
              {isEdit ? "Refine Product" : "New Creation"}
            </h1>
            <p className="text-[10px] text-brand font-bold uppercase tracking-widest px-1">
              {isEdit ? `Record ID: ${initialData.id.toUpperCase()}` : "Digital Inventory Draft"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button type="button" variant="ghost" className="h-14 px-8 rounded-2xl font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
              Discard Changes
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="h-14 px-10 rounded-2xl bg-brand hover:bg-brand/90 text-white font-bold shadow-xl shadow-brand/20 transition-all active:scale-95 flex items-center gap-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Committing...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{isEdit ? "Update Inventory" : "Publish to Store"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Configuration form */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Visual Excellence Section */}
          <section className="bg-white p-8 sm:p-10 rounded-[40px] border border-zinc-100 shadow-sm space-y-8 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 border-b border-zinc-50 pb-6">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Visual Identity</h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Media & Aesthetics</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-8 items-start">
                <div className="w-full sm:w-48 h-64 sm:h-64 rounded-[32px] bg-zinc-50 border-2 border-dashed border-zinc-100 flex items-center justify-center shrink-0 shadow-inner group overflow-hidden relative transition-all active:scale-95">
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-zinc-200" />
                  )}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex-1 w-full space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">Image Source URL</label>
                    <Input 
                      placeholder="Paste high-resolution JPG or PNG link..." 
                      value={formData.image}
                      onChange={(e) => setFormData(p => ({ ...p, image: e.target.value }))}
                      className="rounded-2xl border-zinc-100 h-14 font-medium bg-zinc-50/50 focus:bg-white transition-all focus:ring-brand/10 shadow-sm"
                      required
                    />
                    <div className="p-4 rounded-2xl bg-zinc-50/50 border border-zinc-100/50 text-[10px] text-zinc-400 font-bold leading-relaxed space-y-1">
                       <p className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Resolution: 1080x1350 recommended.</p>
                       <p className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Background: Clean, minimal studio aesthetics.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Descriptive Attributes Section */}
          <section className="bg-white p-8 sm:p-10 rounded-[40px] border border-zinc-100 shadow-sm space-y-8 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 border-b border-zinc-50 pb-6">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                <Tag className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Core Attributes</h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Classification & Naming</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">Production Name</label>
                <Input 
                  placeholder="e.g. Signature Oversized Tee" 
                  value={formData.name}
                  onChange={(e) => handleSlugify(e.target.value)}
                  className="rounded-2xl border-zinc-100 h-16 font-bold text-lg text-zinc-900 focus:ring-brand/10 shadow-sm"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">Unique Slug (URL)</label>
                <Input 
                  placeholder="signature-oversized-tee" 
                  value={formData.slug}
                  onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))}
                  className="rounded-2xl border-zinc-100 h-16 font-medium text-zinc-500 bg-zinc-50/30 tabular-nums shadow-sm"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">Collection</label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(v) => setFormData(p => ({ ...p, categoryId: v }))}
                >
                  <SelectTrigger className="rounded-2xl border-zinc-100 h-16 font-bold bg-white shadow-sm focus:ring-brand/10">
                    <SelectValue placeholder="Assign to Cluster" />
                  </SelectTrigger>
                  <SelectContent className="rounded-3xl border-zinc-100 p-2 shadow-2xl">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="rounded-xl py-3 font-bold text-zinc-600 focus:bg-brand/5 focus:text-brand transition-all">{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">Department / Tag</label>
                <Input 
                  placeholder="e.g. Menswear, Luxury" 
                  value={formData.subCategory}
                  onChange={(e) => setFormData(p => ({ ...p, subCategory: e.target.value }))}
                  className="rounded-2xl border-zinc-100 h-16 font-medium text-zinc-900 focus:ring-brand/10 shadow-sm"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">Product Narrative</label>
                <textarea 
                  placeholder="Tell the story of this creation..." 
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  className="w-full rounded-2xl border border-zinc-100 p-6 min-h-[160px] font-medium text-zinc-900 focus:ring-2 focus:ring-brand/10 focus:border-brand/20 transition-all shadow-sm outline-none resize-none"
                  required
                />
              </div>
            </div>
          </section>

          {/* Product Variants Section */}
          <section className="bg-white p-8 sm:p-10 rounded-[40px] border border-zinc-100 shadow-sm space-y-8 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 border-b border-zinc-50 pb-6">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Product Variants</h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Sizes & Color Palettes</p>
              </div>
            </div>

            <div className="space-y-10">
              {/* Size Selection Orchestration */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">Available Sizes</label>
                  <span className="text-[9px] font-bold text-brand uppercase tracking-tighter bg-brand/5 px-2 py-0.5 rounded-full">Intelligent Selection</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {["XS", "S", "M", "L", "XL", "XXL", "3XL"].map((size) => {
                    const isSelected = formData.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          const newSizes = isSelected 
                            ? formData.sizes.filter((s: string) => s !== size)
                            : [...formData.sizes, size];
                          setFormData(p => ({ ...p, sizes: newSizes }));
                        }}
                        className={cn(
                          "min-w-[64px] h-14 rounded-2xl border font-bold text-sm transition-all duration-300 active:scale-95 shadow-sm flex items-center justify-center",
                          isSelected 
                            ? "bg-zinc-900 border-zinc-900 text-white shadow-xl shadow-zinc-200" 
                            : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200 hover:text-zinc-600"
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Palette Orchestration */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">Color Palette</label>
                  <span className="text-[9px] font-bold text-brand uppercase tracking-tighter bg-brand/5 px-2 py-0.5 rounded-full">Curated Colors</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {["Black", "White", "Grey", "Navy", "Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Brown"].map((color) => {
                    const isSelected = formData.colors.includes(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          const newColors = isSelected 
                            ? formData.colors.filter((c: string) => c !== color)
                            : [...formData.colors, color];
                          setFormData(p => ({ ...p, colors: newColors }));
                        }}
                        className={cn(
                          "px-5 h-14 rounded-2xl border font-bold text-xs uppercase tracking-tight transition-all duration-300 active:scale-95 shadow-sm flex items-center gap-3",
                          isSelected 
                            ? "bg-zinc-900 border-zinc-900 text-white shadow-xl shadow-zinc-200" 
                            : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200 hover:text-zinc-600"
                        )}
                      >
                        <div 
                          className="w-4 h-4 rounded-full border border-white/20" 
                          style={{ backgroundColor: color.toLowerCase() }} 
                        />
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Commerce & Pricing Section */}
          <section className="bg-white p-8 sm:p-10 rounded-[40px] border border-zinc-100 shadow-sm space-y-8 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 border-b border-zinc-50 pb-6">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Commercial Strategy</h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Value & Market Position</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">Selling Price (₹)</label>
                <div className="relative">
                  <Input 
                    type="number"
                    placeholder="999" 
                    value={formData.price}
                    onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))}
                    className="rounded-2xl border-zinc-100 h-16 font-bold text-xl text-zinc-900 pl-10 shadow-sm"
                    required
                  />
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₹</span>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">List Price (₹)</label>
                <div className="relative">
                  <Input 
                    type="number"
                    placeholder="1499" 
                    value={formData.originalPrice}
                    onChange={(e) => setFormData(p => ({ ...p, originalPrice: e.target.value }))}
                    className="rounded-2xl border-zinc-100 h-16 font-medium text-zinc-400 pl-10 bg-zinc-50/50 shadow-sm"
                    required
                  />
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 font-bold">₹</span>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">Strategy Disc %</label>
                <Input 
                  type="number"
                  placeholder="30" 
                  value={formData.discount}
                  onChange={(e) => setFormData(p => ({ ...p, discount: e.target.value }))}
                  className="rounded-2xl border-zinc-100 h-16 font-bold text-zinc-600 bg-brand/5 border-brand/10 shadow-sm"
                  required
                />
              </div>
            </div>
          </section>

          {/* Status & Orchestration Section */}
          <section className="bg-white p-8 sm:p-10 rounded-[40px] border border-zinc-100 shadow-sm space-y-8 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 border-b border-zinc-50 pb-6">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Visibility Status</h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Flags & Orchestration</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-10 bg-zinc-50/30 p-8 rounded-3xl border border-zinc-100/50 transition-all hover:bg-zinc-50/50">
              <div className="flex items-center space-x-4 group cursor-pointer">
                <Checkbox 
                  id="isNew" 
                  checked={formData.isNew} 
                  onCheckedChange={(c) => setFormData(p => ({ ...p, isNew: !!c }))}
                  className="w-6 h-6 rounded-lg border-zinc-200 transition-all data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                />
                <label htmlFor="isNew" className="text-sm font-bold text-zinc-600 cursor-pointer group-hover:text-zinc-900 transition-colors uppercase tracking-tight">New Arrival Badge</label>
              </div>
              <div className="flex items-center space-x-4 group cursor-pointer">
                <Checkbox 
                  id="isBestSeller" 
                  checked={formData.isBestSeller} 
                  onCheckedChange={(c) => setFormData(p => ({ ...p, isBestSeller: !!c }))}
                  className="w-6 h-6 rounded-lg border-zinc-200 transition-all data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                />
                <label htmlFor="isBestSeller" className="text-sm font-bold text-zinc-600 cursor-pointer group-hover:text-zinc-900 transition-colors uppercase tracking-tight">Bestseller Recognition</label>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 space-y-8">
            <div className="flex items-center justify-between px-4">
               <div>
                  <h3 className="text-lg font-bold text-zinc-900">Live Simulation</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Real-time Preview</p>
               </div>
               <div className="flex items-center gap-2 text-zinc-400 font-bold text-[10px] uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active
               </div>
            </div>

            {/* Simulated Product Card */}
            <div className="group relative bg-white rounded-[40px] overflow-hidden border border-zinc-100 shadow-2xl transition-all duration-700 hover:shadow-brand/5 h-[600px] flex flex-col">
              <div className="aspect-[3/4] relative overflow-hidden bg-zinc-50 flex-1">
                {formData.image ? (
                  <img src={formData.image} alt="Simulation" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center text-zinc-300">
                    <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                    <p className="font-bold text-[10px] uppercase tracking-widest leading-relaxed">Simulation requires<br/>Visual Identity URL</p>
                  </div>
                )}
                
                {/* Badges Simulation */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                   {formData.isNew && (
                     <span className="bg-zinc-900 text-white text-[9px] font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-xl shadow-black/20">NEW</span>
                   )}
                   {formData.isBestSeller && (
                     <span className="bg-brand text-white text-[9px] font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-xl shadow-brand/20">BESTSELLER</span>
                   )}
                </div>
              </div>
              
              <div className="p-8 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-brand font-bold uppercase tracking-widest">
                    {categories.find(c => c.id === formData.categoryId)?.name || "Unassigned"} Collection
                  </p>
                  <h2 className="text-xl font-bold text-zinc-900 truncate tracking-tight">{formData.name || "Signature Item Name"}</h2>
                </div>
                
                <div className="flex items-end justify-between pt-2">
                   <div className="flex flex-col">
                      <p className="text-2xl font-bold text-zinc-900 font-heading">₹{formData.price || "000"}</p>
                      {parseInt(formData.discount) > 0 && (
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-zinc-400 line-through">₹{formData.originalPrice || "000"}</p>
                          <p className="text-[9px] text-brand font-bold uppercase tracking-tighter">Save {formData.discount}%</p>
                        </div>
                      )}
                   </div>
                   <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-all duration-500 shadow-sm">
                      <span className="text-2xl">+</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/5 p-6 rounded-[32px] border border-zinc-900/10 text-center space-y-4">
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">
                Ensure all commercial strategies<br/>align with brand guidelines.
              </p>
              <div className="w-12 h-1 bg-zinc-900/10 mx-auto rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
