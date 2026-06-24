"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Truck, Lock, Check, MapPin,
  MessageCircle, ShieldCheck, Package, ChevronRight, CreditCard, Tag,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { redirectToWhatsApp } from "@/lib/whatsapp-order";

interface Address {
  id?: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
}

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

const OFFER_BANK_COLORS: Record<string, string> = {
  "HDFC Bank": "#004C9A", "SBI": "#22409A", "ICICI Bank": "#F26522",
  "Axis Bank": "#800080", "Kotak Mahindra Bank": "#EE3124", "Yes Bank": "#00305B",
  "IndusInd Bank": "#E31837", "IDFC First Bank": "#005DA0", "Bank of Baroda": "#F26C00",
  "Punjab National Bank": "#1B4B9B", "BHIM": "#3C6EB4", "Other": "#71717a",
};

function calculateOfferDiscount(offer: BankOffer, subtotal: number) {
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

function formatOfferValue(offer: BankOffer) {
  if (offer.discountType === "flat") return `₹${offer.discountValue.toLocaleString("en-IN")} off`;
  return `${offer.discountValue}% off${offer.maxDiscount ? ` up to ₹${offer.maxDiscount.toLocaleString("en-IN")}` : ""}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"whatsapp" | "pinelabs">("pinelabs");
  const [offers, setOffers] = useState<BankOffer[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ id: string; code: string; discount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [address, setAddress] = useState<Address>({
    name: "", phone: "", street: "", city: "", state: "", zipCode: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) { router.push("/login?redirect=/checkout"); return; }
      setIsAuthenticated(true);
      setUserEmail(data.user.email || "");
      try {
        const response = await fetch("/api/addresses");
        if (response.ok) {
          const addresses = await response.json();
          setSavedAddresses(addresses);
          const defaultAddr = addresses.find((a: Address) => a.isDefault);
          if (defaultAddr) { setSelectedAddressId(defaultAddr.id); setAddress(defaultAddr); }
        }
      } catch (err) { console.error("Failed to fetch addresses:", err); }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch("/api/offers", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data)) setOffers(data);
      } catch (err) {
        console.error("Failed to fetch bank offers:", err);
      }
    };
    fetchOffers();
  }, []);

  useEffect(() => {
    if (items.length === 0 && isAuthenticated) router.push("/cart");
  }, [items, isAuthenticated, router]);

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddress({ ...address, [field]: value });
  };

  const eligibleOffers = offers
    .map((offer) => ({
      ...offer,
      discountAmount: calculateOfferDiscount(offer, totalPrice),
    }))
    .filter((offer) => offer.discountAmount > 0)
    .sort((a, b) => b.discountAmount - a.discountAmount);

  const selectedOffer =
    eligibleOffers.find((offer) => offer.id === selectedOfferId) ?? null;
  const bankDiscount =
    paymentMethod === "pinelabs" && selectedOffer ? selectedOffer.discountAmount : 0;
  const couponDiscount = couponApplied ? couponApplied.discount : 0;
  const discountAmount = bankDiscount + couponDiscount;
  const payableTotal = Math.max(0, totalPrice - discountAmount);

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCouponError("");
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal: totalPrice }),
      });
      const data = await res.json();
      if (!res.ok) { setCouponError(data.error || "Invalid coupon."); }
      else {
        setCouponApplied({ id: data.id, code: data.code, discount: data.discount });
        setCouponInput("");
        toast({ title: "Coupon applied!", description: `You save ₹${data.discount.toLocaleString("en-IN")} with ${data.code}` });
      }
    } catch {
      setCouponError("Failed to apply coupon. Try again.");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setCouponApplied(null);
    setCouponError("");
    setCouponInput("");
  }

  async function createOrder() {
    const orderItems = items.map((item) => ({
      productId: item.productId, quantity: item.quantity, size: item.size, color: item.color,
    }));
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: orderItems, address,
        contactInfo: { name: address.name, email: userEmail, phone: address.phone },
        paymentMethod,
        bankOfferId: paymentMethod === "pinelabs" ? selectedOffer?.id ?? null : null,
        couponCode: couponApplied ? couponApplied.code : null,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create order");
    }
    const data = await res.json();
    return data.order;
  }

  function validateAddress() {
    const { name, phone, street, city, state, zipCode } = address;
    if (!name || !phone || !street || !city || !state || !zipCode) {
      toast({ title: "Missing Information", description: "Please fill in all address fields", variant: "destructive" });
      return false;
    }
    return true;
  }

  const handlePlaceOrderViaWhatsApp = async () => {
    if (!validateAddress()) return;
    setIsLoading(true);
    try {
      const createdOrder = await createOrder();
      const orderMessageData = {
        orderNumber: createdOrder.orderNumber,
        items: items.map((item) => ({ name: item.name, quantity: item.quantity, price: item.price })),
        total: createdOrder.total ?? payableTotal,
      };
      const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE;
      if (!adminPhone) {
        toast({ title: "Configuration Error", description: "WhatsApp number not configured", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      clearCart();
      redirectToWhatsApp(adminPhone, orderMessageData);
      setTimeout(() => { router.push(`/order-confirmation/${createdOrder.id}`); }, 300);
    } catch (error: unknown) {
      setIsLoading(false);
      const message = error instanceof Error ? error.message : "Failed to place order";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handlePayOnline = async () => {
    if (!validateAddress()) return;
    setIsLoading(true);
    try {
      const createdOrder = await createOrder();
      const payRes = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: createdOrder.id }),
      });
      if (!payRes.ok) {
        const err = await payRes.json();
        throw new Error(err.error || "Payment initiation failed");
      }
      const { checkoutUrl } = await payRes.json();
      window.location.href = checkoutUrl; // redirect to Pine Labs checkout
    } catch (error: unknown) {
      setIsLoading(false);
      const msg = error instanceof Error ? error.message : "Could not start payment";
      const isStockError = msg.toLowerCase().includes("stock");
      toast({
        title: isStockError ? "Out of Stock" : "Payment Error",
        description: msg,
        variant: "destructive",
      });
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === "pinelabs") return handlePayOnline();
    return handlePlaceOrderViaWhatsApp();
  };

  if (!isAuthenticated) {
    return (
      <div className="ck-loading">
        <div className="ck-spinner" />
        <p className="ck-loading-text">Preparing checkout…</p>
        <style>{`
          .ck-loading {
            min-height: 100vh; background: #fafafa;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center; gap: 16px;
          }
          .ck-spinner {
            width: 36px; height: 36px; border-radius: 50%;
            border: 2.5px solid #e4e4e7;
            border-top-color: #09090b;
            animation: ck-spin 0.7s linear infinite;
          }
          @keyframes ck-spin { to { transform: rotate(360deg); } }
          .ck-loading-text { font-size: 13px; color: #a1a1aa; font-weight: 500; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="ck-root">

      {/* ── Sticky header ── */}
      <header className="ck-header">
        <div className="ck-header-inner">
          <Link href="/cart" className="ck-back">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="ck-header-title">Checkout</h1>
            <p className="ck-header-sub">{items.length} {items.length === 1 ? "item" : "items"} · ₹{payableTotal.toLocaleString()}</p>
          </div>
          <div className="ck-header-secure">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure</span>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="ck-body">
        <div className="ck-grid">

          {/* ── Left: forms ── */}
          <div className="ck-left">

            {/* Saved addresses */}
            {savedAddresses.length > 0 && !showManualEntry && (
              <div className="ck-card">
                <div className="ck-card-header">
                  <div className="ck-card-icon-wrap">
                    <MapPin className="ck-card-icon" />
                  </div>
                  <div>
                    <h2 className="ck-card-title">Saved Addresses</h2>
                    <p className="ck-card-sub">Choose a delivery address</p>
                  </div>
                </div>

                <div className="ck-addr-list">
                  {savedAddresses.map((savedAddr) => (
                    <button
                      key={savedAddr.id}
                      onClick={() => { setSelectedAddressId(savedAddr.id || null); setAddress(savedAddr); }}
                      className={cn("ck-addr-btn", selectedAddressId === savedAddr.id && "ck-addr-btn-active")}
                    >
                      <div className="ck-addr-radio">
                        {selectedAddressId === savedAddr.id && <div className="ck-addr-radio-dot" />}
                      </div>
                      <div className="ck-addr-info">
                        <div className="ck-addr-name-row">
                          <span className="ck-addr-name">{savedAddr.name}</span>
                          {savedAddr.isDefault && <span className="ck-default-tag">Default</span>}
                        </div>
                        <p className="ck-addr-line">{savedAddr.street}</p>
                        <p className="ck-addr-line">{savedAddr.city}, {savedAddr.state} {savedAddr.zipCode}</p>
                        <p className="ck-addr-line ck-addr-phone">{savedAddr.phone}</p>
                      </div>
                      {selectedAddressId === savedAddr.id && (
                        <Check className="ck-addr-check" />
                      )}
                    </button>
                  ))}
                </div>

                <button onClick={() => setShowManualEntry(true)} className="ck-alt-btn">
                  <span>Use a different address</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Manual address entry */}
            {(showManualEntry || savedAddresses.length === 0) && (
              <div className="ck-card">
                <div className="ck-card-header">
                  <div className="ck-card-icon-wrap">
                    <Truck className="ck-card-icon" />
                  </div>
                  <div>
                    <h2 className="ck-card-title">Delivery Address</h2>
                    <p className="ck-card-sub">Where should we deliver?</p>
                  </div>
                </div>

                {savedAddresses.length > 0 && showManualEntry && (
                  <button onClick={() => setShowManualEntry(false)} className="ck-alt-btn ck-alt-btn-top">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to saved addresses</span>
                  </button>
                )}

                <div className="ck-form-grid">
                  {[
                    { field: "name", label: "Full Name", placeholder: "Enter your full name", span: 1 },
                    { field: "phone", label: "Phone Number", placeholder: "+91 00000 00000", span: 1 },
                    { field: "street", label: "Street Address", placeholder: "House no., street, area", span: 2 },
                    { field: "city", label: "City", placeholder: "City", span: 1 },
                    { field: "state", label: "State", placeholder: "State", span: 1 },
                    { field: "zipCode", label: "PIN Code", placeholder: "6-digit PIN", span: 1 },
                  ].map(({ field, label, placeholder, span }) => (
                    <div key={field} className={span === 2 ? "ck-field ck-field-full" : "ck-field"}>
                      <label className="ck-label">{label}</label>
                      <input
                        placeholder={placeholder}
                        value={address[field as keyof Address] as string}
                        onChange={(e) => handleAddressChange(field as keyof Address, e.target.value)}
                        className="ck-input"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment method */}
            <div className="ck-card">
              <div className="ck-card-header">
                <div className="ck-card-icon-wrap">
                  <Lock className="ck-card-icon" />
                </div>
                <div>
                  <h2 className="ck-card-title">Payment Method</h2>
                  <p className="ck-card-sub">How would you like to pay?</p>
                </div>
              </div>

              <div className="ck-payment-list">
                {/* Pay Online — Pine Labs */}
                <button
                  onClick={() => setPaymentMethod("pinelabs")}
                  className={cn("ck-payment-option", paymentMethod === "pinelabs" && "ck-payment-option-active")}
                >
                  <div className="ck-payment-icon ck-payment-icon-pl">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div className="ck-payment-info">
                    <p className="ck-payment-title">Pay Online</p>
                    <p className="ck-payment-sub">Cards · UPI · Net Banking · EMI via Pine Labs</p>
                  </div>
                  <div className={cn("ck-payment-radio", paymentMethod === "pinelabs" && "ck-payment-radio-active")}>
                    {paymentMethod === "pinelabs" && <div className="ck-payment-radio-dot" />}
                  </div>
                </button>

                {/* WhatsApp COD */}
                <button
                  onClick={() => setPaymentMethod("whatsapp")}
                  className={cn("ck-payment-option", paymentMethod === "whatsapp" && "ck-payment-option-active")}
                >
                  <div className="ck-payment-icon ck-payment-icon-wa">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="ck-payment-info">
                    <p className="ck-payment-title">Order via WhatsApp</p>
                    <p className="ck-payment-sub">Confirm &amp; arrange payment with our team</p>
                  </div>
                  <div className={cn("ck-payment-radio", paymentMethod === "whatsapp" && "ck-payment-radio-active")}>
                    {paymentMethod === "whatsapp" && <div className="ck-payment-radio-dot" />}
                  </div>
                </button>
              </div>
            </div>

            {paymentMethod === "pinelabs" && eligibleOffers.length > 0 && (
              <div className="ck-card">
                {/* Header */}
                <div className="ck-offer-header">
                  <div className="ck-offer-header-left">
                    <div className="ck-offer-header-icon">
                      <Tag className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <div>
                      <p className="ck-offer-header-label">Bank Offers</p>
                      <p className="ck-offer-header-sub">Select one offer to apply at checkout</p>
                    </div>
                  </div>
                  <span className="ck-offer-count">{eligibleOffers.length} available</span>
                </div>

                <div className="ck-offer-list">
                  {/* No offer row */}
                  <button
                    type="button"
                    onClick={() => setSelectedOfferId(null)}
                    className={cn("ck-offer-btn", !selectedOfferId && "ck-offer-btn-active")}
                  >
                    <div className={cn("ck-offer-radio", !selectedOfferId && "ck-offer-radio-active")}>
                      {!selectedOfferId && <div className="ck-offer-radio-dot" />}
                    </div>
                    <div className="ck-offer-badge ck-offer-badge-none">—</div>
                    <div className="ck-offer-copy">
                      <p className="ck-offer-title">No bank offer</p>
                      <p className="ck-offer-sub">Pay the standard online amount</p>
                    </div>
                  </button>

                  {eligibleOffers.map((offer) => {
                    const isActive = selectedOfferId === offer.id;
                    const color = OFFER_BANK_COLORS[offer.bankName] ?? "#71717a";
                    const initials = offer.bankName === "BHIM" ? "UPI"
                      : offer.bankName.replace(" Bank","").split(" ").length > 1
                        ? (offer.bankName.replace(" Bank","").split(" ")[0][0] + offer.bankName.replace(" Bank","").split(" ")[1][0]).toUpperCase()
                        : offer.bankName.slice(0,2).toUpperCase();
                    return (
                      <button
                        type="button"
                        key={offer.id}
                        onClick={() => setSelectedOfferId(offer.id)}
                        className={cn("ck-offer-btn", isActive && "ck-offer-btn-active")}
                      >
                        <div className={cn("ck-offer-radio", isActive && "ck-offer-radio-active")}>
                          {isActive && <div className="ck-offer-radio-dot" />}
                        </div>
                        <div
                          className="ck-offer-badge"
                          style={{ backgroundColor: color }}
                        >
                          {initials}
                        </div>
                        <div className="ck-offer-copy">
                          <div className="ck-offer-title-row">
                            <p className="ck-offer-title">{formatOfferValue(offer)}</p>
                            <span className="ck-offer-save">Save ₹{offer.discountAmount.toLocaleString("en-IN")}</span>
                          </div>
                          <p className="ck-offer-sub">
                            {offer.bankName} · {offer.cardType}
                            {offer.minOrderAmount > 0 ? ` · Min ₹${offer.minOrderAmount.toLocaleString("en-IN")}` : ""}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* ── Right: order summary ── */}
          <div className="ck-right">
            <div className="ck-summary">

              {/* Header */}
              <div className="ck-summary-header">
                <Package className="w-4 h-4 text-zinc-400" />
                <h2 className="ck-summary-title">Order Summary</h2>
                <span className="ck-summary-count">{items.length}</span>
              </div>

              {/* Items */}
              <div className="ck-items">
                {items.map((item) => (
                  <div key={item.id} className="ck-item">
                    <div className="ck-item-img">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                      <span className="ck-item-qty">{item.quantity}</span>
                    </div>
                    <div className="ck-item-info">
                      <p className="ck-item-name">{item.name}</p>
                      <div className="ck-item-meta">
                        {item.size && <span className="ck-item-tag">{item.size}</span>}
                        {item.color && <span className="ck-item-tag">{item.color}</span>}
                      </div>
                    </div>
                    <p className="ck-item-price">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Coupon input */}
              <div className="mb-3">
                {couponApplied ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-sm font-black text-emerald-700 tracking-wider">{couponApplied.code}</span>
                      <span className="text-xs font-bold text-emerald-600">-₹{couponApplied.discount.toLocaleString("en-IN")}</span>
                    </div>
                    <button onClick={removeCoupon} className="text-emerald-400 hover:text-red-400 transition-colors text-xs font-black">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                      placeholder="Enter coupon code"
                      className="flex-1 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm font-bold tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder:normal-case placeholder:font-normal"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-4 py-2.5 bg-brand text-white rounded-xl text-sm font-black hover:bg-brand/90 disabled:opacity-40 transition-colors whitespace-nowrap"
                    >
                      {couponLoading ? "…" : "Apply"}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-xs text-red-500 font-bold mt-1.5">{couponError}</p>}
              </div>

              {/* Totals */}
              <div className="ck-totals">
                <div className="ck-total-row">
                  <span className="ck-total-label">Subtotal</span>
                  <span className="ck-total-val">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="ck-total-row">
                  <span className="ck-total-label">Shipping</span>
                  <span className="ck-total-free">FREE</span>
                </div>
                <div className="ck-total-row">
                  <span className="ck-total-label">Tax</span>
                  <span className="ck-total-val">₹0</span>
                </div>
                {bankDiscount > 0 && (
                  <div className="ck-total-row">
                    <span className="ck-total-label">Bank Offer</span>
                    <span className="ck-total-discount">-₹{bankDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="ck-total-row">
                    <span className="ck-total-label">Coupon ({couponApplied?.code})</span>
                    <span className="ck-total-discount">-₹{couponDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>

              <div className="ck-grand">
                <span className="ck-grand-label">Total</span>
                <span className="ck-grand-val">₹{payableTotal.toLocaleString()}</span>
              </div>

              {/* CTA */}
              <button
                onClick={handlePlaceOrder}
                disabled={isLoading || items.length === 0}
                className="ck-cta"
              >
                {isLoading ? (
                  <>
                    <div className="ck-cta-spinner" />
                    <span>{paymentMethod === "pinelabs" ? "Redirecting to Payment…" : "Processing…"}</span>
                  </>
                ) : paymentMethod === "pinelabs" ? (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₹{payableTotal.toLocaleString()} Online</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    <span>Place Order via WhatsApp</span>
                  </>
                )}
              </button>

              <p className="ck-note">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                {paymentMethod === "pinelabs"
                  ? "Secured by Pine Labs. You'll be redirected to complete payment."
                  : "Payment arranged directly with our team over WhatsApp."}
              </p>

            </div>
          </div>

        </div>
      </div>

      <style>{`
        /* ── Root ── */
        .ck-root {
          min-height: 100vh;
          background: #f8f8f8;
          padding-top: 32px;
        }
        @media (min-width: 768px) {
          .ck-root { padding-top: 0; }
        }

        /* ── Header ── */
        .ck-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid #f0f0f0;
        }
        .ck-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        @media (min-width: 640px) {
          .ck-header-inner { padding: 16px 24px; }
        }
        .ck-back {
          width: 36px; height: 36px;
          border-radius: 10px;
          border: 1px solid #e4e4e7;
          background: #fafafa;
          display: flex; align-items: center; justify-content: center;
          color: #52525b;
          transition: all 0.16s ease;
          flex-shrink: 0;
          text-decoration: none;
        }
        .ck-back:hover { background: #f4f4f5; color: #09090b; }
        .ck-header-title {
          font-size: 16px;
          font-weight: 800;
          color: #09090b;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .ck-header-sub {
          font-size: 11px;
          color: #a1a1aa;
          font-weight: 500;
          margin-top: 1px;
        }
        .ck-header-secure {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: #10b981;
        }

        /* ── Body ── */
        .ck-body {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 16px 80px;
        }
        @media (min-width: 640px) {
          .ck-body { padding: 28px 24px 80px; }
        }
        @media (min-width: 1024px) {
          .ck-body { padding: 32px 32px 80px; }
        }

        /* ── Grid ── */
        .ck-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 1024px) {
          .ck-grid {
            grid-template-columns: 1fr 380px;
            gap: 24px;
            align-items: start;
          }
        }

        /* ── Left ── */
        .ck-left { display: flex; flex-direction: column; gap: 14px; }

        /* ── Card ── */
        .ck-card {
          background: #ffffff;
          border: 1px solid #efefef;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .ck-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 20px;
          border-bottom: 1px solid #f5f5f5;
          background: #fafafa;
        }
        @media (min-width: 640px) {
          .ck-card-header { padding: 18px 24px; }
        }
        .ck-card-icon-wrap {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: #f4f4f5;
          border: 1px solid #e4e4e7;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ck-card-icon { width: 14px; height: 14px; color: #52525b; }
        .ck-card-title {
          font-size: 13px;
          font-weight: 800;
          color: #09090b;
          letter-spacing: -0.01em;
        }
        .ck-card-sub {
          font-size: 11px;
          color: #a1a1aa;
          font-weight: 500;
          margin-top: 1px;
        }

        /* ── Address list ── */
        .ck-addr-list {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        @media (min-width: 640px) {
          .ck-addr-list { padding: 16px 20px; }
        }
        .ck-addr-btn {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1.5px solid #f0f0f0;
          background: #fafafa;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          text-align: left;
          transition: all 0.16s ease;
          cursor: pointer;
        }
        .ck-addr-btn:hover { border-color: #e4e4e7; background: #f4f4f5; }
        .ck-addr-btn-active { border-color: #09090b !important; background: #ffffff !important; }
        .ck-addr-radio {
          width: 18px; height: 18px;
          border-radius: 50%;
          border: 2px solid #d4d4d8;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
          transition: border-color 0.16s ease;
        }
        .ck-addr-btn-active .ck-addr-radio { border-color: #09090b; }
        .ck-addr-radio-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #09090b;
        }
        .ck-addr-info { flex: 1; min-width: 0; }
        .ck-addr-name-row {
          display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
        }
        .ck-addr-name {
          font-size: 13px; font-weight: 700; color: #09090b;
        }
        .ck-default-tag {
          font-size: 9px; font-weight: 800;
          background: #fef3c7; color: #d97706;
          border: 1px solid #fde68a;
          border-radius: 4px; padding: 1px 6px;
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .ck-addr-line {
          font-size: 11px; color: #71717a; font-weight: 500; line-height: 1.5;
        }
        .ck-addr-phone { color: #52525b; margin-top: 4px; }
        .ck-addr-check { width: 16px; height: 16px; color: #09090b; flex-shrink: 0; }

        /* Alt button */
        .ck-alt-btn {
          margin: 0 16px 14px;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px;
          border-radius: 10px;
          border: 1px dashed #e4e4e7;
          background: transparent;
          font-size: 11px; font-weight: 700;
          color: #71717a;
          cursor: pointer;
          transition: all 0.16s ease;
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .ck-alt-btn:hover { border-color: #a1a1aa; color: #3f3f46; background: #fafafa; }
        .ck-alt-btn-top { margin-bottom: 0; margin-top: 0; border-radius: 0; border: none; border-bottom: 1px solid #f5f5f5; padding: 12px 20px; justify-content: flex-start; }

        /* ── Form ── */
        .ck-form-grid {
          padding: 18px 16px 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (min-width: 640px) {
          .ck-form-grid { padding: 20px 24px 24px; gap: 14px; }
        }
        .ck-field { display: flex; flex-direction: column; gap: 5px; }
        .ck-field-full { grid-column: 1 / -1; }
        .ck-label {
          font-size: 10px;
          font-weight: 700;
          color: #a1a1aa;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .ck-input {
          height: 42px;
          border-radius: 10px;
          background: #fafafa;
          border: 1.5px solid #f0f0f0;
          padding: 0 14px;
          font-size: 13px;
          font-weight: 500;
          color: #09090b;
          outline: none;
          transition: all 0.16s ease;
          width: 100%;
        }
        .ck-input::placeholder { color: #d4d4d8; }
        .ck-input:focus { border-color: #a1a1aa; background: #ffffff; }

        /* ── Payment ── */
        .ck-payment-list {
          padding: 14px 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        @media (min-width: 640px) {
          .ck-payment-list { padding: 16px 24px 20px; }
        }
        .ck-payment-option {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1.5px solid #f0f0f0;
          background: #fafafa;
          text-align: left;
          cursor: pointer;
          transition: all 0.16s ease;
        }
        .ck-payment-option:hover { border-color: #e4e4e7; }
        .ck-payment-option-active { border-color: #09090b !important; background: #ffffff !important; }
        .ck-payment-icon {
          width: 34px; height: 34px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ck-payment-icon-pl { background: #dc2626; }
        .ck-payment-icon-wa { background: #25D366; }
        .ck-payment-info { flex: 1; min-width: 0; }
        .ck-payment-title { font-size: 13px; font-weight: 700; color: #09090b; }
        .ck-payment-sub { font-size: 11px; color: #71717a; font-weight: 500; margin-top: 2px; line-height: 1.4; }
        .ck-payment-radio {
          width: 18px; height: 18px;
          border-radius: 50%;
          border: 2px solid #d4d4d8;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: border-color 0.16s ease;
        }
        .ck-payment-radio-active { border-color: #09090b; }
        .ck-payment-radio-dot { width: 8px; height: 8px; border-radius: 50%; background: #09090b; }

        /* ── Offers ── */
        /* ── Bank Offer header ── */
        .ck-offer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px 12px; border-bottom: 1px solid #f4f4f5;
        }
        @media (min-width: 640px) { .ck-offer-header { padding: 16px 20px 14px; } }
        .ck-offer-header-left { display: flex; align-items: center; gap: 10px; }
        .ck-offer-header-icon {
          width: 30px; height: 30px; border-radius: 10px;
          background: #fff0f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .ck-offer-header-label { font-size: 13px; font-weight: 900; color: #09090b; line-height: 1.2; }
        .ck-offer-header-sub { font-size: 11px; color: #a1a1aa; font-weight: 500; margin-top: 1px; }
        .ck-offer-count {
          font-size: 10px; font-weight: 700; color: #71717a;
          background: #f4f4f5; border: 1px solid #e4e4e7;
          border-radius: 999px; padding: 3px 9px; white-space: nowrap;
        }

        /* ── Offer list ── */
        .ck-offer-list {
          padding: 10px 12px 14px;
          display: flex; flex-direction: column; gap: 6px;
        }
        @media (min-width: 640px) { .ck-offer-list { padding: 12px 16px 16px; } }

        .ck-offer-btn {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 11px 13px; border-radius: 12px;
          border: 1.5px solid #f0f0f0; background: #fafafa;
          text-align: left; cursor: pointer;
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
        }
        .ck-offer-btn:hover { border-color: #e4e4e7; background: #f9f9f9; }
        .ck-offer-btn-active {
          border-color: #dc2626 !important; background: #fff8f8 !important;
          box-shadow: 0 0 0 3px rgba(220,38,38,0.07);
        }

        /* Radio */
        .ck-offer-radio {
          width: 17px; height: 17px; border-radius: 50%;
          border: 2px solid #d4d4d8;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: border-color 0.15s;
        }
        .ck-offer-radio-active { border-color: #dc2626 !important; }
        .ck-offer-radio-dot { width: 7px; height: 7px; border-radius: 50%; background: #dc2626; }

        /* Bank badge */
        .ck-offer-badge {
          width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 900; color: #fff; letter-spacing: 0.03em;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        .ck-offer-badge-none {
          background: #f4f4f5 !important; color: #a1a1aa;
          font-size: 13px; font-weight: 700; box-shadow: none;
        }

        /* Copy */
        .ck-offer-copy { flex: 1; min-width: 0; }
        .ck-offer-title-row {
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
        }
        .ck-offer-title { font-size: 13px; font-weight: 800; color: #09090b; line-height: 1.25; }
        .ck-offer-sub { font-size: 11px; color: #a1a1aa; font-weight: 500; margin-top: 2px; line-height: 1.3; }
        .ck-offer-save {
          font-size: 10px; font-weight: 900; white-space: nowrap;
          color: #15803d; background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 999px; padding: 2px 8px;
        }

        /* ── Summary ── */
        .ck-right {}
        @media (min-width: 1024px) {
          .ck-right { position: sticky; top: 80px; }
        }
        .ck-summary {
          background: #ffffff;
          border: 1px solid #efefef;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .ck-summary-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          border-bottom: 1px solid #f5f5f5;
          background: #fafafa;
        }
        .ck-summary-title {
          flex: 1;
          font-size: 13px; font-weight: 800; color: #09090b; letter-spacing: -0.01em;
        }
        .ck-summary-count {
          font-size: 10px; font-weight: 700;
          background: #f4f4f5; color: #71717a;
          border-radius: 6px; padding: 2px 7px;
        }

        /* Items */
        .ck-items {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 280px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #e4e4e7 transparent;
        }
        @media (min-width: 640px) {
          .ck-items { padding: 16px 20px; }
        }
        .ck-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ck-item-img {
          position: relative;
          width: 52px; height: 64px;
          border-radius: 10px;
          overflow: hidden;
          background: #f4f4f5;
          flex-shrink: 0;
          border: 1px solid #f0f0f0;
        }
        .ck-item-qty {
          position: absolute;
          top: -5px; right: -5px;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #09090b;
          color: white;
          font-size: 9px;
          font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid white;
        }
        .ck-item-info { flex: 1; min-width: 0; }
        .ck-item-name {
          font-size: 12px; font-weight: 700; color: #09090b;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          line-height: 1.3;
        }
        .ck-item-meta { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px; }
        .ck-item-tag {
          font-size: 9px; font-weight: 700;
          background: #f4f4f5; color: #71717a;
          border-radius: 4px; padding: 2px 6px;
          text-transform: uppercase;
        }
        .ck-item-price {
          font-size: 13px; font-weight: 800; color: #09090b;
          flex-shrink: 0; letter-spacing: -0.02em;
        }

        /* Totals */
        .ck-totals {
          padding: 14px 20px;
          border-top: 1px solid #f5f5f5;
          display: flex; flex-direction: column; gap: 8px;
        }
        .ck-total-row {
          display: flex; align-items: center; justify-content: space-between;
        }
        .ck-total-label { font-size: 12px; color: #a1a1aa; font-weight: 500; }
        .ck-total-val { font-size: 12px; font-weight: 700; color: #3f3f46; }
        .ck-total-discount { font-size: 12px; font-weight: 800; color: #059669; }
        .ck-total-free {
          font-size: 11px; font-weight: 800;
          color: #10b981; background: #f0fdf4;
          border-radius: 4px; padding: 1px 7px;
          letter-spacing: 0.04em;
        }
        .ck-grand {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px;
          border-top: 1px solid #f0f0f0;
          background: #fafafa;
        }
        .ck-grand-label {
          font-size: 11px; font-weight: 800;
          color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.1em;
        }
        .ck-grand-val {
          font-size: 22px; font-weight: 900; color: #09090b; letter-spacing: -0.04em;
        }

        /* CTA */
        .ck-cta {
          margin: 0 16px 14px;
          width: calc(100% - 32px);
          height: 48px;
          border-radius: 12px;
          background: #dc2626;
          color: white;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.02em;
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          gap: 8px;
          transition: all 0.18s ease;
          box-shadow: 0 4px 14px rgba(220,38,38,0.28);
        }
        .ck-cta:hover:not(:disabled) { background: #b91c1c; box-shadow: 0 6px 20px rgba(220,38,38,0.35); }
        .ck-cta:active:not(:disabled) { transform: scale(0.98); }
        .ck-cta:disabled { background: #d4d4d8; box-shadow: none; cursor: not-allowed; }
        .ck-cta-spinner {
          width: 16px; height: 16px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          animation: ck-spin 0.7s linear infinite;
        }
        @keyframes ck-spin { to { transform: rotate(360deg); } }

        /* Note */
        .ck-note {
          display: flex; align-items: flex-start; gap: 6px;
          margin: 0 16px 18px;
          font-size: 11px; color: #a1a1aa; font-weight: 500;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
