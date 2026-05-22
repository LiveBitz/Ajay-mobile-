"use client";

import React, { useState } from "react";
import { CreditCard, Smartphone, Building2, Wallet, Tag, ChevronDown, ChevronUp, Zap } from "lucide-react";

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
  "HDFC Bank": "#004C9A",
  "SBI": "#22409A",
  "ICICI Bank": "#F26522",
  "Axis Bank": "#800080",
  "Kotak Mahindra Bank": "#EE3124",
  "Yes Bank": "#00305B",
  "IndusInd Bank": "#E31837",
  "IDFC First Bank": "#005DA0",
  "Bank of Baroda": "#F26C00",
  "Punjab National Bank": "#1B4B9B",
  "BHIM": "#3C6EB4",
  "Other": "#71717a",
};

const CARD_ICONS: Record<string, React.ReactNode> = {
  "Credit Card": <CreditCard className="w-3 h-3" />,
  "Debit Card": <CreditCard className="w-3 h-3" />,
  "UPI": <Smartphone className="w-3 h-3" />,
  "Net Banking": <Building2 className="w-3 h-3" />,
  "Wallet": <Wallet className="w-3 h-3" />,
  "No Cost EMI": <Tag className="w-3 h-3" />,
};

type OfferWithPrice = BankOffer & { productPrice: number };

function formatDiscountLabel(offer: OfferWithPrice): string {
  if (offer.discountType === "flat") {
    return `₹${offer.discountValue.toLocaleString("en-IN")} off`;
  }
  return `${offer.discountValue}% off`;
}

function OfferCard({ offer }: { offer: OfferWithPrice }) {
  const bankColor = BANK_COLORS[offer.bankName] ?? "#71717a";
  const bankInitials = offer.bankName === "BHIM" ? "UPI" : offer.bankName.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-100 bg-white hover:border-zinc-200 hover:shadow-sm transition-all group">
      {/* Bank badge */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-[11px] shrink-0 mt-0.5"
        style={{ backgroundColor: bankColor }}
      >
        {bankInitials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-black text-zinc-900 text-sm leading-tight">
          {formatDiscountLabel(offer)}
        </p>
        <div className="flex items-center gap-1 mt-0.5 text-zinc-400 text-xs">
          {CARD_ICONS[offer.cardType]}
          <span>{offer.bankName} · {offer.cardType}</span>
        </div>
        {offer.minOrderAmount > 0 && (
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Min order ₹{offer.minOrderAmount.toLocaleString("en-IN")}
          </p>
        )}
        {offer.description && (
          <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">{offer.description}</p>
        )}
      </div>
    </div>
  );
}

const INITIAL_SHOW = 4;

export function BankOffersSection({ offers, productPrice }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!offers || offers.length === 0) return null;

  const offersWithPrice = offers.map((o) => ({ ...o, productPrice }));
  const bestOffer = offersWithPrice[0];
  const visibleOffers = expanded ? offersWithPrice : offersWithPrice.slice(0, INITIAL_SHOW);
  const hasMore = offers.length > INITIAL_SHOW;

  // Calculate best saving
  const bestSaving = bestOffer.discountType === "flat"
    ? bestOffer.discountValue
    : Math.min(
        Math.round((bestOffer.discountValue / 100) * productPrice),
        bestOffer.maxDiscount ?? Infinity
      );

  return (
    <div className="rounded-2xl border border-zinc-200 overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="w-6 h-6 bg-yellow-400 rounded-md flex items-center justify-center shrink-0">
          <Zap className="w-3.5 h-3.5 text-yellow-900 fill-yellow-900" />
        </div>
        <p className="text-sm font-black text-white">Apply offers for maximum savings</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Best deal highlight */}
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5">
          <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          <p className="text-xs font-bold text-green-700">
            Best deal: Save{" "}
            <span className="text-green-800">
              ₹{bestSaving.toLocaleString("en-IN")}
            </span>{" "}
            with {bestOffer.bankName} {bestOffer.cardType}
          </p>
        </div>

        {/* Offer cards */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Bank Offers</p>
            <p className="text-[10px] text-zinc-400">{offers.length} offer{offers.length > 1 ? "s" : ""} available</p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {visibleOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 mt-3 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  View {offers.length - INITIAL_SHOW} more offer{offers.length - INITIAL_SHOW > 1 ? "s" : ""}
                </>
              )}
            </button>
          )}
        </div>

        {/* Pine Labs note */}
        <p className="text-[10px] text-zinc-400 border-t border-zinc-100 pt-3">
          Offers applied automatically at checkout · Powered by Pine Labs
        </p>
      </div>
    </div>
  );
}
