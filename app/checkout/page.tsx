"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Truck, Lock, Check, MapPin, MessageCircle } from "lucide-react";
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
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // Check authentication and fetch addresses on mount
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.push("/login?redirect=/checkout");
        return;
      }

      setIsAuthenticated(true);
      setUserEmail(data.user.email || "");

      // Fetch saved addresses
      try {
        const response = await fetch("/api/addresses");
        if (response.ok) {
          const addresses = await response.json();
          setSavedAddresses(addresses);
          
          // Auto-select default address if available
          const defaultAddr = addresses.find((a: Address) => a.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setAddress(defaultAddr);
          }
        }
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
      }
    };

    checkAuth();
  }, [router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && isAuthenticated) {
      router.push("/cart");
    }
  }, [items, isAuthenticated, router]);

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddress({ ...address, [field]: value });
  };

  const handlePlaceOrderViaWhatsApp = async () => {
    // Validation
    if (
      !address.name ||
      !address.phone ||
      !address.street ||
      !address.city ||
      !address.state ||
      !address.zipCode
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all address fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create order in backend (silently)
      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          address,
          contactInfo: {
            name: address.name,
            email: userEmail,
            phone: address.phone,
          },
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const orderData = await orderResponse.json();
      const createdOrder = orderData.order;

      // Step 2: Format order details for WhatsApp
      const orderDetails = {
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: totalPrice,
        tax: 0,
        shipping: 0,
        total: totalPrice,
        customerName: address.name,
        customerEmail: userEmail,
        customerPhone: address.phone,
        deliveryAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
        },
      };

      // Get admin WhatsApp number from environment
      const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE;

      if (!adminPhone) {
        toast({
          title: "Configuration Error",
          description: "WhatsApp number is not configured",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Step 3: Clear cart
      clearCart();

      // Step 4: Redirect to WhatsApp immediately (no delays)
      redirectToWhatsApp(adminPhone, orderDetails);

      // Step 5: Navigate to order confirmation
      // Short delay to ensure WhatsApp redirect occurs first
      setTimeout(() => {
        router.push(`/order-confirmation/${createdOrder.id}`);
      }, 300);
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-950 mx-auto"></div>
          <p className="mt-4 text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-8 md:pt-0">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-zinc-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight text-zinc-950">
              Checkout
            </h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">
              Complete Your Order
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Saved Addresses */}
            {savedAddresses.length > 0 && !showManualEntry && (
              <Card className="p-6 border-zinc-100 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-5 h-5 text-zinc-950" />
                  <h2 className="text-lg font-black uppercase tracking-tight">
                    Saved Addresses
                  </h2>
                </div>

                <div className="space-y-3 mb-6">
                  {savedAddresses.map((savedAddr) => (
                    <button
                      key={savedAddr.id}
                      onClick={() => {
                        setSelectedAddressId(savedAddr.id || null);
                        setAddress(savedAddr);
                      }}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all",
                        selectedAddressId === savedAddr.id
                          ? "border-zinc-950 bg-zinc-50"
                          : "border-zinc-100 hover:border-zinc-200"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-zinc-950">
                            {savedAddr.name}
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            {savedAddr.street}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {savedAddr.city}, {savedAddr.state} {savedAddr.zipCode}
                          </p>
                          <p className="text-xs text-zinc-500 mt-2">
                            {savedAddr.phone}
                          </p>
                        </div>
                        {selectedAddressId === savedAddr.id && (
                          <Check className="w-5 h-5 text-zinc-950 shrink-0 ml-3" />
                        )}
                      </div>
                      {savedAddr.isDefault && (
                        <p className="text-xs font-bold text-brand mt-2">
                          DEFAULT ADDRESS
                        </p>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowManualEntry(!showManualEntry)}
                  className="w-full py-2 text-xs font-bold text-zinc-600 uppercase tracking-widest border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all"
                >
                  {showManualEntry ? "Use Saved Address" : "Enter Different Address"}
                </button>
              </Card>
            )}

            {/* Delivery Address - Manual Entry */}
            {(showManualEntry || savedAddresses.length === 0) && (
              <Card className="p-6 border-zinc-100 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="w-5 h-5 text-zinc-950" />
                  <h2 className="text-lg font-black uppercase tracking-tight">
                    Delivery Address
                  </h2>
                </div>

                {savedAddresses.length > 0 && showManualEntry && (
                  <button
                    onClick={() => setShowManualEntry(false)}
                    className="w-full py-2 mb-6 text-xs font-bold text-zinc-600 uppercase tracking-widest border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all"
                  >
                    Back to Saved Addresses
                  </button>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block mb-1.5">
                    Full Name
                  </label>
                  <input
                    placeholder="Enter your full name"
                    value={address.name}
                    onChange={(e) =>
                      handleAddressChange("name", e.target.value)
                    }
                    className="h-11 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:bg-white px-4 text-sm w-full focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block mb-1.5">
                    Phone Number
                  </label>
                  <input
                    placeholder="Enter your phone number"
                    value={address.phone}
                    onChange={(e) =>
                      handleAddressChange("phone", e.target.value)
                    }
                    className="h-11 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:bg-white px-4 text-sm w-full focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block mb-1.5">
                    Street Address
                  </label>
                  <input
                    placeholder="Enter your street address"
                    value={address.street}
                    onChange={(e) =>
                      handleAddressChange("street", e.target.value)
                    }
                    className="h-11 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:bg-white px-4 text-sm w-full focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block mb-1.5">
                    City
                  </label>
                  <input
                    placeholder="Enter your city"
                    value={address.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                    className="h-11 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:bg-white px-4 text-sm w-full focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block mb-1.5">
                    State
                  </label>
                  <input
                    placeholder="Enter your state"
                    value={address.state}
                    onChange={(e) =>
                      handleAddressChange("state", e.target.value)
                    }
                    className="h-11 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:bg-white px-4 text-sm w-full focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block mb-1.5">
                    ZIP Code
                  </label>
                  <input
                    placeholder="Enter your ZIP code"
                    value={address.zipCode}
                    onChange={(e) =>
                      handleAddressChange("zipCode", e.target.value)
                    }
                    className="h-11 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:bg-white px-4 text-sm w-full focus:outline-none"
                  />
                </div>
              </div>
            </Card>
            )}

            {/* Payment Method */}
            <Card className="p-5 md:p-6 border border-zinc-100 rounded-2xl">
              <div className="flex items-center gap-3 mb-5">
                <Lock className="w-4 h-4 text-zinc-500" />
                <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#25D366' }}>
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-zinc-900">
                      Order via WhatsApp
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Direct communication with our team for payment confirmation
                    </p>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-zinc-900 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 border-zinc-100 rounded-2xl sticky top-24 space-y-6">
              <h2 className="text-lg font-black uppercase tracking-tight">
                Order Summary
              </h2>

              {/* Items List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-950 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Qty: {item.quantity}
                      </p>
                      {item.size && (
                        <p className="text-xs text-zinc-500">
                          Size: {item.size}
                        </p>
                      )}
                      {item.color && (
                        <p className="text-xs text-zinc-500">
                          Color: {item.color}
                        </p>
                      )}
                      <p className="text-sm font-bold text-zinc-950 mt-2">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-100 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600">Subtotal</span>
                  <span className="font-bold">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600">Shipping</span>
                  <span className="font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600">Tax</span>
                  <span className="font-bold">₹0</span>
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-zinc-600">TOTAL</span>
                  <span className="text-2xl font-black text-zinc-950">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrderViaWhatsApp}
                  disabled={isLoading || items.length === 0}
                  style={(isLoading || items.length === 0) ? undefined : { backgroundColor: '#dc2626' }}
                  className="w-full h-12 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-zinc-300 hover:opacity-90"
                >
                  <MessageCircle className="w-4 h-4" />
                  {isLoading ? "Processing..." : "Place Order via WhatsApp"}
                </button>
              </div>

              <p className="text-center text-xs text-zinc-500 leading-relaxed">
                Connect directly with our team for instant order confirmation and payment arrangement.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
