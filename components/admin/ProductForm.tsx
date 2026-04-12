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

  // Phone spec keys displayed in the admin form
  const PHONE_SPEC_KEYS = [
    "Processor",
    "RAM",
    "Display",
    "Battery",
    "Camera",
    "OS",
    "Connectivity",
  ] as const;

  type PhoneSpecKey = typeof PHONE_SPEC_KEYS[number];

  const parseSpecsFromFeatures = (features: string[]): Record<string, string> => {
    const specs: Record<string, string> = {};
    features.forEach((f) => {
      const colonIndex = f.indexOf(":");
      if (colonIndex > -1) {
        const key = f.slice(0, colonIndex).trim();
        const val = f.slice(colonIndex + 1).trim();
        if ((PHONE_SPEC_KEYS as readonly string[]).includes(key)) {
          specs[key] = val;
        }
      }
    });
    return specs;
  };

  const [phoneSpecs, setPhoneSpecs] = useState<Record<string, string>>(
    () => parseSpecsFromFeatures(
      Array.isArray(initialData?.features) ? initialData.features : []
    )
  );

  const handleSpecChange = (key: PhoneSpecKey, value: string) => {
    const updatedSpecs = { ...phoneSpecs, [key]: value };
    setPhoneSpecs(updatedSpecs);
    const nonSpecFeatures = (formData.features as string[]).filter((f: string) => {
      const colonIdx = f.indexOf(":");
      if (colonIdx === -1) return true;
      const fKey = f.slice(0, colonIdx).trim();
      return !(PHONE_SPEC_KEYS as readonly string[]).includes(fKey);
    });
    const specFeatures = Object.entries(updatedSpecs)
      .filter(([, v]) => v.trim() !== "")
      .map(([k, v]) => `${k}: ${v}`);
    setFormData((p: typeof formData) => ({ ...p, features: [...nonSpecFeatures, ...specFeatures] }));
  };

  // Helper functions to parse existing data
  const extractBaseSizes = (sizes: string[] = []) => {
    const baseSizes = new Set<string>();
    sizes.forEach((entry: string) => {
      if (entry.includes("-")) {
        // New format: "S-Purple:5" → extract "S"
        const baseSize = entry.split("-")[0];
        baseSizes.add(baseSize);
      } else if (entry.includes(":")) {
        // Old format: "S:10" → extract "S"
        const baseSize = entry.split(":")[0];
        baseSizes.add(baseSize);
      } else {
        // Plain size: "S"
        baseSizes.add(entry);
      }
    });
    return Array.from(baseSizes);
  };

  const extractColors = (sizes: string[] = []) => {
    const colors = new Set<string>();
    sizes.forEach((entry: string) => {
      if (entry.includes("-") && entry.includes(":")) {
        // New format: "S-Purple:5" → extract "Purple"
        const color = entry.split("-")[1].split(":")[0];
        colors.add(color);
      }
    });
    return Array.from(colors);
  };

  const parseSizeColorStock = (sizes: string[] = []) => {
    const stock: Record<string, number> = {};
    sizes.forEach((entry: string) => {
      if (entry.includes("-") && entry.includes(":")) {
        // New format: "S-Purple:5"
        const [key, quantity] = entry.split(":");
        stock[key] = parseInt(quantity) || 0;
      }
    });
    return stock;
  };

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    price: initialData?.price?.toString() || "",
    originalPrice: initialData?.originalPrice?.toString() || "",
    discount: initialData?.discount?.toString() || "0",
    categoryId: initialData?.categoryId || preSelectedCategoryId || "",
    subCategory: initialData?.subCategory || "",
    image: initialData?.image || "",
    images: Array.isArray(initialData?.images) ? initialData.images : [],
    isNew: initialData?.isNew ?? true,
    isBestSeller: initialData?.isBestSeller ?? false,
    sizes: extractBaseSizes(initialData?.sizes || []),
    colors: extractColors(initialData?.sizes || []).length > 0 
      ? extractColors(initialData?.sizes || [])
      : (Array.isArray(initialData?.colors) ? initialData.colors : []),
    description: initialData?.description || "",
    features: Array.isArray(initialData?.features) ? initialData.features : [],
  });

  // State for tracking size-color stock combinations
  const [sizeColorStock, setSizeColorStock] = useState<Record<string, number>>(
    parseSizeColorStock(initialData?.sizes || [])
  );

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);
  const isSmartAccessory =
    selectedCategory?.name?.toLowerCase() === "smart accessories";
  const isAccessory =
    selectedCategory?.name?.toLowerCase() === "accessories";
  const isSmartphone =
    selectedCategory?.name?.toLowerCase() === "smartphones";

  useEffect(() => {
    if (!isEdit && !initialData && formData.categoryId) {
      if (isSmartAccessory) {
        setFormData((p) => ({ ...p, sizes: ["256GB", "512GB", "1TB"] }));
      } else if (isSmartphone) {
        setFormData((p) => ({ ...p, sizes: ["64GB", "128GB", "256GB", "512GB"] }));
      }
    }
  }, [formData.categoryId, isSmartAccessory, isSmartphone, isEdit]);

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

  // Validation function
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Product name validation
    if (!formData.name || formData.name.trim().length === 0) {
      errors.push("Product name is required");
    } else if (formData.name.length > 255) {
      errors.push("Product name must be less than 255 characters");
    }

    // Slug validation
    if (!formData.slug || formData.slug.trim().length === 0) {
      errors.push("Product slug is required");
    }

    // Category validation
    if (!formData.categoryId) {
      errors.push("Please select a category");
    }

    // Price validation
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      errors.push("Valid price is required");
    } else if (parseFloat(formData.price) < 0) {
      errors.push("Price cannot be negative");
    }

    // Original price validation
    if (!formData.originalPrice || isNaN(parseFloat(formData.originalPrice))) {
      errors.push("Valid original price is required");
    } else if (parseFloat(formData.originalPrice) < 0) {
      errors.push("Original price cannot be negative");
    }

    // Price must be less than or equal to original price
    if (
      parseFloat(formData.price) > parseFloat(formData.originalPrice)
    ) {
      errors.push("Price must be less than or equal to original price");
    }

    // Image validation
    if (!formData.image) {
      errors.push("Main product image is required");
    }

    // Sizes validation
    if (formData.sizes.length === 0) {
      errors.push("At least one size must be selected");
    }

    // Colors validation
    if (formData.colors.length === 0) {
      errors.push("At least one color must be selected");
    }

    // Inventory validation - check if matrix has at least some values
    const hasInventory = Object.values(sizeColorStock).some((qty) => qty > 0);
    if (!hasInventory) {
      errors.push("Please add inventory for at least one size-color combination");
    }

    // Check for negative inventory
    Object.entries(sizeColorStock).forEach(([key, qty]) => {
      if (qty < 0) {
        errors.push(`Inventory for ${key} cannot be negative`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate before submitting
      const validation = validateForm();
      if (!validation.isValid) {
        validation.errors.forEach((error) => {
          toast({
            title: "Validation Error",
            description: error,
            variant: "destructive",
            duration: 3000,
          });
        });
        setIsSubmitting(false);
        return;
      }

      // Convert sizeColorStock back to storage format: ["S-White:5", "S-Black:3", ...]
      const storageSizes = Object.entries(sizeColorStock)
        .filter(([_, quantity]) => quantity > 0)
        .map(([key, quantity]) => `${key}:${quantity}`);

      const payload = {
        ...formData,
        sizes: storageSizes, // Use converted sizes with color and quantity
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
                    Essential Details & Metadata
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Product Name */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Product Name
                      </label>
                      <p className="text-[9px] text-zinc-300 font-bold uppercase mt-0.5">
                        Display Title for Customers
                      </p>
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
                      (formData.name || "").length > 50 
                        ? "bg-red-50 text-red-600" 
                        : (formData.name || "").length > 40
                        ? "bg-yellow-50 text-yellow-600"
                        : "bg-emerald-50 text-emerald-600"
                    )}>
                      {(formData.name || "").length}/60
                    </span>
                  </div>
                  <Input
                    placeholder="e.g. Classic White Oversized Tee"
                    value={formData.name || ""}
                    maxLength={60}
                    onChange={(e) => handleSlugify(e.target.value)}
                    className="rounded-2xl border-zinc-100 h-13 sm:h-14 font-bold text-lg sm:text-xl text-zinc-900 focus:ring-2 focus:ring-brand/20 shadow-sm"
                    required
                  />
                  <div className="px-1 flex items-center gap-2">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      formData.slug ? "bg-emerald-500" : "bg-zinc-300"
                    )} />
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest truncate">
                      URL Slug: <span className="font-mono text-zinc-600">{formData.slug || "auto-generated"}</span>
                    </p>
                  </div>
                </div>

                {/* Category & Sub-Category Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Collection Category */}
                  <div className="space-y-3">
                    <div className="px-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Collection Category
                      </label>
                      <p className="text-[9px] text-zinc-300 font-bold uppercase mt-0.5">
                        Primary Product grouping
                      </p>
                    </div>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(v) => {
                        setFormData((prev) => ({ ...prev, categoryId: v }));
                        // Auto-set sizes based on category
                        const category = categories.find(c => c.id === v);
                        if (!isEdit) {
                          if (category?.name?.toLowerCase() === "perfumes") {
                            setFormData((prev) => ({ ...prev, sizes: ["50ml", "100ml"] }));
                          } else if (category?.name?.toLowerCase() === "men") {
                            setFormData((prev) => ({ ...prev, sizes: ["S", "M", "L", "XL"] }));
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="w-full h-13 sm:h-14 rounded-2xl border-zinc-100 bg-white px-5 font-bold text-zinc-900 shadow-sm transition-all focus:ring-2 focus:ring-brand/20 hover:border-brand/20 border-brand/0">
                        <SelectValue placeholder="Select a collection..." />
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
                    {formData.categoryId && (
                      <div className="px-1 py-2 bg-brand/5 rounded-xl border border-brand/10">
                        <p className="text-[9px] font-bold text-brand uppercase tracking-widest">
                          ✓ {categories.find(c => c.id === formData.categoryId)?.name} selected
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Sub-Category */}
                  <div className="space-y-3">
                    <div className="px-1 flex items-center justify-between">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          Sub-Category Type
                        </label>
                        <p className="text-[9px] text-zinc-300 font-bold uppercase mt-0.5">
                          Product Type Classification
                        </p>
                      </div>
                      {(existingSubCategories[formData.categoryId]?.length > 0) && (
                        <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50/50 px-2 py-1 rounded-full border border-emerald-200/50">
                          Suggestions
                        </span>
                      )}
                    </div>
                    <Input
                      placeholder="e.g., T-Shirts, Hoodies, Analog..."
                      value={formData.subCategory || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          subCategory: e.target.value,
                        }))
                      }
                      className="rounded-2xl border-zinc-100 h-13 sm:h-14 font-bold text-zinc-900 bg-white shadow-sm focus:ring-2 focus:ring-brand/20"
                      required
                    />
                    
                    {/* Quick Selection Pills */}
                    {(() => {
                      const suggestions = existingSubCategories[formData.categoryId] || [];
                      if (suggestions.length === 0) return null;
                      
                      return (
                        <div className="pt-2 px-1 space-y-2">
                          <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                            Known Sub-Categories:
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
                                    "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border shadow-sm active:scale-95",
                                    isSelected
                                      ? "bg-brand border-brand text-white shadow-brand/20"
                                      : "bg-white border-zinc-100 text-zinc-500 hover:border-brand/30 hover:text-brand hover:bg-brand/5"
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

                {/* Product Description */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Product Description
                      </label>
                      <p className="text-[9px] text-zinc-300 font-bold uppercase mt-0.5">
                        Detailed Features & Benefits
                      </p>
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
                      (formData.description || "").length > 400
                        ? "bg-red-50 text-red-600"
                        : (formData.description || "").length > 350
                        ? "bg-yellow-50 text-yellow-600"
                        : "bg-emerald-50 text-emerald-600"
                    )}>
                      {(formData.description || "").length}/500
                    </span>
                  </div>
                  <textarea
                    placeholder="Describe key features, materials, care instructions, benefits..."
                    value={formData.description}
                    maxLength={500}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-zinc-100 p-5 sm:p-6 min-h-[140px] sm:min-h-[160px] font-medium text-zinc-900 focus:ring-2 focus:ring-brand/20 focus:border-brand/20 transition-all shadow-sm outline-none resize-none bg-white leading-relaxed text-sm focus:bg-white"
                    required
                  />
                  <div className="px-1 text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                    💡 Tip: Include key features, materials, and care info for better conversion
                  </div>
                </div>

                {/* Phone Specifications */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Phone Specifications
                      </label>
                      <p className="text-[9px] text-zinc-300 font-bold uppercase mt-0.5">
                        Technical Details for Product Page
                      </p>
                    </div>
                    {Object.values(phoneSpecs).some((v) => v.trim() !== "") && (
                      <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                        {Object.values(phoneSpecs).filter((v) => v.trim() !== "").length} Added
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PHONE_SPEC_KEYS.map((specKey) => (
                      <div key={specKey} className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                          {specKey}
                        </label>
                        <Input
                          placeholder={
                            specKey === "Processor" ? "e.g. Snapdragon 8 Gen 3" :
                            specKey === "RAM"       ? "e.g. 12GB" :
                            specKey === "Display"   ? "e.g. 6.7\" AMOLED 120Hz" :
                            specKey === "Battery"   ? "e.g. 5000mAh" :
                            specKey === "Camera"    ? "e.g. 50MP + 12MP + 10MP" :
                            specKey === "OS"        ? "e.g. Android 14" :
                                                     "e.g. 5G, WiFi 6E, Bluetooth 5.3"
                          }
                          value={phoneSpecs[specKey] || ""}
                          onChange={(e) => handleSpecChange(specKey, e.target.value)}
                          className="rounded-2xl border-zinc-100 h-11 sm:h-12 font-medium text-zinc-900 bg-white shadow-sm focus:ring-2 focus:ring-brand/20 text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="px-1 text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                    Specs will appear in the &quot;Technical Specs&quot; card on the product page
                  </div>
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

              <div className="space-y-12">
                {/* Section 1: Select Sizes */}
                <div className="space-y-5 pb-8 border-b border-zinc-100">
                  <div className="flex flex-col gap-1 px-1">
                    <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-[0.1em]">
                      Step 1: Select Sizes
                    </label>
                    <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide">
                      Choose available sizes for this product
                    </p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  {(isSmartAccessory
                    ? ["50ml", "100ml"]
                    : isAccessory
                    ? ["40mm", "42mm", "44mm"]
                      : ["XS", "S", "M", "L", "XL", "XXL", "3XL"]
                    ).map((sizeLabel) => {
                      const isSelected = formData.sizes.includes(sizeLabel);

                      return (
                        <div key={sizeLabel}>
                          {/* Default State - Just shows size option */}
                          {!isSelected && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((p) => ({
                                  ...p,
                                  sizes: Array.from(new Set([...p.sizes, sizeLabel])),
                                }));
                              }}
                              className="w-full p-5 rounded-xl border-2 border-zinc-200 bg-white hover:bg-zinc-50 hover:border-brand/40 transition-all duration-200 cursor-pointer group"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-zinc-100 group-hover:bg-brand/10 flex items-center justify-center transition-all">
                                  <div className="w-2 h-2 rounded-full bg-zinc-400 group-hover:bg-brand"></div>
                                </div>
                                <span className="text-lg font-bold text-zinc-700 group-hover:text-brand transition-colors">
                                  {sizeLabel}
                                </span>
                              </div>
                            </button>
                          )}

                          {/* Selected State - Shows input for stock */}
                          {isSelected && (
                            <div className="bg-gradient-to-br from-brand/5 to-brand/10 p-5 rounded-xl border-2 border-brand shadow-md">
                              <div className="flex flex-col gap-4">
                                {/* Header with size and remove button */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center">
                                      <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <span className="text-xl font-bold text-zinc-900">
                                      {sizeLabel}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData((p) => ({
                                        ...p,
                                        sizes: p.sizes.filter(
                                          (s: string) => s !== sizeLabel
                                        ),
                                      }));
                                      // Clean up size-color stock entries for this size
                                      setSizeColorStock((prev) => {
                                        const updated = { ...prev };
                                        Object.keys(updated).forEach((key) => {
                                          if (key.startsWith(sizeLabel + "-")) {
                                            delete updated[key];
                                          }
                                        });
                                        return updated;
                                      });
                                    }}
                                    className="text-zinc-400 hover:text-brand transition-colors"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    </div>
                  </div>

                {/* Section 2: Color Palette */}
                <div className="space-y-5 pt-8">
                  <div className="flex flex-col gap-1 px-1">
                    <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-[0.1em]">
                      Step 2: Select Colors
                    </label>
                    <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide">
                      Choose available colors
                    </p>
                  </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
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
                              
                              // Clean up size-color stock entries when color is removed
                              if (isSelected) {
                                setSizeColorStock((prev) => {
                                  const updated = { ...prev };
                                  Object.keys(updated).forEach((key) => {
                                    if (key.endsWith(`-${color}`)) {
                                      delete updated[key];
                                    }
                                  });
                                  return updated;
                                });
                              }
                            }}
                            className={cn(
                              "p-5 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3 h-full cursor-pointer group",
                              isSelected
                                ? "bg-brand/10 border-brand shadow-md hover:shadow-lg"
                                : "bg-white border-zinc-200 hover:border-brand/40 hover:bg-zinc-50"
                            )}
                          >
                            <div
                              className={cn(
                                "w-14 h-14 rounded-full shadow-sm transition-all border-2",
                                isSelected ? "border-brand ring-2 ring-brand/30 scale-110" : "border-zinc-200 group-hover:scale-105"
                              )}
                              style={{ 
                                borderColor: isSelected ? undefined : (color.toLowerCase() === "white" ? "#d1d5db" : "transparent"),
                                backgroundColor: color.toLowerCase() === "white" 
                                  ? "#ffffff" 
                                  : color.toLowerCase() 
                              }}
                            />
                            <div className="flex flex-col items-center gap-1 w-full">
                              <span className="text-sm font-bold text-center text-zinc-900">{color}</span>
                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 text-brand" />
                              )}
                            </div>
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
                          className="h-10 sm:h-12 rounded-lg sm:rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest pl-8 sm:pl-10"
                        />
                        <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2">
                          <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 text-zinc-300" />
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
                        className="h-10 sm:h-12 rounded-lg sm:rounded-2xl bg-zinc-900 text-white px-3 sm:px-6 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest shadow-lg active:scale-95 shrink-0"
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Size-Color Stock Matrix */}
                  {formData.sizes.length > 0 && formData.colors.length > 0 && (
                    <div className="space-y-4 pt-6 border-t border-zinc-100">
                      <div className="flex items-center justify-between px-1">
                        <div>
                          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.1em]">
                            Inventory Matrix
                          </label>
                          <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest mt-0.5">
                            Stock per Size & Color Combination
                          </p>
                        </div>
                        <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                          Granular Tracking
                        </span>
                      </div>

                      {/* Matrix Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-max border-collapse">
                          <thead>
                            <tr>
                              <th className="sticky left-0 bg-zinc-50 border border-zinc-200 px-4 py-3 text-left z-10">
                                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                                  Size
                                </span>
                              </th>
                              {formData.colors.map((color: string) => (
                                <th
                                  key={`header-${color}`}
                                  className="border border-zinc-200 px-4 py-3 text-center bg-zinc-50 min-w-[100px]"
                                >
                                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest block">
                                    {color}
                                  </span>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {formData.sizes.map((size: string) => (
                              <tr key={`row-${size}`}>
                                <td className="sticky left-0 bg-white border border-zinc-200 px-4 py-3 font-bold text-zinc-900 text-sm z-[5]">
                                  {size}
                                </td>
                                {formData.colors.map((color: string) => {
                                  const key = `${size}-${color}`;
                                  const quantity = sizeColorStock[key] || 0;

                                  return (
                                    <td
                                      key={`cell-${key}`}
                                      className="border border-zinc-200 px-4 py-3 text-center"
                                    >
                                      <Input
                                        type="number"
                                        min="0"
                                        value={quantity > 0 ? quantity : ""}
                                        placeholder="0"
                                        onFocus={(e) => {
                                          if (!e.target.value) {
                                            e.target.placeholder = "";
                                          }
                                        }}
                                        onBlur={(e) => {
                                          e.target.placeholder = "0";
                                        }}
                                        onChange={(e) => {
                                          const val = e.target.value.trim();
                                          const newQuantity = val ? parseInt(val) || 0 : 0;

                                          setSizeColorStock((prev) => {
                                            const updated = { ...prev };
                                            if (newQuantity > 0) {
                                              updated[key] = newQuantity;
                                            } else {
                                              delete updated[key];
                                            }
                                            return updated;
                                          });
                                        }}
                                        className="w-full h-10 text-center rounded-lg border-emerald-200 bg-emerald-50 font-bold text-emerald-700 text-sm focus:ring-2 focus:ring-emerald-300"
                                      />
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  )}
              </div>
            </section>
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

              <div className="space-y-6">
                {/* Prices Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Selling Price */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                      Selling Price (₹)
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="999"
                        value={formData.price || ""}
                        onChange={(e) => {
                          const newPrice = parseFloat(e.target.value) || 0;
                          const originalPrice = parseFloat(formData.originalPrice) || 0;
                          
                          setFormData((prev) => {
                            const updatedData = { ...prev, price: e.target.value };
                            
                            // Auto-calculate discount if both prices are valid
                            if (newPrice > 0 && originalPrice > 0 && newPrice < originalPrice) {
                              const discount = Math.round(((originalPrice - newPrice) / originalPrice) * 100);
                              updatedData.discount = discount.toString();
                            }
                            
                            return updatedData;
                          });
                        }}
                        className="rounded-2xl border-zinc-100 h-13 sm:h-14 font-bold text-lg sm:text-xl text-zinc-900 pl-10 shadow-sm focus:ring-2 focus:ring-brand/20"
                        required
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">
                        ₹
                      </span>
                    </div>
                  </div>

                  {/* Original Price */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                      Original Price (₹)
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="1299"
                        value={formData.originalPrice || ""}
                        onChange={(e) => {
                          const newOriginalPrice = parseFloat(e.target.value) || 0;
                          const price = parseFloat(formData.price) || 0;
                          
                          setFormData((prev) => {
                            const updatedData = { ...prev, originalPrice: e.target.value };
                            
                            // Auto-calculate discount if both prices are valid
                            if (price > 0 && newOriginalPrice > 0 && price < newOriginalPrice) {
                              const discount = Math.round(((newOriginalPrice - price) / newOriginalPrice) * 100);
                              updatedData.discount = discount.toString();
                            }
                            
                            return updatedData;
                          });
                        }}
                        className="rounded-2xl border-zinc-100 h-13 sm:h-14 font-medium text-zinc-600 pl-10 bg-zinc-50/50 shadow-sm focus:ring-2 focus:ring-brand/20"
                        required
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 font-bold text-sm">
                        ₹
                      </span>
                    </div>
                  </div>
                </div>

                {/* Discount & Savings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Discount */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                      Discount (%)
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="20"
                        value={formData.discount || ""}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, discount: e.target.value }))
                        }
                        className="rounded-2xl border-brand/20 h-13 sm:h-14 font-bold text-lg text-brand bg-brand/5 shadow-sm focus:ring-2 focus:ring-brand/30 text-center"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand font-bold text-sm">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Savings */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest px-1">
                      Customer Saves (₹)
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        disabled
                        value={
                          formData.price && formData.originalPrice
                            ? `₹${Math.max(0, Math.round(parseFloat(formData.originalPrice) - parseFloat(formData.price))).toLocaleString()}`
                            : "₹0"
                        }
                        className="rounded-2xl border-emerald-200 h-13 sm:h-14 font-bold text-lg text-emerald-700 bg-emerald-50 shadow-sm cursor-not-allowed"
                      />
                    </div>
                  </div>
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