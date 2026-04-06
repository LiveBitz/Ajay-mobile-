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
  CheckCircle2,
  Upload,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
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
  preSelectedCategoryId?: string;
}

export function ProductForm({ categories, initialData, preSelectedCategoryId }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    price: initialData?.price?.toString() || "",
    originalPrice: initialData?.originalPrice?.toString() || "",
    discount: initialData?.discount?.toString() || "0",
    categoryId: initialData?.categoryId || preSelectedCategoryId || "",
    subCategory: initialData?.subCategory || "",
    image: initialData?.image || "",
    isNew: initialData?.isNew ?? true,
    isBestSeller: initialData?.isBestSeller ?? false,
    sizes: Array.isArray(initialData?.sizes) ? initialData.sizes : [],
    colors: Array.isArray(initialData?.colors) ? initialData.colors : [],
    description: initialData?.description || "",
    features: Array.isArray(initialData?.features) ? initialData.features : [],
  });

  const selectedCategory = categories.find(c => c.id === formData.categoryId);
  const isPerfume = selectedCategory?.name?.toLowerCase() === "perfumes";
  const isWatch = selectedCategory?.name?.toLowerCase() === "watches";
  const isApparel = selectedCategory?.name?.toLowerCase() === "men";

  // Auto-populate variants based on category if creating new
  useEffect(() => {
    if (!isEdit && !initialData && formData.categoryId) {
      if (isPerfume) {
        setFormData(p => ({ ...p, sizes: ["50ml", "100ml"] }));
      } else if (isApparel) {
        setFormData(p => ({ ...p, sizes: ["S", "M", "L", "XL"] }));
      }
    }
  }, [formData.categoryId, isPerfume, isApparel, isEdit]);

  const handleSlugify = (name: string) => {
    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    setFormData(prev => ({ ...prev, name, slug }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      setUploadProgress(30);

      const { error: uploadError } = await supabase.storage
        .from('product')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(80);

      const { data: { publicUrl } } = supabase.storage
        .from('product')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image: publicUrl }));
      setUploadProgress(100);
      toast({
        title: "Media asset synchronized",
        description: "Image successfully uploaded to storage.",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Verify storage bucket permissions.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
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
      {/* Professional Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 z-40 bg-zinc-50/90 backdrop-blur-md py-4 sm:py-6 -mx-4 px-4 sm:-mx-8 sm:px-8 border-b border-zinc-100 transition-all duration-300">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/admin/products">
            <Button variant="ghost" size="icon" className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl hover:bg-white shadow-sm transition-all active:scale-95 border border-zinc-100">
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-900" />
            </Button>
          </Link>
          <div className="space-y-0.5 sm:space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-heading tracking-tight text-zinc-900">
              {isEdit ? "Refine Creation" : "New Product"}
            </h1>
            <p className="text-[9px] text-brand font-bold uppercase tracking-[0.2em] px-0.5">
              {isEdit ? `ID: ${initialData.id.slice(0, 8).toUpperCase()}` : "Digital Inventory Draft"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/admin/products" className="hidden sm:block">
            <Button type="button" variant="ghost" className="h-12 sm:h-14 px-6 sm:px-8 rounded-2xl font-bold text-zinc-500 hover:text-zinc-900 transition-colors text-sm">
              Discard
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={isSubmitting || isUploading} 
            className="h-12 sm:h-14 flex-1 sm:flex-none px-8 sm:px-10 rounded-2xl bg-brand hover:bg-brand/90 text-white font-bold shadow-xl shadow-brand/20 transition-all active:scale-95 flex items-center justify-center gap-3 text-sm"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{isSubmitting ? "Committing..." : isUploading ? "Uploading Asset" : (isEdit ? "Update Inventory" : "Publish to Store")}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
        {/* Main Configuration form */}
        <div className="lg:col-span-2 space-y-8 sm:space-y-12">
          
          {/* Gallery Media */}
          <section className="bg-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-zinc-100 shadow-sm space-y-8 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 border-b border-zinc-50 pb-6">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Gallery & Media</h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Visual Identity & Assets</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-start">
                <div className="w-full sm:w-48 h-64 sm:h-64 rounded-[32px] bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 shadow-inner group overflow-hidden relative transition-all active:scale-95">
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-3">
                       <Loader2 className="w-8 h-8 text-brand animate-spin" />
                       <p className="text-[10px] font-extrabold text-brand uppercase tracking-widest">{uploadProgress}%</p>
                    </div>
                  ) : formData.image ? (
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-zinc-200" />
                  )}
                  {formData.image && !isUploading && (
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <p className="text-[10px] font-extrabold text-white uppercase tracking-widest">Click to Replace</p>
                     </div>
                  )}
                </div>
                <div className="flex-1 w-full space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2 group flex items-center gap-2">
                       Media Asset (Supabase Storage)
                       <AlertCircle className="w-3 h-3 text-zinc-300 group-hover:text-amber-500 transition-colors" />
                    </label>
                    
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="h-20 rounded-2xl border-2 border-dashed border-zinc-100 hover:border-brand/40 bg-zinc-50/50 hover:bg-brand/[0.02] transition-all flex items-center justify-center gap-4 group">
                         <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-zinc-400 group-hover:text-brand transition-colors">
                            <Upload className="w-5 h-5" />
                         </div>
                         <div className="text-left">
                            <p className="text-sm font-bold text-zinc-900 leading-none">Choose high-res asset</p>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Direct upload to 'product' bucket</p>
                         </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-50/50 border border-zinc-100/50 text-[10px] text-zinc-400 font-bold leading-relaxed space-y-1.5 font-sans">
                       <p className="inline-flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Storage:supabase-storage://product</p>
                       <p className="inline-flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Optimized CDN distribution enabled.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Product Information */}
          <section className="bg-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-zinc-100 shadow-sm space-y-8 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 border-b border-zinc-50 pb-6">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                <Tag className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Product Information</h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Classification & Naming</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">Production Name</label>
                <Input 
                  placeholder="e.g. Signature Oversized Tee" 
                  value={formData.name}
                  onChange={(e) => handleSlugify(e.target.value)}
                  className="rounded-2xl border-zinc-100 h-16 font-bold text-xl text-zinc-900 focus:ring-brand/10 shadow-sm"
                  required
                />
                <div className="px-2 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest leading-none">Automated ID: {formData.slug || "new-creation"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Collection Selection */}
                 <div className="space-y-4">
                   <div className="flex flex-col gap-1 px-2">
                     <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Collection Cluster</label>
                     <p className="text-[9px] text-zinc-300 font-bold uppercase">Primary Allocation</p>
                   </div>
                   <Select 
                     value={formData.categoryId} 
                     onValueChange={(v) => setFormData(prev => ({ ...prev, categoryId: v }))}
                   >
                     <SelectTrigger className="w-full h-16 rounded-2xl border-zinc-100 bg-zinc-50/50 px-6 font-bold text-zinc-900 shadow-sm transition-all focus:ring-brand/10 hover:border-zinc-200 hover:bg-white text-left">
                       <SelectValue placeholder="Assign to Cluster" />
                     </SelectTrigger>
                     <SelectContent className="rounded-3xl border-zinc-100 shadow-2xl p-2 bg-white z-50">
                       {categories.map((cat) => (
                         <SelectItem 
                           key={cat.id} 
                           value={cat.id} 
                           className="rounded-xl py-4 px-4 font-bold text-zinc-600 focus:bg-brand/5 focus:text-brand cursor-pointer transition-colors outline-none"
                         >
                           {cat.name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>

                 <div className="space-y-4">
                   <div className="flex flex-col gap-1 px-2">
                     <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sub-Classification</label>
                     <p className="text-[9px] text-zinc-300 font-bold uppercase">Minor Descriptor</p>
                   </div>
                   <Input 
                      placeholder="e.g. Vintage" 
                      value={formData.subCategory}
                      onChange={(e) => setFormData(p => ({ ...p, subCategory: e.target.value }))}
                      className="rounded-2xl border-zinc-100 h-16 font-bold text-zinc-900 bg-zinc-50/50 shadow-sm"
                      required
                   />
                 </div>
              </div>

              {/* Product Narrative */}
              <div className="space-y-4">
                <div className="flex flex-col gap-1 px-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Product Narrative</label>
                  <p className="text-[9px] text-zinc-300 font-bold uppercase">Draft the story of this creation</p>
                </div>
                <textarea 
                  placeholder="Tell the story of this creation..." 
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  className="w-full rounded-[32px] border border-zinc-100 p-8 min-h-[160px] font-medium text-zinc-900 focus:ring-2 focus:ring-brand/10 focus:border-brand/20 transition-all shadow-sm outline-none resize-none bg-zinc-50/50 focus:bg-white leading-relaxed"
                  required
                />
              </div>
            </div>
          </section>

          {/* Product Variants Section */}
          <section className="bg-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-zinc-100 shadow-sm space-y-8 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 border-b border-zinc-50 pb-6">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Variant Orchestration</h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Sizing & Color Palettes</p>
              </div>
            </div>

            <div className="space-y-10">
              {/* Size Selection & Inventory Orchestration */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.1em]">
                      {isPerfume ? "Scent Volume & Stock" : (isWatch ? "Case Diameter & Stock" : "Standard Sizing & Inventory")}
                    </label>
                    <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest">Quantity-per-selection Management</p>
                  </div>
                  <span className="text-[9px] font-extrabold text-brand uppercase tracking-widest bg-brand/5 px-3 py-1.5 rounded-full border border-brand/10">Dynamic Mapping</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {(isPerfume ? ["50ml", "100ml"] : isWatch ? ["40mm", "42mm", "44mm"] : ["XS", "S", "M", "L", "XL", "XXL", "3XL"]).map((sizeLabel) => {
                    // Extract size and quantity if it exists, otherwise it's unselected
                    const sizeData = formData.sizes.find((s: string) => s.split(":")[0] === sizeLabel);
                    const isSelected = !!sizeData;
                    const quantity = isSelected ? sizeData.split(":")[1] : "0";

                    return (
                      <div 
                        key={sizeLabel}
                        className={cn(
                          "group relative p-5 rounded-[28px] border transition-all duration-300",
                          isSelected 
                            ? "bg-zinc-900 border-zinc-900 shadow-xl shadow-zinc-200" 
                            : "bg-white border-zinc-100 hover:border-zinc-200"
                        )}
                      >
                        <div className="flex items-center justify-between gap-4 mb-4">
                           <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  const newSizes = isSelected 
                                    ? formData.sizes.filter((s: string) => s.split(":")[0] !== sizeLabel)
                                    : [...formData.sizes, `${sizeLabel}:0`];
                                  setFormData(p => ({ ...p, sizes: newSizes }));
                                }}
                                className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                  isSelected ? "bg-brand text-white" : "bg-zinc-50 text-zinc-400 group-hover:text-zinc-600"
                                )}
                              >
                                {isSelected ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                              </button>
                              <span className={cn("text-sm font-black tracking-tight", isSelected ? "text-white" : "text-zinc-400 group-hover:text-zinc-900 transition-colors")}>
                                {sizeLabel}
                              </span>
                           </div>
                        </div>

                        {isSelected && (
                           <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                             <div className="flex items-center justify-between px-1">
                               <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">In Stock</label>
                               <span className="text-[9px] font-bold text-brand uppercase tracking-tighter">Units</span>
                             </div>
                             <Input 
                                type="number"
                                value={quantity}
                                min="0"
                                onFocus={(e) => {
                                  if (quantity === "0") {
                                    const newSizes = formData.sizes.map((s: string) => 
                                      s.split(":")[0] === sizeLabel ? `${sizeLabel}:` : s
                                    );
                                    setFormData(p => ({ ...p, sizes: newSizes }));
                                  }
                                }}
                                onBlur={() => {
                                  if (quantity === "") {
                                    const newSizes = formData.sizes.map((s: string) => 
                                      s.split(":")[0] === sizeLabel ? `${sizeLabel}:0` : s
                                    );
                                    setFormData(p => ({ ...p, sizes: newSizes }));
                                  }
                                }}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const newSizes = formData.sizes.map((s: string) => 
                                    s.split(":")[0] === sizeLabel ? `${sizeLabel}:${val}` : s
                                  );
                                  setFormData(p => ({ ...p, sizes: newSizes }));
                                }}
                                className="h-12 rounded-xl bg-white/10 border-white/10 text-white font-bold text-sm focus:ring-brand/20 tabular-nums"
                             />
                           </div>
                        )}

                        {!isSelected && (
                           <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest px-1">Unassigned</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Color Palette Orchestration */}
              <div className="space-y-5">
                <div className="flex items-center justify-between px-2">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.1em]">Color Palette</label>
                  <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest">Visual Clusters</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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
                          "px-6 h-14 rounded-2xl border font-bold text-[10px] uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-sm flex items-center gap-4",
                          isSelected 
                            ? "bg-zinc-900 border-zinc-900 text-white shadow-xl shadow-zinc-200" 
                            : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200 hover:text-zinc-600"
                        )}
                      >
                        <div 
                          className="w-5 h-5 rounded-full border border-white/20 shadow-sm" 
                          style={{ backgroundColor: color.toLowerCase() }} 
                        />
                        <span className="flex-1 text-left">{color}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-brand" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Commerce & Pricing Section */}
          <section className="bg-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-zinc-100 shadow-sm space-y-8 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 border-b border-zinc-50 pb-6">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Pricing & Strategy</h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Commercial Performance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">Selling Price (₹)</label>
                <div className="relative">
                  <Input 
                    type="number"
                    placeholder="999" 
                    value={formData.price}
                    onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))}
                    className="rounded-2xl border-zinc-100 h-16 font-bold text-xl text-zinc-900 pl-12 shadow-sm"
                    required
                  />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₹</span>
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
                    className="rounded-2xl border-zinc-100 h-16 font-medium text-zinc-400 pl-12 bg-zinc-50/50 shadow-sm"
                    required
                  />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 font-bold">₹</span>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">Disc Strategy (%)</label>
                <Input 
                  type="number"
                  placeholder="30" 
                  value={formData.discount}
                  onChange={(e) => setFormData(p => ({ ...p, discount: e.target.value }))}
                  className="rounded-2xl border-zinc-100 h-16 font-bold text-zinc-600 bg-brand/5 border-brand/10 shadow-sm text-center"
                  required
                />
              </div>
            </div>
          </section>

          {/* Visibility Section */}
          <section className="bg-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-zinc-100 shadow-sm space-y-8 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 border-b border-zinc-50 pb-6">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Market Visibility</h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Recognition Flags</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 bg-zinc-50/50 p-6 sm:p-8 rounded-3xl border border-zinc-100 transition-all hover:bg-zinc-50">
              <div className="flex-1 flex items-center space-x-4 group cursor-pointer">
                <Checkbox 
                  id="isNew" 
                  checked={formData.isNew} 
                  onCheckedChange={(c) => setFormData(p => ({ ...p, isNew: !!c }))}
                  className="w-6 h-6 rounded-lg border-zinc-200 transition-all data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                />
                <label htmlFor="isNew" className="text-sm font-bold text-zinc-600 cursor-pointer group-hover:text-zinc-900 transition-colors uppercase tracking-tight">Highlight as New Arrival</label>
              </div>
              <div className="flex-1 flex items-center space-x-4 group cursor-pointer">
                <Checkbox 
                  id="isBestSeller" 
                  checked={formData.isBestSeller} 
                  onCheckedChange={(c) => setFormData(p => ({ ...p, isBestSeller: !!c }))}
                  className="w-6 h-6 rounded-lg border-zinc-200 transition-all data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                />
                <label htmlFor="isBestSeller" className="text-sm font-bold text-zinc-600 cursor-pointer group-hover:text-zinc-900 transition-colors uppercase tracking-tight">Mark as Bestseller</label>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Preview */}
        <div className="lg:col-span-1 space-y-8">
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
