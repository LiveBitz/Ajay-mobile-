"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  X, Check, Loader2, Upload, Plus, Minus,
  Link2, Type, LayoutTemplate, Hash, Sparkles, ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectSeparator, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createBanner, updateBanner } from "@/lib/actions/banner-actions";
import { Banner } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { normalizeBannerLink } from "@/lib/banner-link";

interface BannerFormProps {
  banner?: Banner | null;
  allBanners: Banner[];
  navData?: {
    categories: { label: string; value: string }[];
    products: { label: string; value: string }[];
    fixed: { label: string; value: string }[];
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function BannerForm({ banner, allBanners, navData, onClose, onSuccess }: BannerFormProps) {
  const isEditing = !!banner;
  const [formData, setFormData] = useState({
    title: banner?.title || "",
    subtitle: banner?.subtitle || "",
    image: banner?.image || "",
    link: normalizeBannerLink(banner?.link || "/"),
    type: banner?.type || "HERO",
    order: banner?.order || 1,
    isActive: banner?.isActive ?? true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = { ...formData, link: normalizeBannerLink(formData.link) };
    try {
      const res = banner ? await updateBanner(banner.id, payload) : await createBanner(payload);
      if (res.success) {
        toast({
          title: banner ? "Banner updated" : "Banner created",
          description: banner ? "Your changes have been saved." : "New banner added to storefront.",
        });
        onSuccess();
      } else {
        toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    try {
      setIsUploading(true);
      setUploadProgress(10);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;
      setUploadProgress(30);
      const { error: uploadError } = await supabase.storage
        .from("banner").upload(filePath, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;
      setUploadProgress(80);
      const { data: { publicUrl } } = supabase.storage.from("banner").getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, image: publicUrl }));
      setUploadProgress(100);
      toast({ title: "Image uploaded", description: "Image successfully saved to cloud storage." });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message || "Check bucket permissions.", variant: "destructive" });
    } finally {
      setTimeout(() => { setIsUploading(false); setUploadProgress(0); }, 600);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const bannersOfType = allBanners.filter(b => b.type === formData.type);
  const isEditingSameType = banner?.type === formData.type;
  const maxOrder = bannersOfType.length + (isEditingSameType ? 0 : 1);
  const adjustOrder = (delta: number) => {
    setFormData(prev => ({ ...prev, order: Math.min(maxOrder, Math.max(1, prev.order + delta)) }));
  };

  // Keep display order valid when banner type or list size changes.
  useEffect(() => {
    setFormData((prev) => {
      const clampedOrder = Math.min(maxOrder, Math.max(1, prev.order));
      if (clampedOrder === prev.order) return prev;
      return { ...prev, order: clampedOrder };
    });
  }, [maxOrder]);

  // Sync form state when editing a different banner.
  useEffect(() => {
    setFormData({
      title: banner?.title || "",
      subtitle: banner?.subtitle || "",
      image: banner?.image || "",
      link: normalizeBannerLink(banner?.link || "/"),
      type: banner?.type || "HERO",
      order: banner?.order || 1,
      isActive: banner?.isActive ?? true,
    });
  }, [banner]);

  // For new banners, default order to the next slot of selected type.
  useEffect(() => {
    if (isEditing) return;
    const nextOrder = allBanners.filter((b) => b.type === formData.type).length + 1;
    setFormData((prev) => (prev.order === nextOrder ? prev : { ...prev, order: nextOrder }));
  }, [isEditing, allBanners, formData.type]);

  const fixedLinks = navData?.fixed ?? [];
  const categoryLinks = navData?.categories ?? [];
  const allLinkValues = new Set([
    ...fixedLinks.map(i => i.value),
    ...categoryLinks.map(i => i.value),
  ]);
  const normalizedCurrentLink = normalizeBannerLink(formData.link);
  const hasCurrentLinkInOptions = allLinkValues.has(normalizedCurrentLink);
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto"
      style={{ padding: "12px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bf-modal">

        {/* ── Header ── */}
        <div className="bf-header">
          <div className="bf-header-icon">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="bf-header-text">
            <h2 className="bf-title">{isEditing ? "Edit Banner" : "Create Banner"}</h2>
            <p className="bf-subtitle">{isEditing ? "Update your storefront banner" : "Add a new banner to your storefront"}</p>
          </div>
          <button onClick={onClose} className="bf-close" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="bf-body">

          {/* Image Upload */}
          <div className="bf-section">
            <div className="bf-section-label">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Banner Image</span>
            </div>

            <div
              className={`bf-dropzone ${dragOver ? "bf-dropzone-active" : ""} ${formData.image ? "bf-dropzone-filled" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input ref={fileInputRef} type="file" onChange={handleImageUpload} accept="image/*" className="hidden" />

              {formData.image ? (
                <>
                  <Image src={formData.image} alt="Banner preview" fill className="object-cover" />
                  <div className="bf-dropzone-overlay">
                    <div className="bf-swap-btn">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Change Image</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bf-dropzone-empty">
                  <div className="bf-upload-icon">
                    {isUploading
                      ? <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
                      : <Upload className="w-6 h-6 text-zinc-300" />
                    }
                  </div>
                  <p className="bf-upload-label">
                    {isUploading ? `Uploading… ${uploadProgress}%` : "Drop image or click to browse"}
                  </p>
                  <p className="bf-upload-hint">PNG, JPG, WebP — recommended 1920×600</p>
                </div>
              )}

              {isUploading && (
                <div className="bf-progress-bar">
                  <div className="bf-progress-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </div>

            <div className="bf-url-row">
              <span className="bf-url-label">Or paste URL</span>
              <Input
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="bf-input bf-input-mono"
              />
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="bf-section">
            <div className="bf-section-label">
              <Type className="w-3.5 h-3.5" />
              <span>Content</span>
            </div>
            <div className="bf-grid-2">
              <div className="bf-field">
                <Label htmlFor="title" className="bf-label">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Summer Sale 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bf-input"
                />
              </div>
              <div className="bf-field">
                <Label htmlFor="subtitle" className="bf-label">Subtitle</Label>
                <Input
                  id="subtitle"
                  placeholder="e.g. Up to 40% off"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="bf-input"
                />
              </div>
            </div>
          </div>

          {/* Type & Link */}
          <div className="bf-section">
            <div className="bf-section-label">
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Placement & Destination</span>
            </div>
            <div className="bf-grid-2">
              <div className="bf-field">
                <Label className="bf-label">Banner Type</Label>
                <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                  <SelectTrigger className="bf-select-trigger">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bf-select-content">
                    <SelectItem value="HERO" className="bf-select-item">
                      <div className="bf-select-item-inner">
                        <span className="bf-select-tag bf-tag-hero">HERO</span>
                        <span>Prime Slideshow</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="PROMO" className="bf-select-item">
                      <div className="bf-select-item-inner">
                        <span className="bf-select-tag bf-tag-promo">PROMO</span>
                        <span>Structural Strip</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bf-field">
                <Label className="bf-label">
                  <Link2 className="w-3 h-3 inline mr-1" />
                  Destination Link
                </Label>
                <Select
                  value={formData.link}
                  onValueChange={(val) => setFormData({ ...formData, link: normalizeBannerLink(val) })}
                >
                  <SelectTrigger className="bf-select-trigger bf-select-mono">
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent className="bf-select-content">
                    {!hasCurrentLinkInOptions && normalizedCurrentLink && (
                      <>
                        <SelectGroup>
                          <SelectLabel className="bf-select-group-label">Current</SelectLabel>
                          <SelectItem value={normalizedCurrentLink} className="bf-select-item">
                            {normalizedCurrentLink}
                          </SelectItem>
                        </SelectGroup>
                        <SelectSeparator className="bf-select-sep" />
                      </>
                    )}
                    {fixedLinks.length > 0 && (
                      <>
                        <SelectGroup>
                          <SelectLabel className="bf-select-group-label">Core Pages</SelectLabel>
                          {fixedLinks.map(item => (
                            <SelectItem key={`fixed-${item.value}`} value={item.value} className="bf-select-item">
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        {categoryLinks.length > 0 && <SelectSeparator className="bf-select-sep" />}
                      </>
                    )}
                    {categoryLinks.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="bf-select-group-label">Categories</SelectLabel>
                        {categoryLinks.map(item => (
                          <SelectItem key={`cat-${item.value}`} value={item.value} className="bf-select-item">
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    {fixedLinks.length === 0 && categoryLinks.length === 0 && (
                      <SelectGroup>
                        <SelectLabel className="bf-select-group-label">No Routes Available</SelectLabel>
                        <SelectItem value="/" disabled className="bf-select-item">
                          Add categories or core links first
                        </SelectItem>
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Display Order */}
          <div className="bf-section">
            <div className="bf-section-label">
              <Hash className="w-3.5 h-3.5" />
              <span>Display Order</span>
              <span className="bf-hint-badge">1 – {maxOrder}</span>
            </div>
            <div className="bf-order-row">
              <button
                type="button"
                onClick={() => adjustOrder(-1)}
                disabled={formData.order <= 1}
                className="bf-order-btn bf-order-minus"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="bf-order-display">
                <span className="bf-order-num">{String(formData.order).padStart(2, "0")}</span>
                <span className="bf-order-label">of {String(maxOrder).padStart(2, "0")}</span>
              </div>
              <button
                type="button"
                onClick={() => adjustOrder(1)}
                disabled={formData.order >= maxOrder}
                className="bf-order-btn bf-order-plus"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="bf-order-hint">
              Lower numbers appear first in the {formData.type.toLowerCase()} section.
            </p>
          </div>

          {/* Active Toggle */}
          <div className="bf-section">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
              className={`bf-toggle ${formData.isActive ? "bf-toggle-on" : "bf-toggle-off"}`}
            >
              <div className={`bf-toggle-knob ${formData.isActive ? "bf-toggle-knob-on" : ""}`} />
              <span className="bf-toggle-label">
                {formData.isActive ? "Banner is Live" : "Banner is Hidden"}
              </span>
              <span className={`bf-toggle-status ${formData.isActive ? "bf-status-live" : "bf-status-hidden"}`}>
                {formData.isActive ? "Active" : "Draft"}
              </span>
            </button>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="bf-footer">
          <button type="button" onClick={onClose} className="bf-btn-cancel">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bf-btn-submit"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving…</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isEditing ? "Save Changes" : "Create Banner"}</span>
              </>
            )}
          </button>
        </div>

      </div>

      <style>{`
        .bf-modal {
          position: relative;
          background: #ffffff;
          width: 100%;
          max-width: 680px;
          border-radius: 24px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          max-height: calc(100vh - 24px);
          overflow: hidden;
          margin: auto;
        }
        .bf-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px;
          border-bottom: 1px solid #f4f4f5;
          flex-shrink: 0;
        }
        @media (min-width: 640px) {
          .bf-header { padding: 24px 28px; }
        }
        .bf-header-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #18181b, #3f3f46);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .bf-header-text { flex: 1; min-width: 0; }
        .bf-title {
          font-size: 16px;
          font-weight: 800;
          color: #09090b;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        @media (min-width: 640px) { .bf-title { font-size: 18px; } }
        .bf-subtitle {
          font-size: 11px;
          color: #a1a1aa;
          font-weight: 500;
          margin-top: 2px;
        }
        .bf-close {
          width: 32px; height: 32px;
          border-radius: 8px;
          border: 1px solid #f4f4f5;
          background: #fafafa;
          color: #a1a1aa;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.18s ease;
          flex-shrink: 0;
        }
        .bf-close:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }
        .bf-body {
          overflow-y: auto;
          flex: 1;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          scrollbar-width: thin;
          scrollbar-color: #e4e4e7 transparent;
        }
        @media (min-width: 640px) { .bf-body { padding: 24px 28px; gap: 28px; } }
        .bf-body::-webkit-scrollbar { width: 4px; }
        .bf-body::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 4px; }
        .bf-section { display: flex; flex-direction: column; gap: 10px; }
        .bf-section-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #71717a;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .bf-hint-badge {
          font-size: 10px;
          font-weight: 700;
          color: #52525b;
          background: #f4f4f5;
          border-radius: 4px;
          padding: 2px 6px;
          font-family: monospace;
        }
        .bf-dropzone {
          position: relative;
          width: 100%;
          aspect-ratio: 21 / 7;
          border-radius: 16px;
          border: 2px dashed #e4e4e7;
          background: #fafafa;
          overflow: hidden;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .bf-dropzone:hover, .bf-dropzone-active {
          border-color: #a1a1aa;
          background: #f4f4f5;
        }
        .bf-dropzone-filled { border-style: solid; border-color: #e4e4e7; }
        .bf-dropzone-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(3px);
          opacity: 0;
          transition: opacity 0.22s ease;
          display: flex; align-items: center; justify-content: center;
        }
        .bf-dropzone:hover .bf-dropzone-overlay { opacity: 1; }
        .bf-swap-btn {
          display: flex; align-items: center; gap: 6px;
          background: white;
          color: #09090b;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 8px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .bf-dropzone-empty {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 8px;
        }
        .bf-upload-icon {
          width: 48px; height: 48px;
          border-radius: 12px;
          background: white;
          border: 1px solid #e4e4e7;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .bf-upload-label { font-size: 12px; font-weight: 600; color: #71717a; }
        .bf-upload-hint { font-size: 10px; color: #a1a1aa; font-weight: 500; }
        .bf-progress-bar {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 3px; background: #e4e4e7;
        }
        .bf-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #18181b, #52525b);
          border-radius: 0 2px 2px 0;
          transition: width 0.3s ease;
        }
        .bf-url-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .bf-url-label {
          font-size: 11px;
          font-weight: 600;
          color: #a1a1aa;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .bf-grid-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 500px) {
          .bf-grid-2 { grid-template-columns: 1fr 1fr; gap: 14px; }
        }
        .bf-field { display: flex; flex-direction: column; gap: 6px; }
        .bf-label {
          font-size: 11px !important;
          font-weight: 700 !important;
          color: #52525b !important;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .bf-input {
          height: 44px !important;
          border-radius: 10px !important;
          border-color: #e4e4e7 !important;
          background: #fafafa !important;
          font-size: 13px !important;
          transition: all 0.18s ease !important;
        }
        .bf-input:focus { border-color: #a1a1aa !important; background: #ffffff !important; }
        .bf-input-mono { font-family: monospace !important; font-size: 11px !important; }
        .bf-select-trigger {
          height: 44px !important;
          border-radius: 10px !important;
          border-color: #e4e4e7 !important;
          background: #fafafa !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          padding: 0 12px !important;
        }
        .bf-select-mono { font-family: monospace !important; font-size: 11px !important; }
        .bf-select-content {
          border-radius: 14px !important;
          border-color: #27272a !important;
          background: #18181b !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.45) !important;
          padding: 6px !important;
          z-index: 70 !important;
        }
        .bf-select-item {
          border-radius: 8px !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          color: #a1a1aa !important;
          padding: 10px 12px !important;
          cursor: pointer !important;
        }
        .bf-select-item:focus { background: #27272a !important; color: #fafafa !important; }
        .bf-select-item-inner { display: flex; align-items: center; gap: 8px; }
        .bf-select-tag {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .bf-tag-hero { background: #1d4ed8; color: white; }
        .bf-tag-promo { background: #7c3aed; color: white; }
        .bf-select-group-label {
          font-size: 9px !important;
          font-weight: 800 !important;
          letter-spacing: 0.12em !important;
          color: #52525b !important;
          text-transform: uppercase !important;
          padding: 8px 12px 4px !important;
        }
        .bf-select-sep { background: #27272a !important; margin: 4px 0 !important; }
        .bf-order-row {
          display: flex;
          align-items: center;
          gap: 12px;
          align-self: flex-start;
        }
        .bf-order-btn {
          width: 40px; height: 40px;
          border-radius: 10px;
          border: 1.5px solid #e4e4e7;
          background: #fafafa;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #52525b;
          transition: all 0.18s ease;
        }
        .bf-order-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .bf-order-minus:not(:disabled):hover { background: #fef2f2; border-color: #fecaca; color: #ef4444; }
        .bf-order-plus:not(:disabled):hover { background: #f0fdf4; border-color: #bbf7d0; color: #16a34a; }
        .bf-order-display {
          display: flex; flex-direction: column; align-items: center;
          min-width: 52px;
        }
        .bf-order-num {
          font-size: 24px;
          font-weight: 900;
          color: #09090b;
          letter-spacing: -0.04em;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }
        .bf-order-label { font-size: 10px; color: #a1a1aa; font-weight: 600; margin-top: 2px; }
        .bf-order-hint { font-size: 11px; color: #a1a1aa; font-weight: 500; line-height: 1.5; }
        .bf-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1.5px solid;
          cursor: pointer;
          transition: all 0.22s ease;
          width: 100%;
          background: none;
        }
        .bf-toggle-on { border-color: #bbf7d0; background: #f0fdf4; }
        .bf-toggle-off { border-color: #e4e4e7; background: #fafafa; }
        .bf-toggle-knob {
          width: 36px; height: 20px;
          border-radius: 10px;
          background: #d4d4d8;
          position: relative;
          transition: background 0.22s ease;
          flex-shrink: 0;
        }
        .bf-toggle-knob::after {
          content: '';
          position: absolute;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: white;
          top: 2px; left: 2px;
          transition: transform 0.22s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .bf-toggle-knob-on { background: #16a34a; }
        .bf-toggle-knob-on::after { transform: translateX(16px); }
        .bf-toggle-label {
          font-size: 13px;
          font-weight: 600;
          color: #3f3f46;
          flex: 1;
          text-align: left;
        }
        .bf-toggle-status {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .bf-status-live { background: #dcfce7; color: #15803d; }
        .bf-status-hidden { background: #f4f4f5; color: #71717a; }
        .bf-footer {
          display: flex;
          flex-direction: column-reverse;
          gap: 8px;
          padding: 16px 20px;
          border-top: 1px solid #f4f4f5;
          background: #fafafa;
          flex-shrink: 0;
        }
        @media (min-width: 400px) {
          .bf-footer { flex-direction: row; padding: 16px 28px; }
        }
        .bf-btn-cancel {
          flex: 1;
          height: 42px;
          border-radius: 10px;
          border: 1.5px solid #e4e4e7;
          background: white;
          font-size: 12px;
          font-weight: 700;
          color: #71717a;
          cursor: pointer;
          transition: all 0.18s ease;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .bf-btn-cancel:hover { background: #f4f4f5; color: #3f3f46; }
        .bf-btn-cancel:active { transform: scale(0.98); }
        .bf-btn-submit {
          flex: 2;
          height: 42px;
          border-radius: 10px;
          border: none;
          background: #09090b;
          color: white;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s ease;
          display: flex; align-items: center; justify-content: center;
          gap: 6px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }
        .bf-btn-submit:hover:not(:disabled) { background: #27272a; box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
        .bf-btn-submit:active:not(:disabled) { transform: scale(0.98); }
        .bf-btn-submit:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
      `}</style>
    </div>
  );
}