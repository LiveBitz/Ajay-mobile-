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
  EyeOff,
  CheckCircle2,
  Upload,
  AlertCircle,
  X,
  Plus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  existingSubCategories?: Record<string, string[]>;
}

export function ProductForm({
  categories,
  initialData,
  preSelectedCategoryId,
  existingSubCategories = {},
}: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [showPreview, setShowPreview] = useState(false);

  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    price: initialData?.price?.toString() || "",
    originalPrice: initialData?.originalPrice?.toString() || "",
    discount: initialData?.discount?.toString() || "0",
    stock: initialData?.stock?.toString() || "10",
    categoryId: initialData?.categoryId || preSelectedCategoryId || "",
    subCategory: initialData?.subCategory || "",
    image: initialData?.image || "",
    images: Array.isArray(initialData?.images) ? initialData.images : [],
    isNew: initialData?.isNew ?? true,
    isBestSeller: initialData?.isBestSeller ?? false,
    sizes: Array.isArray(initialData?.sizes) ? initialData.sizes : [],
    colors: Array.isArray(initialData?.colors) ? initialData.colors : [],
    description: initialData?.description || "",
    features: Array.isArray(initialData?.features) ? initialData.features : [],
  });

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);
  const isPerfume =
    selectedCategory?.name?.toLowerCase() === "perfumes";
  const isWatch =
    selectedCategory?.name?.toLowerCase() === "watches";
  const isApparel =
    selectedCategory?.name?.toLowerCase() === "men";

  useEffect(() => {
    if (!isEdit && !initialData && formData.categoryId) {
      if (isPerfume) {
        setFormData((p) => ({ ...p, sizes: ["50ml", "100ml"] }));
      } else if (isApparel) {
        setFormData((p) => ({ ...p, sizes: ["S", "M", "L", "XL"] }));
      }
    }
  }, [formData.categoryId, isPerfume, isApparel, isEdit]);

  const handleSlugify = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
    setFormData((prev) => ({ ...prev, name, slug }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slot: 'main' | number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const id = slot === 'main' ? 'main' : `gallery-${slot}`;

    try {
      setIsUploading(prev => ({ ...prev, [id]: true }));
      setUploadProgress(prev => ({ ...prev, [id]: 10 }));

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      setUploadProgress(prev => ({ ...prev, [id]: 30 }));

      const { error: uploadError } = await supabase.storage
        .from("product")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      setUploadProgress(prev => ({ ...prev, [id]: 80 }));

      const {
        data: { publicUrl },
      } = supabase.storage.from("product").getPublicUrl(filePath);

      if (slot === 'main') {
        setFormData((prev) => ({ ...prev, image: publicUrl }));
      } else {
        setFormData((prev) => {
          const newImages = [...prev.images];
          newImages[slot] = publicUrl;
          return { ...prev, images: newImages };
        });
      }
      
      setUploadProgress(prev => ({ ...prev, [id]: 100 }));
      toast({
        title: "Media asset synchronized",
        description: `Image successfully uploaded to ${slot === 'main' ? 'Primary' : 'Gallery'} slot.`,
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Verify storage bucket permissions.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsUploading(prev => ({ ...prev, [id]: false }));
        setUploadProgress(prev => ({ ...prev, [id]: 0 }));
      }, 500);
    }
  };

  const handleRemoveImage = (slot: 'main' | number) => {
    if (slot === 'main') {
      setFormData(prev => ({ ...prev, image: "" }));
    } else {
      setFormData(prev => {
        const newImages = [...prev.images];
        newImages.splice(slot, 1);
        return { ...prev, images: newImages };
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        images: formData.images.filter(Boolean)
      };

      const result = isEdit
        ? await updateProduct(initialData.id, payload)
        : await createProduct(payload);

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

  /* ── Shared preview card (rendered in sidebar & modal) ── */
  const PreviewCard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-base font-bold text-zinc-900">Live Simulation</h3>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
            Real-time Preview
          </p>
        </div>
        <div className="flex items-center gap-2 text-zinc-400 font-bold text-[10px] uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </div>
      </div>

      <div className="group relative bg-white rounded-[32px] overflow-hidden border border-zinc-100 shadow-2xl transition-all duration-700 hover:shadow-brand/5 flex flex-col">
        <div className="aspect-[3/4] relative overflow-hidden bg-zinc-50">
          {formData.image ? (
            <img
              src={formData.image}
              alt="Simulation"
              className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-zinc-300">
              <ImageIcon className="w-12 h-12 mb-3 opacity-50" />
              <p className="font-bold text-[10px] uppercase tracking-widest leading-relaxed">
                Simulation requires
                <br />
                Visual Identity URL
              </p>
            </div>
          )}
          <div className="absolute top-5 left-5 flex flex-col gap-2">
            {formData.isNew && (
              <span className="bg-zinc-900 text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl shadow-black/20">
                NEW
              </span>
            )}
            {formData.isBestSeller && (
              <span className="bg-brand text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl shadow-brand/20">
                BESTSELLER
              </span>
            )}
          </div>
        </div>

        <div className="p-6 space-y-3">
          <div className="space-y-0.5">
            <p className="text-[10px] text-brand font-bold uppercase tracking-widest">
              {categories.find((c) => c.id === formData.categoryId)?.name ||
                "Unassigned"}{" "}
              Collection
            </p>
            <h2 className="text-lg font-bold text-zinc-900 truncate tracking-tight">
              {formData.name || "Signature Item Name"}
            </h2>
          </div>

          <div className="flex items-end justify-between pt-1">
            <div className="flex flex-col">
              <p className="text-xl font-bold text-zinc-900 font-heading">
                ₹{formData.price || "000"}
              </p>
              {parseInt(formData.discount) > 0 && (
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] text-zinc-400 line-through">
                    ₹{formData.originalPrice || "000"}
                  </p>
                  <p className="text-[9px] text-brand font-bold uppercase tracking-tighter">
                    Save {formData.discount}%
                  </p>
                </div>
              )}
            </div>
            <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-all duration-500 shadow-sm">
              <span className="text-xl">+</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/5 p-5 rounded-[24px] border border-zinc-900/10 text-center space-y-3">
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">
          Ensure all commercial strategies
          <br />
          align with brand guidelines.
        </p>
        <div className="w-10 h-1 bg-zinc-900/10 mx-auto rounded-full" />
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile Preview Modal Overlay ── */}
      {showPreview && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPreview(false)}
          />
          {/* Drawer */}
          <div className="absolute bottom-0 left-0 right-0 bg-zinc-50 rounded-t-[40px] p-5 pb-10 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-extrabold text-zinc-900 uppercase tracking-widest">
                  Live Preview
                </p>
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                  Simulated Store View
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="w-10 h-10 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <PreviewCard />
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 sm:space-y-10 pb-28 animate-in fade-in slide-in-from-bottom-4 duration-1000"
      >
        {/* ── Sticky Action Header ── */}
        <div className="flex items-center justify-between gap-3 sticky top-0 z-40 bg-zinc-50/90 backdrop-blur-md py-3 sm:py-4 -mx-3 px-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-zinc-100">
          {/* Left: back + title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin/products" className="shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl hover:bg-white shadow-sm transition-all active:scale-95 border border-zinc-100"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-900" />
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl lg:text-2xl font-extrabold font-heading tracking-tight text-zinc-900 truncate">
                {isEdit ? "Refine Creation" : "New Product"}
              </h1>
              <p className="text-[9px] text-brand font-bold uppercase tracking-[0.15em] hidden sm:block">
                {isEdit
                  ? `ID: ${initialData.id.slice(0, 8).toUpperCase()}`
                  : "Digital Inventory Draft"}
              </p>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Preview toggle – hidden on lg+ (sidebar is always visible) */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(true)}
              className="lg:hidden h-9 sm:h-11 px-3 sm:px-5 rounded-xl sm:rounded-2xl border-zinc-100 font-bold text-zinc-600 text-xs sm:text-sm gap-2 shadow-sm active:scale-95"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
            </Button>

            <Link href="/admin/products" className="hidden sm:block">
              <Button
                type="button"
                variant="ghost"
                className="h-11 px-5 rounded-2xl font-bold text-zinc-500 hover:text-zinc-900 transition-colors text-sm"
              >
                Discard
              </Button>
            </Link>

            <Button
              type="submit"
              disabled={isSubmitting || Object.values(isUploading).some(Boolean)}
              className="h-9 sm:h-11 px-4 sm:px-8 rounded-xl sm:rounded-2xl bg-brand hover:bg-brand/90 text-white font-bold shadow-xl shadow-brand/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              {isSubmitting || Object.values(isUploading).some(Boolean) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isSubmitting
                  ? "Committing..."
                  : isUploading
                  ? "Uploading..."
                  : isEdit
                  ? "Update"
                  : "Publish"}
              </span>
              <span className="sm:hidden">
                {isSubmitting || isUploading ? "..." : isEdit ? "Update" : "Save"}
              </span>
            </Button>
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 items-start">
          {/* Form Sections */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">

            {/* Gallery & Media Expansion */}
            <section className="bg-white p-5 sm:p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-8 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 border-b border-zinc-50 pb-5">
                <div className="w-9 h-9 rounded-xl bg-zinc-50 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                    Multi-Asset Gallery
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                    Visual Identity & Supplemental Assets
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Primary Asset */}
                <div className="space-y-4">
                  <div className="px-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Main Display (Primary Slot)
                    </label>
                    <p className="text-[9px] text-zinc-300 font-bold uppercase mt-0.5">
                      This asset represents the product in all catalog views
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="w-full sm:w-60 aspect-square rounded-[32px] bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 shadow-inner group overflow-hidden relative transition-all active:scale-95">
                      {isUploading['main'] ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 text-brand animate-spin" />
                          <p className="text-[10px] font-extrabold text-brand uppercase tracking-widest">
                            {uploadProgress['main']}%
                          </p>
                        </div>
                      ) : formData.image ? (
                        <>
                          <img
                            src={formData.image}
                            alt="Primary"
                            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage('main')}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-xl flex items-center justify-center text-zinc-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-zinc-200">
                          <ImageIcon className="w-12 h-12" />
                          <p className="text-[9px] font-bold uppercase tracking-widest">Awaiting Identity</p>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-4">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'main')}
                          disabled={isUploading['main']}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="h-20 rounded-2xl border-2 border-dashed border-zinc-100 hover:border-brand/40 bg-zinc-50/50 hover:bg-brand/[0.02] transition-all flex items-center justify-center gap-3 group">
                          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-zinc-400 group-hover:text-brand transition-colors shrink-0">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-zinc-900 leading-none">
                              Synchronize Primary Asset
                            </p>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">
                              High-res 1:1 ratio recommended
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Supplemental Gallery (3 Slots) */}
                <div className="space-y-4 pt-4 border-t border-zinc-50">
                  <div className="px-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Supplemental Assets (Gallery Slots)
                    </label>
                    <p className="text-[9px] text-zinc-300 font-bold uppercase mt-0.5">
                      Additional perspectives for the detailed showcase
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
                    {[0, 1, 2].map((idx) => {
                      const id = `gallery-${idx}`;
                      const imageUrl = formData.images[idx];
                      const uploading = isUploading[id];
                      const progress = uploadProgress[id];

                      return (
                        <div key={idx} className="space-y-3">
                          <div className="aspect-[4/5] rounded-[24px] bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 shadow-inner group overflow-hidden relative transition-all active:scale-95">
                            {uploading ? (
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-6 h-6 text-brand animate-spin" />
                                <p className="text-[9px] font-extrabold text-brand uppercase tracking-widest">
                                  {progress}%
                                </p>
                              </div>
                            ) : imageUrl ? (
                              <>
                                <img
                                  src={imageUrl}
                                  alt={`Gallery ${idx + 1}`}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm shadow-xl flex items-center justify-center text-zinc-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <div className="relative w-full h-full">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, idx)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-200 group-hover:text-zinc-300 transition-colors">
                                  <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-zinc-200 group-hover:text-brand/40 transition-all">
                                    <Plus className="w-6 h-6" />
                                  </div>
                                  <p className="text-[8px] font-extrabold uppercase tracking-[0.2em]">Add Slot {idx + 1}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* Product Information */}
            <section className="bg-white p-5 sm:p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 border-b border-zinc-50 pb-5">
                <div className="w-9 h-9 rounded-xl bg-zinc-50 flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                    Product Information
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                    Classification & Naming
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                    Production Name
                  </label>
                  <Input
                    placeholder="e.g. Signature Oversized Tee"
                    value={formData.name || ""}
                    onChange={(e) => handleSlugify(e.target.value)}
                    className="rounded-2xl border-zinc-100 h-13 sm:h-14 font-bold text-lg sm:text-xl text-zinc-900 focus:ring-brand/10 shadow-sm"
                    required
                  />
                  <div className="px-1 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest truncate">
                      Automated ID: {formData.slug || "new-creation"}
                    </p>
                  </div>
                </div>

                {/* Category + SubCategory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <div className="px-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Collection Cluster
                      </label>
                      <p className="text-[9px] text-zinc-300 font-bold uppercase mt-0.5">
                        Primary Allocation
                      </p>
                    </div>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(v) =>
                        setFormData((prev) => ({ ...prev, categoryId: v }))
                      }
                    >
                      <SelectTrigger className="w-full h-13 sm:h-14 rounded-2xl border-zinc-100 bg-zinc-50/50 px-5 font-bold text-zinc-900 shadow-sm transition-all focus:ring-brand/10 hover:border-zinc-200 hover:bg-white">
                        <SelectValue placeholder="Assign to Cluster" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-zinc-100 shadow-2xl p-2 bg-white z-50">
                        {categories.map((cat) => (
                          <SelectItem
                            key={cat.id}
                            value={cat.id}
                            className="rounded-xl py-3 px-4 font-bold text-zinc-600 focus:bg-brand/5 focus:text-brand cursor-pointer"
                          >
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="px-1 flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          Sub-Classification
                        </label>
                        <p className="text-[9px] text-zinc-300 font-bold uppercase">
                          Minor Descriptor
                        </p>
                      </div>
                      {existingSubCategories[formData.categoryId]?.length > 0 && (
                        <span className="text-[9px] font-extrabold text-brand uppercase tracking-widest bg-brand/5 px-3 py-1.5 rounded-full border border-brand/10">
                          Suggestions Enabled
                        </span>
                      )}
                    </div>
                    <Input
                      placeholder="e.g. Vintage"
                      value={formData.subCategory || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          subCategory: e.target.value,
                        }))
                      }
                      className="rounded-2xl border-zinc-100 h-13 sm:h-14 font-bold text-zinc-900 bg-zinc-50/50 shadow-sm focus:bg-white transition-all"
                      required
                    />
                    
                    {/* Unique Classification Suggestions */}
                    {(() => {
                      const suggestions = existingSubCategories[formData.categoryId] || [];
                      if (suggestions.length === 0) return null;
                      
                      return (
                        <div className="pt-2 px-1 space-y-2">
                          <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                            Existing Patterns for this Cluster:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {suggestions.map((sub) => {
                              const isSelected = formData.subCategory === sub;
                              return (
                                <button
                                  key={sub}
                                  type="button"
                                  onClick={() => setFormData(p => ({ ...p, subCategory: sub }))}
                                  className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border shadow-sm active:scale-95",
                                    isSelected
                                      ? "bg-zinc-900 border-zinc-900 text-white shadow-zinc-200"
                                      : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200 hover:text-zinc-600"
                                  )}
                                >
                                  {sub}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <div className="px-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Product Narrative
                    </label>
                    <p className="text-[9px] text-zinc-300 font-bold uppercase mt-0.5">
                      Draft the story of this creation
                    </p>
                  </div>
                  <textarea
                    placeholder="Tell the story of this creation..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="w-full rounded-[24px] border border-zinc-100 p-5 sm:p-6 min-h-[140px] sm:min-h-[160px] font-medium text-zinc-900 focus:ring-2 focus:ring-brand/10 focus:border-brand/20 transition-all shadow-sm outline-none resize-none bg-zinc-50/50 focus:bg-white leading-relaxed text-sm"
                    required
                  />
                </div>
              </div>
            </section>

            {/* Variant Orchestration */}
            <section className="bg-white p-5 sm:p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 border-b border-zinc-50 pb-5">
                <div className="w-9 h-9 rounded-xl bg-zinc-50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                    Variant Orchestration
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                    Sizing & Color Palettes
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Sizes */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.1em]">
                        {isPerfume
                          ? "Scent Volume & Stock"
                          : isWatch
                          ? "Case Diameter & Stock"
                          : "Standard Sizing & Inventory"}
                      </label>
                      <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest mt-0.5">
                        Quantity-per-selection Management
                      </p>
                    </div>
                    <span className="self-start sm:self-auto text-[9px] font-extrabold text-brand uppercase tracking-widest bg-brand/5 px-3 py-1.5 rounded-full border border-brand/10 whitespace-nowrap">
                      Dynamic Mapping
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                    {(isPerfume
                      ? ["50ml", "100ml"]
                      : isWatch
                      ? ["40mm", "42mm", "44mm"]
                      : ["XS", "S", "M", "L", "XL", "XXL", "3XL"]
                    ).map((sizeLabel) => {
                      const sizeData = formData.sizes.find(
                        (s: string) => s.split(":")[0] === sizeLabel
                      );
                      const isSelected = !!sizeData;
                      const quantity = isSelected
                        ? (sizeData.split(":")[1] || "")
                        : "0";

                      return (
                        <div
                          key={sizeLabel}
                          className={cn(
                            "group relative p-4 rounded-[24px] border transition-all duration-300",
                            isSelected
                              ? "bg-zinc-900 border-zinc-900 shadow-xl shadow-zinc-200"
                              : "bg-white border-zinc-100 hover:border-zinc-200"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <button
                              type="button"
                              onClick={() => {
                                const newSizes = isSelected
                                  ? formData.sizes.filter(
                                      (s: string) =>
                                        s.split(":")[0] !== sizeLabel
                                    )
                                  : [
                                      ...formData.sizes,
                                      `${sizeLabel}:0`,
                                    ];
                                setFormData((p) => ({
                                  ...p,
                                  sizes: newSizes,
                                }));
                              }}
                              className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0",
                                isSelected
                                  ? "bg-brand text-white"
                                  : "bg-zinc-50 text-zinc-400 group-hover:text-zinc-600"
                              )}
                            >
                              {isSelected ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                              )}
                            </button>
                            <span
                              className={cn(
                                "text-xs font-black tracking-tight",
                                isSelected
                                  ? "text-white"
                                  : "text-zinc-400 group-hover:text-zinc-900 transition-colors"
                              )}
                            >
                              {sizeLabel}
                            </span>
                          </div>

                          {isSelected && (
                            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="flex items-center justify-between px-0.5">
                                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                  Stock
                                </label>
                                <span className="text-[9px] font-bold text-brand uppercase">
                                  Units
                                </span>
                              </div>
                              <Input
                                type="number"
                                value={quantity}
                                min="0"
                                onFocus={() => {
                                  if (quantity === "0") {
                                    const newSizes = formData.sizes.map(
                                      (s: string) =>
                                        s.split(":")[0] === sizeLabel
                                          ? `${sizeLabel}:`
                                          : s
                                    );
                                    setFormData((p) => ({
                                      ...p,
                                      sizes: newSizes,
                                    }));
                                  }
                                }}
                                onBlur={() => {
                                  if (quantity === "") {
                                    const newSizes = formData.sizes.map(
                                      (s: string) =>
                                        s.split(":")[0] === sizeLabel
                                          ? `${sizeLabel}:0`
                                          : s
                                    );
                                    setFormData((p) => ({
                                      ...p,
                                      sizes: newSizes,
                                    }));
                                  }
                                }}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const newSizes = formData.sizes.map(
                                    (s: string) =>
                                      s.split(":")[0] === sizeLabel
                                        ? `${sizeLabel}:${val}`
                                        : s
                                  );
                                  setFormData((p) => ({
                                    ...p,
                                    sizes: newSizes,
                                  }));
                                }}
                                className="h-10 rounded-xl bg-white/10 border-white/10 text-white font-bold text-sm focus:ring-brand/20 tabular-nums"
                              />
                            </div>
                          )}

                          {!isSelected && (
                            <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
                              Unassigned
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.1em]">
                        Color Palette
                      </label>
                      <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest">
                        Visual Clusters
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {[
                        "Black",
                        "White",
                        "Grey",
                        "Navy",
                        "Red",
                        "Blue",
                        "Green",
                        "Yellow",
                        "Orange",
                        "Purple",
                        "Brown",
                        ...formData.colors.filter((c: string) => ![
                          "Black", "White", "Grey", "Navy", "Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Brown"
                        ].includes(c))
                      ].map((color) => {
                        const isSelected = formData.colors.includes(color);
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              const newColors = isSelected
                                ? formData.colors.filter(
                                    (c: string) => c !== color
                                  )
                                : Array.from(new Set([...formData.colors, color]));
                              setFormData((p) => ({
                                ...p,
                                colors: newColors,
                              }));
                            }}
                            className={cn(
                              "px-4 h-12 rounded-2xl border font-bold text-[10px] uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-sm flex items-center gap-3",
                              isSelected
                                ? "bg-zinc-900 border-zinc-900 text-white shadow-xl shadow-zinc-200"
                                : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200 hover:text-zinc-600"
                            )}
                          >
                            <div
                              className="w-4 h-4 rounded-full border border-white/20 shadow-sm shrink-0"
                              style={{ 
                                backgroundColor: color.toLowerCase() === "white" 
                                  ? "#ffffff" 
                                  : color.toLowerCase() 
                              }}
                            />
                            <span className="flex-1 text-left truncate">{color}</span>
                            {isSelected && (
                              <CheckCircle2 className="w-3 h-3 text-brand shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Color Input */}
                    <div className="flex gap-2 pt-2 px-1">
                      <div className="relative flex-1">
                        <Input
                          placeholder="Add Custom Color..."
                          id="customColor"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.currentTarget;
                              const val = input.value.trim();
                              if (val && !formData.colors.includes(val)) {
                                setFormData(p => ({
                                  ...p,
                                  colors: Array.from(new Set([...p.colors, val]))
                                }));
                                input.value = '';
                              }
                            }
                          }}
                          className="h-12 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white text-[10px] font-bold uppercase tracking-widest pl-10"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <Sparkles className="w-4 h-4 text-zinc-300" />
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('customColor') as HTMLInputElement;
                          const val = input.value.trim();
                          if (val && !formData.colors.includes(val)) {
                            setFormData(p => ({
                              ...p,
                              colors: Array.from(new Set([...p.colors, val]))
                            }));
                            input.value = '';
                          }
                        }}
                        className="h-12 rounded-2xl bg-zinc-900 text-white px-6 text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-zinc-200 active:scale-95"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
              </div>
            </section>

            {/* Pricing */}
            <section className="bg-white p-5 sm:p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 border-b border-zinc-50 pb-5">
                <div className="w-9 h-9 rounded-xl bg-zinc-50 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                    Pricing & Strategy
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                    Commercial Performance
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                    Selling Price (₹)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="999"
                      value={formData.price || ""}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, price: e.target.value }))
                      }
                      className="rounded-2xl border-zinc-100 h-13 sm:h-14 font-bold text-lg sm:text-xl text-zinc-900 pl-10 shadow-sm"
                      required
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">
                      ₹
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                    List Price (₹)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="1499"
                      value={formData.originalPrice || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          originalPrice: e.target.value,
                        }))
                      }
                      className="rounded-2xl border-zinc-100 h-13 sm:h-14 font-medium text-zinc-400 pl-10 bg-zinc-50/50 shadow-sm"
                      required
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 font-bold text-sm">
                      ₹
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                    Disc Strategy (%)
                  </label>
                  <Input
                    type="number"
                    placeholder="30"
                    value={formData.discount || ""}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, discount: e.target.value }))
                    }
                    className="rounded-2xl border-zinc-100 h-13 sm:h-14 font-bold text-zinc-600 bg-brand/5 border-brand/10 shadow-sm text-center"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                    Available Stock
                  </label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={formData.stock || ""}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, stock: e.target.value }))
                    }
                    className="rounded-2xl border-zinc-100 h-13 sm:h-14 font-bold text-zinc-600 bg-emerald-50/50 border-emerald-100/50 shadow-sm text-center"
                    required
                  />
                </div>
              </div>
            </section>

            {/* Market Visibility */}
            <section className="bg-white p-5 sm:p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 border-b border-zinc-50 pb-5">
                <div className="w-9 h-9 rounded-xl bg-zinc-50 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                    Market Visibility
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                    Recognition Flags
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 bg-zinc-50/50 p-5 sm:p-6 rounded-2xl border border-zinc-100">
                <div className="flex-1 flex items-center space-x-4 group cursor-pointer">
                  <Checkbox
                    id="isNew"
                    checked={formData.isNew}
                    onCheckedChange={(c) =>
                      setFormData((p) => ({ ...p, isNew: !!c }))
                    }
                    className="w-5 h-5 rounded-lg border-zinc-200 data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                  />
                  <label
                    htmlFor="isNew"
                    className="text-sm font-bold text-zinc-600 cursor-pointer group-hover:text-zinc-900 transition-colors uppercase tracking-tight"
                  >
                    Highlight as New Arrival
                  </label>
                </div>
                <div className="flex-1 flex items-center space-x-4 group cursor-pointer">
                  <Checkbox
                    id="isBestSeller"
                    checked={formData.isBestSeller}
                    onCheckedChange={(c) =>
                      setFormData((p) => ({ ...p, isBestSeller: !!c }))
                    }
                    className="w-5 h-5 rounded-lg border-zinc-200 data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                  />
                  <label
                    htmlFor="isBestSeller"
                    className="text-sm font-bold text-zinc-600 cursor-pointer group-hover:text-zinc-900 transition-colors uppercase tracking-tight"
                  >
                    Mark as Bestseller
                  </label>
                </div>
              </div>
            </section>
          </div>

          {/* ── Desktop Sidebar Preview (lg+) ── */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <PreviewCard />
            </div>
          </div>
        </div>
      </form>
    </>
  );
}