export interface BankOfferLike {
  id: string;
  bankName: string;
  cardType: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  description?: string | null;
}

export function calculateBankOfferDiscount(offer: BankOfferLike, subtotal: number): number {
  if (subtotal < offer.minOrderAmount) return 0;

  const rawDiscount =
    offer.discountType === "percentage"
      ? (subtotal * offer.discountValue) / 100
      : offer.discountValue;

  const cappedDiscount =
    offer.discountType === "percentage" && offer.maxDiscount
      ? Math.min(rawDiscount, offer.maxDiscount)
      : rawDiscount;

  return Math.max(0, Math.min(subtotal, Math.round(cappedDiscount)));
}

export function formatBankOfferLabel(offer: BankOfferLike): string {
  const discount =
    offer.discountType === "percentage"
      ? `${offer.discountValue}% off${offer.maxDiscount ? ` up to Rs. ${offer.maxDiscount}` : ""}`
      : `Rs. ${offer.discountValue} off`;

  return `${discount} with ${offer.bankName} ${offer.cardType}`;
}
