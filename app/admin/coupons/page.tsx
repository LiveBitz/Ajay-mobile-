"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, Copy, Check, Ticket } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  maxDiscount: number | null;
  minOrderAmount: number;
  isActive: boolean;
  usedAt: string | null;
  usedByOrderId: string | null;
  expiresAt: string | null;
  createdAt: string;
}

const EMPTY_FORM = {
  code: "",
  discountType: "percentage" as "percentage" | "flat",
  discountValue: "",
  maxDiscount: "",
  minOrderAmount: "",
  expiresAt: "",
};

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/coupons");
    if (res.ok) setCoupons(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  async function handleCreate() {
    setError("");
    if (!form.code.trim()) { setError("Code is required."); return; }
    if (!form.discountValue || Number(form.discountValue) <= 0) { setError("Discount value must be positive."); return; }

    setSaving(true);
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        minOrderAmount: Number(form.minOrderAmount) || 0,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) { setError(data.error || "Failed to create coupon."); return; }
    setCoupons((prev) => [data, ...prev]);
    setShowDialog(false);
    setForm(EMPTY_FORM);
  }

  async function handleToggle(coupon: Coupon) {
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !coupon.isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? updated : c)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (res.ok) setCoupons((prev) => prev.filter((c) => c.id !== id));
  }

  function copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">Coupon Codes</h1>
          <p className="text-sm text-zinc-400 font-medium mt-0.5">
            Generate one-time discount codes for customers
          </p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_FORM); setError(""); setShowDialog(true); }}
          className="flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-brand/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Coupon
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: coupons.length, color: "text-zinc-900" },
          { label: "Active", value: coupons.filter((c) => c.isActive && !c.usedAt).length, color: "text-emerald-600" },
          { label: "Used", value: coupons.filter((c) => c.usedAt).length, color: "text-zinc-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-zinc-100 rounded-2xl p-4 text-center shadow-sm">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-400 font-medium">Loading...</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium">No coupons yet. Create your first one.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_100px_100px_100px_80px_80px] gap-4 px-6 py-3 bg-zinc-50/60 text-[10px] font-black uppercase tracking-widest text-zinc-400">
              <span>Code</span>
              <span>Discount</span>
              <span>Min Order</span>
              <span>Expires</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>

            {coupons.map((coupon) => {
              const isUsed = !!coupon.usedAt;
              const isExpired = coupon.expiresAt && new Date() > new Date(coupon.expiresAt);

              return (
                <div
                  key={coupon.id}
                  className="grid grid-cols-[1fr_100px_100px_100px_80px_80px] gap-4 px-6 py-4 items-center hover:bg-zinc-50/40 transition-colors"
                >
                  {/* Code + copy */}
                  <div className="flex items-center gap-2">
                    <span className="font-black text-zinc-900 tracking-wider text-sm">{coupon.code}</span>
                    <button
                      onClick={() => copyCode(coupon.code, coupon.id)}
                      className="text-zinc-300 hover:text-brand transition-colors"
                    >
                      {copiedId === coupon.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {isUsed && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-100 rounded-full px-2 py-0.5">
                        Used
                      </span>
                    )}
                  </div>

                  {/* Discount */}
                  <span className="text-sm font-black text-brand">
                    {coupon.discountType === "flat"
                      ? `₹${coupon.discountValue.toLocaleString("en-IN")} off`
                      : `${coupon.discountValue}%${coupon.maxDiscount ? ` (max ₹${coupon.maxDiscount.toLocaleString("en-IN")})` : ""}`}
                  </span>

                  {/* Min order */}
                  <span className="text-sm text-zinc-500 font-medium">
                    {coupon.minOrderAmount > 0 ? `₹${coupon.minOrderAmount.toLocaleString("en-IN")}` : "—"}
                  </span>

                  {/* Expires */}
                  <span className="text-sm text-zinc-500 font-medium">
                    {coupon.expiresAt
                      ? new Date(coupon.expiresAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })
                      : "Never"}
                  </span>

                  {/* Status badge */}
                  <span className={`text-[10px] font-black uppercase tracking-widest rounded-full px-2 py-1 w-fit ${
                    isUsed
                      ? "bg-zinc-100 text-zinc-400"
                      : isExpired
                      ? "bg-red-50 text-red-400"
                      : coupon.isActive
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-zinc-100 text-zinc-400"
                  }`}>
                    {isUsed ? "Used" : isExpired ? "Expired" : coupon.isActive ? "Active" : "Off"}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2 justify-end">
                    {!isUsed && (
                      <button onClick={() => handleToggle(coupon)} className="text-zinc-400 hover:text-brand transition-colors">
                        {coupon.isActive
                          ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                          : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    )}
                    <button onClick={() => handleDelete(coupon.id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogTitle className="text-lg font-black text-zinc-900 mb-4">Create Coupon</DialogTitle>

          <div className="space-y-4">
            {/* Code */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1 block">Code</label>
              <div className="flex gap-2">
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SAVE20"
                  className="flex-1 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand uppercase"
                />
                <button
                  onClick={() => setForm({ ...form, code: randomCode() })}
                  className="px-3 py-2.5 border border-zinc-200 rounded-xl text-xs font-black text-zinc-500 hover:bg-zinc-50 transition-colors whitespace-nowrap"
                >
                  Random
                </button>
              </div>
            </div>

            {/* Discount type */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1 block">Discount Type</label>
              <div className="flex gap-2">
                {(["percentage", "flat"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm({ ...form, discountType: t })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      form.discountType === t
                        ? "bg-brand text-white border-brand"
                        : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                    }`}
                  >
                    {t === "percentage" ? "% Off" : "₹ Flat Off"}
                  </button>
                ))}
              </div>
            </div>

            {/* Discount value */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1 block">
                  {form.discountType === "percentage" ? "Discount %" : "Flat Amount ₹"}
                </label>
                <input
                  type="number"
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  placeholder={form.discountType === "percentage" ? "10" : "500"}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
              </div>
              {form.discountType === "percentage" && (
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1 block">Max Discount ₹</label>
                  <input
                    type="number"
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                    placeholder="1000 (optional)"
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                </div>
              )}
            </div>

            {/* Min order */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1 block">Min Order Amount ₹</label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                placeholder="0 (no minimum)"
                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
            </div>

            {/* Expiry */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1 block">Expires On (optional)</label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
            </div>

            {error && <p className="text-sm text-red-500 font-bold">{error}</p>}

            <button
              onClick={handleCreate}
              disabled={saving}
              className="w-full bg-brand text-white py-3 rounded-xl font-black text-sm hover:bg-brand/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "Creating..." : "Create Coupon"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
