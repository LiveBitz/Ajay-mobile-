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
  AlertCircle,
  X,
  Plus,
  Pipette,
} from "lucide-react";
import { useRef } from "react";
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
import { PRESET_COLORS, getColorHex, isLightColor } from "@/lib/colors";
import { Checkbox } from "@/components/ui/checkbox";
import { createProduct, updateProduct } from "@/app/admin/actions/product";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface SpecRow {
  key: string;
  value: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────


// Variant presets per product type
const VARIANT_PRESETS: Record<string, string[]> = {
  smartphone: ["64GB", "128GB", "256GB", "512GB", "1TB"],
  laptop: ["8GB/256GB", "8GB/512GB", "16GB/512GB", "16GB/1TB", "32GB/1TB"],
  tablet: ["64GB", "128GB", "256GB", "512GB"],
  smartwatch: ["38mm", "40mm", "41mm", "44mm", "45mm", "49mm"],
  tv: ['32"', '43"', '50"', '55"', '65"', '75"', '85"'],
  ac: ["0.8 Ton", "1 Ton", "1.5 Ton", "2 Ton", "3 Ton"],
  refrigerator: ["180L", "236L", "260L", "320L", "400L", "500L"],
  washing_machine: ["6 kg", "7 kg", "8 kg", "9 kg", "10 kg", "12 kg"],
  speaker: ["Mini", "Compact", "Standard", "Large"],
  earphones: ["Standard"],
  headphones: ["Standard"],
  camera: ["Body Only", "Kit (18-55mm)", "Kit (18-135mm)"],
  power_bank: ["5000mAh", "10000mAh", "20000mAh", "30000mAh"],
  default: ["Standard"],
};

// Spec templates per product type
const SPEC_TEMPLATES: Record<string, string[]> = {
  smartphone: [
    "Brand", "Model", "Processor", "RAM", "Storage",
    "Display", "Battery", "Rear Camera", "Front Camera",
    "OS", "Connectivity", "SIM Type",
  ],
  laptop: [
    "Brand", "Model", "Processor", "RAM", "Storage",
    "Display", "Graphics Card", "Battery Life", "OS", "Ports", "Weight",
  ],
  tablet: [
    "Brand", "Model", "Processor", "RAM", "Storage",
    "Display", "Battery", "Camera", "OS", "Connectivity",
  ],
  smartwatch: [
    "Brand", "Model", "Display Type", "Battery Life",
    "Health Sensors", "Connectivity", "Water Resistance",
    "Compatible OS", "Strap Material",
  ],
  tv: [
    "Brand", "Model", "Screen Size", "Resolution", "Display Technology",
    "Refresh Rate", "Smart TV OS", "HDMI Ports", "USB Ports", "Connectivity",
  ],
  ac: [
    "Brand", "Model", "Type", "Capacity", "Star Rating",
    "Cooling Technology", "Compressor Type", "Refrigerant", "Noise Level", "Warranty",
  ],
  refrigerator: [
    "Brand", "Model", "Type", "Capacity", "Star Rating",
    "Cooling Technology", "Inverter", "Defrost Type", "Warranty",
  ],
  washing_machine: [
    "Brand", "Model", "Type", "Capacity", "Star Rating",
    "Wash Programs", "Spin Speed", "Inverter Motor", "Warranty",
  ],
  headphones: [
    "Brand", "Model", "Type", "Driver Size", "Frequency Response",
    "Impedance", "Connectivity", "Battery Life", "Noise Cancellation", "Microphone",
  ],
  earphones: [
    "Brand", "Model", "Type", "Driver Size", "Frequency Response",
    "Connectivity", "Battery Life", "Water Resistance", "Microphone",
  ],
  speaker: [
    "Brand", "Model", "Output Power", "Driver Configuration",
    "Connectivity", "Battery Life", "Water Resistance", "Frequency Response",
  ],
  camera: [
    "Brand", "Model", "Sensor Type", "Megapixels", "Lens Mount",
    "Video Resolution", "ISO Range", "Autofocus", "Battery Life", "Weight",
  ],
  power_bank: [
    "Brand", "Model", "Capacity", "Input", "Output",
    "Fast Charging", "Number of Ports", "Weight",
  ],
  default: [
    "Brand", "Model", "Key Feature 1", "Key Feature 2",
    "Key Feature 3", "Connectivity", "Power", "Warranty",
  ],
};

// ─── Detect product type from category + sub-category ─────────────────────────

const detectProductType = (categoryName: string, subCategory: string): string => {
  const text = `${categoryName} ${subCategory}`.toLowerCase();
  if (text.includes("smartphone") || text.includes("mobile") || text.includes("phone")) return "smartphone";
  if (text.includes("laptop") || text.includes("notebook")) return "laptop";
  if (text.includes("tablet") || text.includes("ipad")) return "tablet";
  if (text.includes("watch") || text.includes("wearable")) return "smartwatch";
  if (text.includes(" tv") || text.includes("television") || text.includes("monitor")) return "tv";
  if (text.includes(" ac") || text.includes("air condition")) return "ac";
  if (text.includes("refrigerator") || text.includes("fridge")) return "refrigerator";
  if (text.includes("washing") || text.includes("washer")) return "washing_machine";
  if (text.includes("headphone") || text.includes("over-ear")) return "headphones";
  if (text.includes("earphone") || text.includes("earbud") || text.includes("tws")) return "earphones";
  if (text.includes("speaker") || text.includes("soundbar")) return "speaker";
  if (text.includes("camera") || text.includes("dslr") || text.includes("mirrorless")) return "camera";
  if (text.includes("power bank") || text.includes("powerbank")) return "power_bank";
  return "default";
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const slugify = (str: string) =>
  str.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

const parseSizeColorStock = (sizes: string[] = []): Record<string, number> => {
  const stock: Record<string, number> = {};
  sizes.forEach((entry) => {
    // format: "128GB-Midnight Black:25"
    const lastColon = entry.lastIndexOf(":");
    if (lastColon === -1) return;
    const key = entry.slice(0, lastColon);
    const qty = parseInt(entry.slice(lastColon + 1)) || 0;
    if (key.includes("-")) stock[key] = qty;
  });
  return stock;
};

const extractBaseSizes = (sizes: string[] = []): string[] => {
  const s = new Set<string>();
  sizes.forEach((entry) => {
    const lastColon = entry.lastIndexOf(":");
    const key = lastColon !== -1 ? entry.slice(0, lastColon) : entry;
    if (key.includes("-")) {
      // "128GB-Midnight Black" → "128GB"
      s.add(key.slice(0, key.indexOf("-")));
    } else {
      s.add(key);
    }
  });
  return Array.from(s);
};

const extractColors = (sizes: string[] = []): string[] => {
  const c = new Set<string>();
  sizes.forEach((entry) => {
    const lastColon = entry.lastIndexOf(":");
    if (lastColon === -1) return;
    const key = entry.slice(0, lastColon);
    const dashIdx = key.indexOf("-");
    if (dashIdx !== -1) c.add(key.slice(dashIdx + 1));
  });
  return Array.from(c);
};

// Parse "Brand: Samsung" style features into SpecRow[]
const parseSpecsFromFeatures = (features: string[]): SpecRow[] =>
  features
    .filter((f) => f.includes(":"))
    .map((f) => {
      const colonIdx = f.indexOf(":");
      return {
        key: f.slice(0, colonIdx).trim(),
        value: f.slice(colonIdx + 1).trim(),
      };
    });


// ─── Component ────────────────────────────────────────────────────────────────

export function ProductForm({
  categories,
  initialData,
  preSelectedCategoryId,
  existingSubCategories = {},
}: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!initialData;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [showPreview, setShowPreview] = useState(false);

  // ── Form state ──
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
    colors:
      extractColors(initialData?.sizes || []).length > 0
        ? extractColors(initialData?.sizes || [])
        : Array.isArray(initialData?.colors)
        ? initialData.colors
        : [],
    description: initialData?.description || "",
    features: Array.isArray(initialData?.features) ? initialData.features : [],
  });

  // ── Specs: free-form key-value rows ──
  const [specs, setSpecs] = useState<SpecRow[]>(() =>
    parseSpecsFromFeatures(
      Array.isArray(initialData?.features) ? initialData.features : []
    )
  );

  // ── Inventory matrix ──
  const [sizeColorStock, setSizeColorStock] = useState<Record<string, number>>(
    parseSizeColorStock(initialData?.sizes || [])
  );

  // ── Custom color/variant inputs ──
  const [customColorInput, setCustomColorInput] = useState("");
  const [customVariantInput, setCustomVariantInput] = useState("");
  const colorInputRef = useRef<HTMLInputElement>(null);

  const [stagedColor, setStagedColor] = useState<string | null>(null);

  const handleVisualColorSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStagedColor(e.target.value.toUpperCase());
  };

  const confirmStagedColor = () => {
    if (stagedColor && !formData.colors.includes(stagedColor)) {
      setFormData((p) => ({ ...p, colors: [...p.colors, stagedColor] }));
      toast({
        title: "Color Confirmed",
        description: `Visual selection ${stagedColor} added.`,
      });
      setStagedColor(null);
    }
  };

  // ── Derived ──
  const selectedCategory = categories.find((c) => c.id === formData.categoryId);
  const productType = detectProductType(
    selectedCategory?.name || "",
    formData.subCategory
  );
  const specTemplate = SPEC_TEMPLATES[productType] ?? SPEC_TEMPLATES.default;
  const variantOptions = VARIANT_PRESETS[productType] ?? VARIANT_PRESETS.default;

  // ── Sync specs → features ──
  useEffect(() => {
    const specFeatures = specs
      .filter((s) => s.key.trim() && s.value.trim())
      .map((s) => `${s.key}: ${s.value}`);
    setFormData((p) => ({ ...p, features: specFeatures }));
  }, [specs]);

  // ── When product type changes (first time, not on edit), apply template ──
  const [lastAppliedType, setLastAppliedType] = useState<string | null>(null);
  useEffect(() => {
    if (!isEdit && productType !== "default" && productType !== lastAppliedType && specs.length === 0) {
      setSpecs(specTemplate.map((k) => ({ key: k, value: "" })));
      setLastAppliedType(productType);
    }
  }, [productType]); // eslint-disable-line

  // ── Auto-calc discount ──
  const recalcDiscount = (price: string, originalPrice: string) => {
    const p = parseFloat(price);
    const op = parseFloat(originalPrice);
    if (p > 0 && op > 0 && p < op) {
      return Math.round(((op - p) / op) * 100).toString();
    }
    return "0";
  };

  // ── Slug ──
  const handleSlugify = (name: string) => {
    setFormData((p) => ({ ...p, name, slug: slugify(name) }));
  };

  // ── Upload ──
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    slot: "main" | number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const id = slot === "main" ? "main" : `gallery-${slot}`;

    try {
      setIsUploading((p) => ({ ...p, [id]: true }));
      setUploadProgress((p) => ({ ...p, [id]: 10 }));

      const ext = file.name.split(".").pop();
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      setUploadProgress((p) => ({ ...p, [id]: 30 }));

      const { error } = await supabase.storage
        .from("product")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;

      setUploadProgress((p) => ({ ...p, [id]: 80 }));

      const { data: { publicUrl } } = supabase.storage
        .from("product")
        .getPublicUrl(path);

      if (slot === "main") {
        setFormData((p) => ({ ...p, image: publicUrl }));
      } else {
        setFormData((p) => {
          const imgs = [...p.images];
          imgs[slot as number] = publicUrl;
          return { ...p, images: imgs };
        });
      }

      setUploadProgress((p) => ({ ...p, [id]: 100 }));
      toast({
        title: "Image uploaded",
        description: `Successfully uploaded to ${slot === "main" ? "primary" : "gallery"} slot.`,
      });
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message || "Check storage bucket permissions.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsUploading((p) => ({ ...p, [id]: false }));
        setUploadProgress((p) => ({ ...p, [id]: 0 }));
      }, 500);
    }
  };

  const handleRemoveImage = (slot: "main" | number) => {
    if (slot === "main") {
      setFormData((p) => ({ ...p, image: "" }));
    } else {
      setFormData((p) => {
        const imgs = [...p.images];
        imgs.splice(slot as number, 1);
        return { ...p, images: imgs };
      });
    }
  };

  // ── Spec helpers ──
  const applySpecTemplate = () => {
    setSpecs(specTemplate.map((k) => ({ key: k, value: "" })));
  };

  const addSpecRow = () => setSpecs((p) => [...p, { key: "", value: "" }]);

  const updateSpec = (idx: number, field: "key" | "value", val: string) =>
    setSpecs((p) => p.map((s, i) => (i === idx ? { ...s, [field]: val } : s)));

  const removeSpec = (idx: number) =>
    setSpecs((p) => p.filter((_, i) => i !== idx));

  // ── Size helpers ──
  const toggleSize = (size: string) => {
    const isSelected = formData.sizes.includes(size);
    if (isSelected) {
      setFormData((p) => ({ ...p, sizes: p.sizes.filter((s: string) => s !== size) }));
      setSizeColorStock((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((k) => {
          if (k.startsWith(`${size}-`)) delete updated[k];
        });
        return updated;
      });
    } else {
      setFormData((p) => ({ ...p, sizes: [...p.sizes, size] }));
    }
  };

  const addCustomVariant = () => {
    const val = customVariantInput.trim();
    if (val && !formData.sizes.includes(val)) {
      setFormData((p) => ({ ...p, sizes: [...p.sizes, val] }));
      setCustomVariantInput("");
    }
  };

  // ── Color helpers ──
  const toggleColor = (colorName: string) => {
    const isSelected = formData.colors.includes(colorName);
    if (isSelected) {
      setFormData((p) => ({
        ...p,
        colors: p.colors.filter((c: string) => c !== colorName),
      }));
      setSizeColorStock((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((k) => {
          if (k.endsWith(`-${colorName}`)) delete updated[k];
        });
        return updated;
      });
    } else {
      setFormData((p) => ({ ...p, colors: [...p.colors, colorName] }));
    }
  };

  const addCustomColor = () => {
    const val = customColorInput.trim();
    if (val && !formData.colors.includes(val)) {
      setFormData((p) => ({ ...p, colors: [...p.colors, val] }));
      setCustomColorInput("");
    }
  };

  // ── Validation ──
  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!formData.name.trim()) errors.push("Product name is required");
    if (!formData.slug.trim()) errors.push("Slug is required");
    if (!formData.categoryId) errors.push("Please select a category");
    if (!formData.price || isNaN(+formData.price) || +formData.price < 0)
      errors.push("Valid selling price is required");
    if (!formData.originalPrice || isNaN(+formData.originalPrice) || +formData.originalPrice < 0)
      errors.push("Valid original / MRP price is required");
    if (+formData.price > +formData.originalPrice)
      errors.push("Selling price must be ≤ original price");
    if (!formData.image) errors.push("Main product image is required");
    if (formData.sizes.length === 0) errors.push("Select at least one variant");
    if (formData.colors.length === 0) errors.push("Select at least one color");
    const hasStock = Object.values(sizeColorStock).some((q) => q > 0);
    if (!hasStock) errors.push("Add stock for at least one variant × color combination");
    return errors;
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((err) =>
        toast({ title: "Validation Error", description: err, variant: "destructive", duration: 3000 })
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // "128GB-Midnight Black:25"
      const storageSizes = Object.entries(sizeColorStock)
        .filter(([, qty]) => qty > 0)
        .map(([key, qty]) => `${key}:${qty}`);

      const payload = {
        ...formData,
        sizes: storageSizes,
        images: formData.images.filter(Boolean),
      };

      const result = isEdit
        ? await updateProduct(initialData.id, payload)
        : await createProduct(payload);

      if (result.success) {
        toast({
          title: isEdit ? "Product updated" : "Product created",
          description: `"${formData.name}" has been saved successfully.`,
        });
        router.push("/admin/products");
        router.refresh();
      } else {
        toast({ title: "Save failed", description: result.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Unexpected error. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Preview Card (same original UI) ──
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
                Upload an image to
                <br />
                see the simulation
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
              {selectedCategory?.name || "Unassigned"}{" "}
              {formData.subCategory ? `· ${formData.subCategory}` : "Collection"}
            </p>
            <h2 className="text-lg font-bold text-zinc-900 truncate tracking-tight">
              {formData.name || "Signature Item Name"}
            </h2>
          </div>

          {/* Color swatches */}
          {formData.colors.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1">
              {formData.colors.slice(0, 6).map((c: string) => (
                <div
                  key={c}
                  title={c}
                  className={cn(
                    "w-4 h-4 rounded-full border shadow-sm",
                    isLightColor(c) ? "border-zinc-300" : "border-transparent"
                  )}
                  style={{ backgroundColor: getColorHex(c) }}
                />
              ))}
              {formData.colors.length > 6 && (
                <span className="text-[9px] text-zinc-400 font-bold">
                  +{formData.colors.length - 6}
                </span>
              )}
            </div>
          )}

          <div className="flex items-end justify-between pt-1">
            <div className="flex flex-col">
              <p className="text-xl font-bold text-zinc-900 font-heading">
                ₹{formData.price ? Number(formData.price).toLocaleString("en-IN") : "—"}
              </p>
              {parseInt(formData.discount) > 0 && (
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] text-zinc-400 line-through">
                    ₹{Number(formData.originalPrice).toLocaleString("en-IN")}
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

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-2">
        {[
          {
            label: "Variants",
            value: formData.sizes.length || "—",
          },
          {
            label: "Colors",
            value: formData.colors.length || "—",
          },
          {
            label: "Total Stock",
            value: Object.values(sizeColorStock).reduce((a, b) => a + b, 0) || "—",
          },
          {
            label: "Specs",
            value: specs.filter((s) => s.value.trim()).length || "—",
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-zinc-50 rounded-2xl p-3 border border-zinc-100 text-center"
          >
            <p className="text-base font-bold text-zinc-900">{value}</p>
            <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">{label}</p>
          </div>
        ))}
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

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Mobile Preview Drawer */}
      {showPreview && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPreview(false)}
          />
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
                {isEdit ? "Edit Product" : "New Product"}
              </h1>
              <p className="text-[9px] text-brand font-bold uppercase tracking-[0.15em] hidden sm:block">
                {isEdit
                  ? `ID: ${initialData.id.slice(0, 8).toUpperCase()}`
                  : "Digital Inventory Draft"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
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
              className="h-9 sm:h-11 px-4 sm:px-8 rounded-xl sm:rounded-2xl bg-brand hover:bg-brand/90 text-white font-bold shadow-xl shadow-brand/20 transition-all active:scale-95 flex items-center gap-2 text-xs sm:text-sm"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isSubmitting ? "Saving…" : isEdit ? "Update" : "Publish"}
              </span>
              <span className="sm:hidden">
                {isSubmitting ? "…" : isEdit ? "Update" : "Save"}
              </span>
            </Button>
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 items-start">
          {/* ── Left: Form Sections ── */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">

            {/* ── 1. Media ── */}
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
                {/* Primary */}
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
                      {isUploading["main"] ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 text-brand animate-spin" />
                          <p className="text-[10px] font-extrabold text-brand uppercase tracking-widest">
                            {uploadProgress["main"]}%
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
                            onClick={() => handleRemoveImage("main")}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-xl flex items-center justify-center text-zinc-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-zinc-200">
                          <ImageIcon className="w-12 h-12" />
                          <p className="text-[9px] font-bold uppercase tracking-widest">
                            Awaiting Identity
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-4">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "main")}
                          disabled={!!isUploading["main"]}
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

                {/* Gallery */}
                <div className="space-y-4 pt-4 border-t border-zinc-50">
                  <div className="px-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Supplemental Assets (Gallery Slots)
                    </label>
                    <p className="text-[9px] text-zinc-300 font-bold uppercase mt-0.5">
                      Additional perspectives for the detailed showcase
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[0, 1, 2, 3].map((idx) => {
                      const id = `gallery-${idx}`;
                      const imageUrl = formData.images[idx];
                      const uploading = isUploading[id];
                      const progress = uploadProgress[id];

                      return (
                        <div key={idx} className="aspect-[4/5] rounded-[24px] bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 shadow-inner group overflow-hidden relative transition-all active:scale-95">
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
                                <p className="text-[8px] font-extrabold uppercase tracking-[0.2em]">
                                  Slot {idx + 1}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* ── 2. Product Information ── */}
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
                {/* Name */}
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
                    <span
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
                        formData.name.length > 100
                          ? "bg-red-50 text-red-600"
                          : formData.name.length > 80
                          ? "bg-yellow-50 text-yellow-600"
                          : "bg-emerald-50 text-emerald-600"
                      )}
                    >
                      {formData.name.length}/120
                    </span>
                  </div>
                  <Input
                    placeholder="e.g. Samsung Galaxy S24 Ultra 12GB/256GB"
                    value={formData.name}
                    maxLength={120}
                    onChange={(e) => handleSlugify(e.target.value)}
                    className="rounded-2xl border-zinc-100 h-13 sm:h-14 font-bold text-lg sm:text-xl text-zinc-900 focus:ring-2 focus:ring-brand/20 shadow-sm"
                    required
                  />
                  <div className="px-1 flex items-center gap-2">
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        formData.slug ? "bg-emerald-500" : "bg-zinc-300"
                      )}
                    />
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest truncate">
                      URL Slug:{" "}
                      <span className="font-mono text-zinc-600">
                        {formData.slug || "auto-generated"}
                      </span>
                      <span className="ml-2 text-brand/60 italic lowercase">
                        (Autofixed if duplicate)
                      </span>
                    </p>
                  </div>
                </div>

                {/* Category + Sub-Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Category */}
                  <div className="space-y-3">
                    <div className="px-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Collection Category
                      </label>
                      <p className="text-[9px] text-zinc-300 font-bold uppercase mt-0.5">
                        Primary Product Grouping
                      </p>
                    </div>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(v) =>
                        setFormData((p) => ({ ...p, categoryId: v }))
                      }
                    >
                      <SelectTrigger className="w-full h-13 sm:h-14 rounded-2xl border-zinc-100 bg-white px-5 font-bold text-zinc-900 shadow-sm focus:ring-2 focus:ring-brand/20">
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
                          ✓ {selectedCategory?.name} selected
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
                      {(existingSubCategories[formData.categoryId]?.length ?? 0) > 0 && (
                        <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50/50 px-2 py-1 rounded-full border border-emerald-200/50">
                          Suggestions
                        </span>
                      )}
                    </div>
                    <Input
                      placeholder="e.g. Smartphone, Laptop, Split AC, LED TV..."
                      value={formData.subCategory}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, subCategory: e.target.value }))
                      }
                      className="rounded-2xl border-zinc-100 h-13 sm:h-14 font-bold text-zinc-900 bg-white shadow-sm focus:ring-2 focus:ring-brand/20"
                    />
                    {/* Suggestion pills */}
                    {(existingSubCategories[formData.categoryId] ?? []).length > 0 && (
                      <div className="pt-1 px-1 space-y-2">
                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                          Known Sub-Categories:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {existingSubCategories[formData.categoryId].map((sub) => {
                            const isSelected = formData.subCategory === sub;
                            return (
                              <button
                                key={sub}
                                type="button"
                                onClick={() =>
                                  setFormData((p) => ({ ...p, subCategory: sub }))
                                }
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
                    )}
                  </div>
                </div>

                {/* Description */}
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
                    <span
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
                        formData.description.length > 500
                          ? "bg-red-50 text-red-600"
                          : formData.description.length > 400
                          ? "bg-yellow-50 text-yellow-600"
                          : "bg-emerald-50 text-emerald-600"
                      )}
                    >
                      {formData.description.length}/600
                    </span>
                  </div>
                  <textarea
                    placeholder="Describe key features, compatibility, what's in the box, warranty..."
                    value={formData.description}
                    maxLength={600}
                    rows={5}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, description: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-zinc-100 p-5 sm:p-6 font-medium text-zinc-900 focus:ring-2 focus:ring-brand/20 focus:border-brand/20 transition-all shadow-sm outline-none resize-none bg-white leading-relaxed text-sm"
                  />
                </div>
              </div>
            </section>

            {/* ── 3. Technical Specifications ── */}
            <section className="bg-white p-5 sm:p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 border-b border-zinc-50 pb-5">
                <div className="w-9 h-9 rounded-xl bg-zinc-50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-brand" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                    Technical Specifications
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                    Custom Key-Value Pairs · Works for Any Product
                  </p>
                </div>
                {/* Template banner inline */}
                <div className="hidden sm:flex items-center gap-3 bg-zinc-50 rounded-2xl px-4 py-2.5 border border-zinc-100">
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                      Detected
                    </p>
                    <p className="text-[10px] font-extrabold text-brand capitalize">
                      {productType.replace("_", " ")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={applySpecTemplate}
                    className="h-8 px-3 rounded-xl bg-brand/10 hover:bg-brand/20 text-brand text-[10px] font-extrabold border-0 shadow-none uppercase tracking-wider"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Mobile template banner */}
              <div className="sm:hidden flex items-center justify-between bg-zinc-50 rounded-2xl px-4 py-3 border border-zinc-100">
                <div>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                    Detected Product Type
                  </p>
                  <p className="text-xs font-extrabold text-brand capitalize mt-0.5">
                    {productType.replace("_", " ")}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={applySpecTemplate}
                  className="h-9 px-4 rounded-xl bg-brand/10 hover:bg-brand/20 text-brand text-[10px] font-extrabold border-0 shadow-none uppercase tracking-wider"
                >
                  Apply Template
                </Button>
              </div>

              <div className="space-y-3">
                {/* Header row */}
                {specs.length > 0 && (
                  <div className="grid grid-cols-[1fr_1.5fr_36px] gap-2 px-1">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                      Parameter
                    </p>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                      Value
                    </p>
                  </div>
                )}

                {/* Spec rows */}
                {specs.map((spec, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[1fr_1.5fr_36px] gap-2 items-center"
                  >
                    <Input
                      placeholder="e.g. RAM"
                      value={spec.key}
                      onChange={(e) => updateSpec(idx, "key", e.target.value)}
                      className="h-11 rounded-2xl border-zinc-100 text-xs font-bold text-zinc-600 bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-brand/20 shadow-sm"
                    />
                    <Input
                      placeholder="e.g. 12GB LPDDR5X"
                      value={spec.value}
                      onChange={(e) => updateSpec(idx, "value", e.target.value)}
                      className="h-11 rounded-2xl border-zinc-100 text-xs font-medium text-zinc-900 focus:ring-2 focus:ring-brand/20 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpec(idx)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-300 hover:text-red-400 hover:bg-red-50 transition-all active:scale-90"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Add row button */}
                <button
                  type="button"
                  onClick={addSpecRow}
                  className="w-full h-11 rounded-2xl border-2 border-dashed border-zinc-100 hover:border-brand/30 text-zinc-400 hover:text-brand text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.99] bg-zinc-50/30 hover:bg-brand/[0.02]"
                >
                  <Plus className="w-4 h-4" />
                  Add Specification Row
                </button>

                {specs.filter((s) => s.value.trim()).length > 0 && (
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest text-center pt-1">
                    {specs.filter((s) => s.value.trim()).length} specifications will appear on the product page
                  </p>
                )}
              </div>
            </section>

            {/* ── 4. Variants & Inventory ── */}
            <section className="bg-white p-5 sm:p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 border-b border-zinc-50 pb-5">
                <div className="w-9 h-9 rounded-xl bg-zinc-50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                    Structural Configuration
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                    Variants, Colors & Inventory Matrix
                  </p>
                </div>
              </div>

              <div className="space-y-12">

                {/* ── Step 1: Variants ── */}
                <div className="space-y-5 pb-8 border-b border-zinc-100">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-[0.1em]">
                        Step 1 — Select Variants
                      </label>
                      <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide mt-0.5 capitalize">
                        {productType.replace("_", " ")} options pre-loaded
                      </p>
                    </div>
                    {formData.sizes.length > 0 && (
                      <span className="text-[9px] font-bold text-brand bg-brand/10 px-2.5 py-1 rounded-full">
                        {formData.sizes.length} selected
                      </span>
                    )}
                  </div>

                  {/* Preset pills */}
                  <div className="flex flex-wrap gap-2.5">
                    {variantOptions.map((v) => {
                      const selected = formData.sizes.includes(v);
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => toggleSize(v)}
                          className={cn(
                            "px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all duration-200 active:scale-95 flex items-center gap-2",
                            selected
                              ? "bg-brand text-white border-brand shadow-md shadow-brand/20"
                              : "bg-white text-zinc-600 border-zinc-200 hover:border-brand/40 hover:text-brand"
                          )}
                        >
                          {selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {v}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom variant */}
                  <div className="flex gap-2 pt-1">
                    <Input
                      placeholder="Custom variant (e.g. 3TB, 96GB RAM, 2.5 Ton)…"
                      value={customVariantInput}
                      onChange={(e) => setCustomVariantInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomVariant();
                        }
                      }}
                      className="h-11 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white text-sm font-medium focus:ring-2 focus:ring-brand/20"
                    />
                    <Button
                      type="button"
                      onClick={addCustomVariant}
                      className="h-11 px-5 rounded-2xl bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg active:scale-95 shrink-0"
                    >
                      Add
                    </Button>
                  </div>

                  {/* Selected variants display */}
                  {formData.sizes.filter((s: string) => !variantOptions.includes(s)).length > 0 && (
                    <div className="space-y-2 px-1">
                      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                        Custom Variants:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.sizes
                          .filter((s: string) => !variantOptions.includes(s))
                          .map((v: string) => (
                            <span
                              key={v}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand/10 text-brand text-xs font-bold border border-brand/20"
                            >
                              {v}
                              <button
                                type="button"
                                onClick={() => toggleSize(v)}
                                className="hover:text-red-500 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Step 2: Colors ── */}
                <div className="space-y-5 pb-8 border-b border-zinc-100">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-[0.1em]">
                        Step 2 — Select Colors
                      </label>
                      <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide mt-0.5">
                        Choose all available color options
                      </p>
                    </div>
                    {formData.colors.length > 0 && (
                      <span className="text-[9px] font-bold text-brand bg-brand/10 px-2.5 py-1 rounded-full">
                        {formData.colors.length} selected
                      </span>
                    )}
                  </div>

                  {/* Color grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                    {[
                      ...PRESET_COLORS,
                      // Also show any custom colors that were added
                      ...formData.colors
                        .filter((c: string) => !PRESET_COLORS.find((p) => p.name === c))
                        .map((c: string) => ({ name: c, hex: c.toLowerCase() })),
                    ].map(({ name, hex }) => {
                      const selected = formData.colors.includes(name);
                      const light = isLightColor(name);
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => toggleColor(name)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 active:scale-95 group",
                            selected
                              ? "border-brand bg-brand/5 shadow-md"
                              : "border-zinc-100 bg-white hover:border-zinc-200 hover:shadow-sm"
                          )}
                        >
                          <div
                            className={cn(
                              "w-9 h-9 rounded-full shadow-sm transition-transform duration-200 group-hover:scale-110 border-2",
                              selected
                                ? "scale-110 ring-2 ring-brand/30 ring-offset-2"
                                : "",
                              light ? "border-zinc-200" : "border-transparent"
                            )}
                            style={{ backgroundColor: hex }}
                          />
                          <span
                            className={cn(
                              "text-[8px] font-bold text-center leading-tight uppercase tracking-wide",
                              selected ? "text-brand" : "text-zinc-500"
                            )}
                          >
                            {name}
                          </span>
                          {selected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand -mt-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom color */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="color"
                      ref={colorInputRef}
                      onChange={handleVisualColorSelect}
                      className="sr-only"
                    />
                    <div className="relative flex-1">
                      <Input
                        placeholder="Custom color (e.g. Sage Green, Coral Red)…"
                        value={customColorInput}
                        onChange={(e) => setCustomColorInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCustomColor();
                          }
                        }}
                        className="h-11 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white text-sm font-medium pl-10 focus:ring-2 focus:ring-brand/20"
                      />
                      <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => colorInputRef.current?.click()}
                      className={cn(
                        "h-11 w-11 p-0 rounded-2xl border-zinc-100 bg-white hover:bg-brand/5 hover:text-brand hover:border-brand/20 shadow-sm active:scale-95 transition-all flex items-center justify-center shrink-0",
                        stagedColor && "border-brand/40 bg-brand/[0.02]"
                      )}
                      title="Select Color with Cursor"
                    >
                      <Pipette className="w-4 h-4" />
                    </Button>

                    {/* Staged Preview + Confirm */}
                    {stagedColor && (
                      <div className="flex items-center gap-1.5 animate-in zoom-in-95 duration-200">
                        <div
                          className="w-11 h-11 rounded-2xl border-2 border-white shadow-xl shadow-black/10 shrink-0"
                          style={{ backgroundColor: stagedColor }}
                        />
                        <Button
                          type="button"
                          onClick={confirmStagedColor}
                          className="h-11 w-11 p-0 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center shrink-0"
                          title="Confirm Selection"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setStagedColor(null)}
                          className="h-11 w-11 p-0 rounded-2xl text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    <Button
                      type="button"
                      onClick={addCustomColor}
                      className="h-11 px-6 rounded-2xl bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg active:scale-95 shrink-0 ml-auto"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* ── Step 3: Stock Matrix ── */}
                {formData.sizes.length > 0 && formData.colors.length > 0 && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between px-1">
                      <div>
                        <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-[0.1em]">
                          Step 3 — Inventory Matrix
                        </label>
                        <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide mt-0.5">
                          Stock per Variant × Color · Enter 0 to mark unavailable
                        </p>
                      </div>
                      <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                        Total:{" "}
                        {Object.values(sizeColorStock).reduce((a, b) => a + b, 0)} units
                      </span>
                    </div>

                    {/* Matrix */}
                    <div className="overflow-x-auto rounded-2xl border border-zinc-100">
                      <table className="w-full min-w-max border-collapse">
                        <thead>
                          <tr className="bg-zinc-50">
                            <th className="sticky left-0 z-10 bg-zinc-50 border-b border-r border-zinc-100 px-4 py-3 text-left min-w-[110px]">
                              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                Variant
                              </span>
                            </th>
                            {formData.colors.map((color: string) => (
                              <th
                                key={color}
                                className="border-b border-zinc-100 px-4 py-3 text-center min-w-[110px]"
                              >
                                <div className="flex flex-col items-center gap-1.5">
                                  <div
                                    className={cn(
                                      "w-5 h-5 rounded-full mx-auto border",
                                      isLightColor(color) ? "border-zinc-300" : "border-transparent"
                                    )}
                                    style={{ backgroundColor: getColorHex(color) }}
                                  />
                                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                    {color}
                                  </span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {formData.sizes.map((size: string, sIdx: number) => (
                            <tr
                              key={size}
                              className={sIdx % 2 === 0 ? "bg-white" : "bg-zinc-50/40"}
                            >
                              <td className="sticky left-0 z-[5] bg-inherit border-r border-zinc-100 px-4 py-3 font-bold text-zinc-800 text-sm">
                                {size}
                              </td>
                              {formData.colors.map((color: string) => {
                                const key = `${size}-${color}`;
                                const qty = sizeColorStock[key] ?? 0;
                                return (
                                  <td key={key} className="px-3 py-2 text-center">
                                    <Input
                                      type="number"
                                      min="0"
                                      value={qty > 0 ? qty : ""}
                                      placeholder="0"
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        setSizeColorStock((prev) => {
                                          const updated = { ...prev };
                                          if (val > 0) updated[key] = val;
                                          else delete updated[key];
                                          return updated;
                                        });
                                      }}
                                      className={cn(
                                        "h-10 text-center rounded-xl text-sm font-bold w-full transition-all",
                                        qty > 0
                                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 focus:ring-2 focus:ring-emerald-200"
                                          : "border-zinc-100 bg-white text-zinc-400 focus:ring-2 focus:ring-brand/20"
                                      )}
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

            {/* ── 5. Pricing ── */}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Selling Price */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                      Selling Price (₹)
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        placeholder="79999"
                        value={formData.price}
                        onChange={(e) => {
                          const price = e.target.value;
                          const disc = recalcDiscount(price, formData.originalPrice);
                          setFormData((p) => ({ ...p, price, discount: disc }));
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
                      Original / MRP (₹)
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        placeholder="99999"
                        value={formData.originalPrice}
                        onChange={(e) => {
                          const originalPrice = e.target.value;
                          const disc = recalcDiscount(formData.price, originalPrice);
                          setFormData((p) => ({ ...p, originalPrice, discount: disc }));
                        }}
                        className="rounded-2xl border-zinc-100 h-13 sm:h-14 font-medium text-zinc-500 pl-10 bg-zinc-50/50 shadow-sm focus:ring-2 focus:ring-brand/20"
                        required
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 font-bold text-sm">
                        ₹
                      </span>
                    </div>
                  </div>
                </div>

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
                        value={formData.discount}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, discount: e.target.value }))
                        }
                        className="rounded-2xl border-brand/20 h-13 sm:h-14 font-bold text-lg text-brand bg-brand/5 shadow-sm focus:ring-2 focus:ring-brand/30 text-center pr-8"
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
                    <Input
                      disabled
                      value={
                        formData.price && formData.originalPrice
                          ? `₹${Math.max(
                              0,
                              Math.round(
                                parseFloat(formData.originalPrice) -
                                  parseFloat(formData.price)
                              )
                            ).toLocaleString("en-IN")}`
                          : "₹0"
                      }
                      className="rounded-2xl border-emerald-200 h-13 sm:h-14 font-bold text-lg text-emerald-700 bg-emerald-50 shadow-sm cursor-default text-center"
                    />
                  </div>
                </div>

                {/* Sanity check */}
                {formData.price && formData.originalPrice && (
                  <div
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold border",
                      parseFloat(formData.price) > parseFloat(formData.originalPrice)
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    )}
                  >
                    {parseFloat(formData.price) > parseFloat(formData.originalPrice) ? (
                      <>
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        Selling price exceeds MRP — please review pricing.
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        Pricing looks correct — {formData.discount}% discount applied.
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* ── 6. Market Visibility ── */}
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
                {[
                  {
                    id: "isNew",
                    label: "Highlight as New Arrival",
                    key: "isNew" as const,
                  },
                  {
                    id: "isBestSeller",
                    label: "Mark as Bestseller",
                    key: "isBestSeller" as const,
                  },
                ].map(({ id, label, key }) => (
                  <div
                    key={id}
                    className="flex-1 flex items-center space-x-4 group cursor-pointer"
                  >
                    <Checkbox
                      id={id}
                      checked={formData[key]}
                      onCheckedChange={(c) =>
                        setFormData((p) => ({ ...p, [key]: !!c }))
                      }
                      className="w-5 h-5 rounded-lg border-zinc-200 data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                    />
                    <label
                      htmlFor={id}
                      className="text-sm font-bold text-zinc-600 cursor-pointer group-hover:text-zinc-900 transition-colors uppercase tracking-tight"
                    >
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Right: Sticky Preview ── */}
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