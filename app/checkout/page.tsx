"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Truck, Lock, Check, MapPin,
  MessageCircle, ShieldCheck, Package, ChevronRight
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

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
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
    if (items.length === 0 && isAuthenticated) router.push("/cart");
  }, [items, isAuthenticated, router]);

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddress({ ...address, [field]: value });
  };

  const handlePlaceOrderViaWhatsApp = async () => {
    if (!address.name || !address.phone || !address.street || !address.city || !address.state || !address.zipCode) {
      toast({ title: "Missing Information", description: "Please fill in all address fields", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.productId, quantity: item.quantity, size: item.size, color: item.color,
      }));
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems, address,
          contactInfo: { name: address.name, email: userEmail, phone: address.phone },
        }),
      });
      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Failed to create order");
      }
      const orderData = await orderResponse.json();
      const createdOrder = orderData.order;
      // Only pass order number + items — no customer PII in the WhatsApp message
      const orderMessageData = {
        orderNumber: createdOrder.orderNumber,
        items: items.map((item) => ({ name: item.name, quantity: item.quantity, price: item.price })),
        total: totalPrice,
      };
      const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE;
      if (!adminPhone) {
        toast({ title: "Configuration Error", description: "WhatsApp number is not configured", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      clearCart();
      redirectToWhatsApp(adminPhone, orderMessageData);
      setTimeout(() => { router.push(`/order-confirmation/${createdOrder.id}`); }, 300);
    } catch (error: any) {
      setIsLoading(false);
      toast({ title: "Error", description: error.message || "Failed to place order", variant: "destructive" });
    }
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
            <p className="ck-header-sub">{items.length} {items.length === 1 ? "item" : "items"} · ₹{totalPrice.toLocaleString()}</p>
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

              <div className="ck-payment-option">
                <div className="ck-payment-icon">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="ck-payment-info">
                  <p className="ck-payment-title">Order via WhatsApp</p>
                  <p className="ck-payment-sub">Confirm & arrange payment directly with our team</p>
                </div>
                <div className="ck-payment-radio">
                  <div className="ck-payment-radio-dot" />
                </div>
              </div>
            </div>

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
              </div>

              <div className="ck-grand">
                <span className="ck-grand-label">Total</span>
                <span className="ck-grand-val">₹{totalPrice.toLocaleString()}</span>
              </div>

              {/* CTA */}
              <button
                onClick={handlePlaceOrderViaWhatsApp}
                disabled={isLoading || items.length === 0}
                className="ck-cta"
              >
                {isLoading ? (
                  <>
                    <div className="ck-cta-spinner" />
                    <span>Processing…</span>
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
                Your order is confirmed and payment is arranged directly with our team over WhatsApp.
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
          padding-top: 0;
        }

        /* ── Header ── */
        .ck-header {
          position: sticky;
          top: 0;
          z-index: 40;
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
        .ck-payment-option {
          margin: 14px 16px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1.5px solid #09090b;
          background: #fafafa;
        }
        @media (min-width: 640px) {
          .ck-payment-option { margin: 16px 24px 20px; }
        }
        .ck-payment-icon {
          width: 34px; height: 34px;
          border-radius: 10px;
          background: #25D366;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ck-payment-info { flex: 1; min-width: 0; }
        .ck-payment-title { font-size: 13px; font-weight: 700; color: #09090b; }
        .ck-payment-sub { font-size: 11px; color: #71717a; font-weight: 500; margin-top: 2px; line-height: 1.4; }
        .ck-payment-radio {
          width: 18px; height: 18px;
          border-radius: 50%;
          border: 2px solid #09090b;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ck-payment-radio-dot { width: 8px; height: 8px; border-radius: 50%; background: #09090b; }

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