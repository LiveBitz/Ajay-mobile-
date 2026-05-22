"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Tag, CreditCard, Smartphone, Building2, Wallet,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, X,
} from "lucide-react";

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
    const res = await fetch("/api/admin/offers");
    const data = await res.json();
    setOffers(data);
    setLoading(false);
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
    const payload = { ...form };
    if (editOffer) {
      await fetch(`/api/admin/offers/${editOffer.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/offers", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setSaving(false);
    setShowModal(false);
    fetchOffers();
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Bank Offers</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage Pine Labs bank offers shown on every product page
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-brand text-white font-bold px-5 py-3 rounded-2xl hover:bg-brand/90 transition-all shadow-sm shadow-brand/20 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Bank Offer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Offers", value: offers.length, color: "text-zinc-900" },
          { label: "Active", value: activeCount, color: "text-emerald-600" },
          { label: "Inactive", value: inactiveCount, color: "text-zinc-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-zinc-100 rounded-2xl px-5 py-4 shadow-sm">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Offers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${
                offer.isActive ? "border-zinc-100" : "border-zinc-100 opacity-60"
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
                    style={{ backgroundColor: BANK_COLORS[offer.bankName] ?? "#71717a" }}
                  >
                    {offer.bankName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 text-sm leading-tight">{offer.bankName}</p>
                    <div className="flex items-center gap-1 text-zinc-400 text-xs mt-0.5">
                      {CARD_TYPE_ICON[offer.cardType]}
                      <span>{offer.cardType}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    offer.isActive
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  {offer.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Discount */}
              <p className="text-xl font-black text-zinc-900 mb-1">{formatDiscount(offer)}</p>
              {offer.minOrderAmount > 0 && (
                <p className="text-xs text-zinc-400">
                  Min order: ₹{offer.minOrderAmount.toLocaleString("en-IN")}
                </p>
              )}
              {offer.description && (
                <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{offer.description}</p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-100">
                <button
                  onClick={() => handleToggle(offer)}
                  className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  {offer.isActive
                    ? <ToggleRight className="w-4 h-4 text-emerald-500" />
                    : <ToggleLeft className="w-4 h-4" />}
                  {offer.isActive ? "Disable" : "Enable"}
                </button>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => openEdit(offer)}
                    className="w-8 h-8 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:border-zinc-300 transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    disabled={deletingId === offer.id}
                    className="w-8 h-8 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-200 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
              <h2 className="text-lg font-black text-zinc-900">
                {editOffer ? "Edit Bank Offer" : "Add Bank Offer"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Bank + Card Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                    Bank Name
                  </label>
                  <select
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  >
                    {BANKS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                    Card Type
                  </label>
                  <select
                    value={form.cardType}
                    onChange={(e) => setForm({ ...form, cardType: e.target.value })}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  >
                    {CARD_TYPES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Discount Type + Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                    Discount Type
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value as "flat" | "percentage" })}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  >
                    <option value="flat">Flat (₹ off)</option>
                    <option value="percentage">Percentage (% off)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                    {form.discountType === "flat" ? "Amount (₹)" : "Percentage (%)"}
                  </label>
                  <input
                    type="number"
                    placeholder={form.discountType === "flat" ? "e.g. 646" : "e.g. 10"}
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                  Description (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cashback credited within 7 days"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
              </div>

              {/* Advanced Options Toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                Advanced Options
              </button>

              {showAdvanced && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                        Min Order (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={form.minOrderAmount}
                        onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                        className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      />
                    </div>
                    {form.discountType === "percentage" && (
                      <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                          Max Discount (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 1000"
                          value={form.maxDiscount}
                          onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                          className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                        />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                        Valid From
                      </label>
                      <input
                        type="date"
                        value={form.validFrom}
                        onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                        className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                        Valid Until
                      </label>
                      <input
                        type="date"
                        value={form.validUntil}
                        onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                        className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Active toggle */}
              <div className="flex items-center justify-between bg-zinc-50 rounded-2xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-zinc-900">Active</p>
                  <p className="text-xs text-zinc-400">Show this offer on product pages</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.isActive ? "bg-brand" : "bg-zinc-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      form.isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center gap-3 px-6 py-5 border-t border-zinc-100">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-2xl border border-zinc-200 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.discountValue}
                className="flex-1 py-3 rounded-2xl bg-brand text-white text-sm font-bold hover:bg-brand/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : editOffer ? "Save Changes" : "Add Offer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
