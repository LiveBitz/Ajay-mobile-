"use client";

import React, { useState } from "react";
import { Building2, ChevronDown, CreditCard, Smartphone, Tag, Wallet, Zap } from "lucide-react";

interface BankOffer {
  id: string;
  bankName: string;
  cardType: string;
  discountType: "flat" | "percentage";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  description: string;
}

interface Props {
  offers: BankOffer[];
  productPrice: number;
}

const BANK_COLORS: Record<string, string> = {
  "HDFC Bank":            "#004C9A",
  "SBI":                  "#22409A",
  "ICICI Bank":           "#F26522",
  "Axis Bank":            "#800080",
  "Kotak Mahindra Bank":  "#EE3124",
  "Yes Bank":             "#00305B",
  "IndusInd Bank":        "#E31837",
  "IDFC First Bank":      "#005DA0",
  "Bank of Baroda":       "#F26C00",
  "Punjab National Bank": "#1B4B9B",
  "BHIM":                 "#3C6EB4",
  "Other":                "#71717a",
};

const CARD_ICONS: Record<string, React.ReactNode> = {
  "Credit Card": <CreditCard className="w-3 h-3" />,
  "Debit Card":  <CreditCard className="w-3 h-3" />,
  "UPI":         <Smartphone className="w-3 h-3" />,
  "Net Banking": <Building2  className="w-3 h-3" />,
  "Wallet":      <Wallet     className="w-3 h-3" />,
  "No Cost EMI": <Tag        className="w-3 h-3" />,
};

function bankInitials(name: string) {
  if (name === "BHIM") return "UPI";
  const parts = name.replace(" Bank", "").split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function discountLabel(offer: BankOffer) {
  if (offer.discountType === "flat") return `₹${offer.discountValue.toLocaleString("en-IN")} off`;
  return `${offer.discountValue}% off`;
}

function bestSaving(offer: BankOffer, price: number) {
  if (offer.discountType === "flat") return offer.discountValue;
  const calc = Math.round((offer.discountValue / 100) * price);
  return offer.maxDiscount ? Math.min(calc, offer.maxDiscount) : calc;
}

const INITIAL_SHOW = 3;

export function BankOffersSection({ offers, productPrice }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!offers || offers.length === 0) return null;

  const best      = offers[0];
  const saving    = bestSaving(best, productPrice);
  const visible   = expanded ? offers : offers.slice(0, INITIAL_SHOW);
  const remaining = offers.length - INITIAL_SHOW;

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
            <CreditCard className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-red-500 leading-none mb-0.5">
              Bank Offers
            </p>
            <p className="text-[13px] font-black text-zinc-900 leading-tight">
              Instant savings at checkout
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 border border-zinc-200 rounded-full px-2.5 py-1 shrink-0">
          {offers.length} offer{offers.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Best deal banner — left accent stripe style ── */}
      <div className="mx-4 mt-3 mb-0.5 rounded-xl overflow-hidden flex border border-emerald-100">
        {/* left accent stripe */}
        <div className="w-1 shrink-0 bg-emerald-400" />
        <div className="flex items-center gap-2 px-3 py-2.5 flex-1 bg-emerald-50/60">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <Zap className="w-2.5 h-2.5 text-white fill-white" />
          </div>
          <p className="text-[12.5px] leading-snug">
            <span className="font-black text-emerald-700">
              Save ₹{saving.toLocaleString("en-IN")}
            </span>
            <span className="text-zinc-500 font-medium">
              {" "}with {best.bankName} {best.cardType}
            </span>
          </p>
        </div>
      </div>

      {/* ── Offer rows ── */}
      <div className="px-4 pt-1 pb-1">
        {visible.map((offer, i) => {
          const color    = BANK_COLORS[offer.bankName] ?? "#71717a";
          const initials = bankInitials(offer.bankName);
          const hasCap   = offer.discountType === "percentage" && offer.maxDiscount;

          return (
            <div
              key={offer.id}
              className={`flex items-center gap-3 py-2.5 ${
                i < visible.length - 1 ? "border-b border-zinc-100" : ""
              }`}
            >
              {/* Bank badge — smaller, tighter */}
              <div
                className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white font-black text-[10px] shadow-sm"
                style={{ backgroundColor: color }}
              >
                {initials}
              </div>

              {/* Info — all inline, single row feel */}
              <div className="flex-1 min-w-0">
                {/* Row 1: discount + auto applied inline */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-black text-zinc-900">
                    {discountLabel(offer)}
                    {hasCap && (
                      <span className="ml-1 text-[10px] font-bold text-zinc-400">
                        (max ₹{offer.maxDiscount?.toLocaleString("en-IN")})
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-0.5 leading-none">
                    ✓ Auto applied
                  </span>
                </div>

                {/* Row 2: bank name + card type + optional min order */}
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-zinc-400">{CARD_ICONS[offer.cardType]}</span>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    {offer.bankName} · {offer.cardType}
                  </span>
                  {offer.minOrderAmount > 0 && (
                    <>
                      <span className="text-zinc-300 text-[10px]">·</span>
                      <span className="text-[10px] font-semibold text-zinc-400">
                        Min ₹{offer.minOrderAmount.toLocaleString("en-IN")}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Show more / less ── */}
      {offers.length > INITIAL_SHOW && (
        <div className="px-4 pb-2.5">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[11px] font-black text-red-500 hover:text-red-600 transition-colors"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
            {expanded ? "Show less" : `+${remaining} more offer${remaining !== 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-100 bg-zinc-50/60">
        <p className="text-[10px] text-zinc-400 font-medium">
          Offers applied automatically at Pine Labs checkout
        </p>
        <p className="text-[10px] font-black text-zinc-400 shrink-0 ml-2">
          Pine Labs
        </p>
      </div>

    </div>
  );
}
