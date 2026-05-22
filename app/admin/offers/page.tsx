"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Tag, CreditCard, Smartphone, Building2, Wallet,
  ChevronDown, ChevronUp, X,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";

interface BankOffer {
  id: string;
  bankName: string;
  cardType: string;
  discountType: "flat" | "percentage";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  description: string;
  isActive: boolean;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
}

const BANKS = [
  "HDFC Bank", "SBI", "ICICI Bank", "Axis Bank",
  "Kotak Mahindra Bank", "Yes Bank", "IndusInd Bank",
  "IDFC First Bank", "Bank of Baroda", "Punjab National Bank",
  "BHIM", "Other",
];
const CARD_TYPES = ["Credit Card", "Debit Card", "UPI", "Net Banking", "Wallet", "No Cost EMI"];

const BANK_COLORS: Record<string, string> = {
  "HDFC Bank": "#004C9A", "SBI": "#22409A", "ICICI Bank": "#F26522",
  "Axis Bank": "#800080", "Kotak Mahindra Bank": "#EE3124",
  "Yes Bank": "#00305B", "IndusInd Bank": "#E31837",
  "IDFC First Bank": "#005DA0", "Bank of Baroda": "#F26C00",
  "Punjab National Bank": "#1B4B9B", "BHIM": "#3C6EB4", "Other": "#71717a",
};

const CARD_TYPE_ICON: Record<string, React.ReactNode> = {
  "Credit Card": <CreditCard className="w-3.5 h-3.5" />,
  "Debit Card": <CreditCard className="w-3.5 h-3.5" />,
  "UPI": <Smartphone className="w-3.5 h-3.5" />,
  "Net Banking": <Building2 className="w-3.5 h-3.5" />,
  "Wallet": <Wallet className="w-3.5 h-3.5" />,
  "No Cost EMI": <Tag className="w-3.5 h-3.5" />,
};

const emptyForm = {
  bankName: "HDFC Bank",
  cardType: "Credit Card",
  discountType: "flat" as "flat" | "percentage",
  discountValue: "",
  minOrderAmount: "0",
  maxDiscount: "",
  description: "",
  isActive: true,
  validFrom: "",
  validUntil: "",
};

function formatDiscount(offer: BankOffer) {
  if (offer.discountType === "flat") return `₹${offer.discountValue.toLocaleString("en-IN")} off`;
  return `${offer.discountValue}% off${offer.maxDiscount ? ` (max ₹${offer.maxDiscount.toLocaleString("en-IN")})` : ""}`;
}

/* ─── Reusable field styles ─── */
const selectCls =
  "w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-3 text-sm font-semibold text-zinc-900 focus:outline-none focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all appearance-none cursor-pointer";
const inputCls =
  "w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-3 text-sm font-semibold text-zinc-900 placeholder:font-normal placeholder:text-zinc-300 focus:outline-none focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all";
const inputInnerCls =
  "w-full bg-white border border-zinc-200 rounded-xl px-3 py-3 text-sm font-semibold text-zinc-900 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all";
const labelCls =
  "text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest block mb-1.5";

export default function OffersPage() {
  const [offers, setOffers] = useState<BankOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editOffer, setEditOffer] = useState<BankOffer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/offers");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOffers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch offers:", err);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  function openAdd() {
    setEditOffer(null);
    setForm(emptyForm);
    setShowAdvanced(false);
    setShowModal(true);
  }

  function openEdit(offer: BankOffer) {
    setEditOffer(offer);
    setForm({
      bankName: offer.bankName,
      cardType: offer.cardType,
      discountType: offer.discountType,
      discountValue: String(offer.discountValue),
      minOrderAmount: String(offer.minOrderAmount),
      maxDiscount: offer.maxDiscount ? String(offer.maxDiscount) : "",
      description: offer.description,
      isActive: offer.isActive,
      validFrom: offer.validFrom ? offer.validFrom.split("T")[0] : "",
      validUntil: offer.validUntil ? offer.validUntil.split("T")[0] : "",
    });
    setShowAdvanced(false);
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { ...form };
      const res = editOffer
        ? await fetch(`/api/admin/offers/${editOffer.id}`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/offers", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        alert(err.error ?? "Failed to save offer");
        return;
      }
      setShowModal(false);
      fetchOffers();
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(offer: BankOffer) {
    await fetch(`/api/admin/offers/${offer.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !offer.isActive }),
    });
    fetchOffers();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this offer? This cannot be undone.")) return;
    setDeletingId(id);
    await fetch(`/api/admin/offers/${id}`, { method: "DELETE" });
    setDeletingId(null);
    fetchOffers();
  }

  const activeCount = offers.filter((o) => o.isActive).length;
  const inactiveCount = offers.length - activeCount;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Bank Offers</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Manage Pine Labs bank offers shown on every product page
          </p>
        </div>
        <button
          onClick={openAdd}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white font-bold px-5 py-3 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all text-sm shadow-md"
          style={{ backgroundColor: "#dc2626" }}
        >
          <Plus className="w-4 h-4" />
          Add Bank Offer
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: "Total", value: offers.length, color: "text-zinc-900" },
          { label: "Active", value: activeCount, color: "text-emerald-600" },
          { label: "Inactive", value: inactiveCount, color: "text-zinc-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-zinc-100 rounded-2xl px-3 sm:px-5 py-3 sm:py-4 shadow-sm text-center sm:text-left">
            <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Offers Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-zinc-100 rounded-2xl p-5 h-36 animate-pulse" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white border border-zinc-100 rounded-2xl py-16 text-center">
          <Tag className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
          <p className="text-zinc-400 font-semibold">No bank offers yet</p>
          <p className="text-xs text-zinc-300 mt-1">Add your first offer to show it on product pages</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`bg-white border rounded-2xl p-4 shadow-sm transition-all ${
                offer.isActive ? "border-zinc-100" : "border-zinc-100 opacity-55"
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0"
                    style={{ backgroundColor: BANK_COLORS[offer.bankName] ?? "#71717a" }}
                  >
                    {offer.bankName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-zinc-900 text-sm leading-tight truncate">{offer.bankName}</p>
                    <div className="flex items-center gap-1 text-zinc-400 text-xs mt-0.5">
                      {CARD_TYPE_ICON[offer.cardType]}
                      <span className="truncate">{offer.cardType}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg shrink-0 ${
                    offer.isActive ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  {offer.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Discount */}
              <p className="text-lg font-black text-zinc-900 mb-0.5">{formatDiscount(offer)}</p>
              {offer.minOrderAmount > 0 && (
                <p className="text-xs text-zinc-400">Min ₹{offer.minOrderAmount.toLocaleString("en-IN")}</p>
              )}
              {offer.description && (
                <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{offer.description}</p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-zinc-100">
                <button
                  onClick={() => handleToggle(offer)}
                  className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 active:scale-95 transition-all min-h-[40px] px-1"
                >
                  {offer.isActive
                    ? <ToggleRight className="w-5 h-5 text-emerald-500 shrink-0" />
                    : <ToggleLeft className="w-5 h-5 shrink-0" />}
                  {offer.isActive ? "Disable" : "Enable"}
                </button>
                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    onClick={() => openEdit(offer)}
                    className="w-9 h-9 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:border-zinc-300 active:scale-95 transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    disabled={deletingId === offer.id}
                    className="w-9 h-9 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-200 active:scale-95 transition-all disabled:opacity-40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal (shadcn Dialog) ── */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogPortal>
          <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
          {/* Content — no default padding, full control */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
            <div className="pointer-events-auto w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh]">

              {/* Drag handle (mobile only) */}
              <div className="flex justify-center pt-2.5 pb-1 sm:hidden shrink-0">
                <div className="w-10 h-1 rounded-full bg-zinc-300" />
              </div>

              {/* Sticky dark header */}
              <div className="relative bg-gradient-to-r from-zinc-900 to-zinc-800 sm:rounded-t-3xl px-5 py-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <Tag className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white leading-tight">
                      {editOffer ? "Edit Bank Offer" : "Add Bank Offer"}
                    </h2>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Offer will appear on every product page
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-3.5 right-4 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable form body */}
              <div className="overflow-y-auto px-5 py-5 space-y-4 flex-1">

                {/* Bank + Card Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Bank Name</label>
                    <select
                      value={form.bankName}
                      onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                      className={selectCls}
                    >
                      {BANKS.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Card Type</label>
                    <select
                      value={form.cardType}
                      onChange={(e) => setForm({ ...form, cardType: e.target.value })}
                      className={selectCls}
                    >
                      {CARD_TYPES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Discount Type + Value */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Discount Type</label>
                    <select
                      value={form.discountType}
                      onChange={(e) => setForm({ ...form, discountType: e.target.value as "flat" | "percentage" })}
                      className={selectCls}
                    >
                      <option value="flat">Flat (₹ off)</option>
                      <option value="percentage">Percentage (% off)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>
                      {form.discountType === "flat" ? "Amount (₹)" : "Percentage (%)"}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400 select-none">
                        {form.discountType === "flat" ? "₹" : "%"}
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder={form.discountType === "flat" ? "646" : "10"}
                        value={form.discountValue}
                        onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                        className={inputCls + " pl-7"}
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={labelCls}>
                    Description <span className="normal-case font-medium text-zinc-300">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cashback credited within 7 days"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={inputCls}
                  />
                </div>

                {/* Advanced Options */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-zinc-700 transition-colors group min-h-[36px]"
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      showAdvanced ? "border-red-300 bg-red-50" : "border-zinc-200 bg-zinc-50 group-hover:border-zinc-300"
                    }`}>
                      {showAdvanced
                        ? <ChevronUp className="w-3 h-3 text-red-500" />
                        : <ChevronDown className="w-3 h-3 text-zinc-400" />}
                    </div>
                    Advanced Options
                  </button>

                  {showAdvanced && (
                    <div className="mt-3 space-y-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>Min Order (₹)</label>
                          <input
                            type="number"
                            inputMode="numeric"
                            placeholder="0"
                            value={form.minOrderAmount}
                            onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                            className={inputInnerCls}
                          />
                        </div>
                        {form.discountType === "percentage" && (
                          <div>
                            <label className={labelCls}>Max Discount (₹)</label>
                            <input
                              type="number"
                              inputMode="numeric"
                              placeholder="1000"
                              value={form.maxDiscount}
                              onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                              className={inputInnerCls}
                            />
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>Valid From</label>
                          <input
                            type="date"
                            value={form.validFrom}
                            onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                            className={inputInnerCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Valid Until</label>
                          <input
                            type="date"
                            value={form.validUntil}
                            onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                            className={inputInnerCls}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-3.5 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                      style={{ backgroundColor: form.isActive ? "#fef2f2" : "#f4f4f5" }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full transition-colors"
                        style={{ backgroundColor: form.isActive ? "#dc2626" : "#a1a1aa" }}
                      />
                    </div>
                    <Label htmlFor="offer-active" className="cursor-pointer min-w-0">
                      <p className="text-sm font-bold text-zinc-900 leading-tight">Show on product pages</p>
                      <p className="text-xs text-zinc-400 mt-0.5 font-normal">
                        {form.isActive ? "Visible to customers" : "Hidden from customers"}
                      </p>
                    </Label>
                  </div>
                  <Switch
                    id="offer-active"
                    checked={form.isActive}
                    onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                    className="shrink-0 data-checked:bg-red-600"
                  />
                </div>
              </div>

              {/* Sticky footer buttons */}
              <div className="flex items-center gap-3 px-5 py-4 border-t border-zinc-100 shrink-0">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3.5 rounded-2xl border-2 border-zinc-200 text-sm font-bold text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.discountValue}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                  style={{
                    backgroundColor: "#dc2626",
                    boxShadow: form.discountValue ? "0 4px 14px rgba(220,38,38,0.3)" : "none",
                  }}
                >
                  {saving ? "Saving…" : editOffer ? "Save Changes" : "Add Offer"}
                </button>
              </div>

            </div>
          </div>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
