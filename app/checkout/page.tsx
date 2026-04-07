"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Truck, Lock, Check, MapPin } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { cn } from "@/lib/utils";

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

  const handleSubmitOrder = async () => {
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
      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      const response = await fetch("/api/orders", {
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

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create order");
      }

      const data = await response.json();

      toast({
        title: "Order Confirmed!",
        description: `Order ${data.order.orderNumber} has been placed successfully`,
        duration: 3000,
      });

      // Clear cart and redirect
      clearCart();
      router.push(`/order-confirmation/${data.order.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen bg-zinc-50">
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
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest">
                    Full Name
                  </Label>
                  <Input
                    placeholder="Enter your full name"
                    value={address.name}
                    onChange={(e) =>
                      handleAddressChange("name", e.target.value)
                    }
                    className="rounded-xl border-zinc-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest">
                    Phone Number
                  </Label>
                  <Input
                    placeholder="Enter your phone number"
                    value={address.phone}
                    onChange={(e) =>
                      handleAddressChange("phone", e.target.value)
                    }
                    className="rounded-xl border-zinc-100"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest">
                    Street Address
                  </Label>
                  <Input
                    placeholder="Enter your street address"
                    value={address.street}
                    onChange={(e) =>
                      handleAddressChange("street", e.target.value)
                    }
                    className="rounded-xl border-zinc-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest">
                    City
                  </Label>
                  <Input
                    placeholder="Enter your city"
                    value={address.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                    className="rounded-xl border-zinc-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest">
                    State
                  </Label>
                  <Input
                    placeholder="Enter your state"
                    value={address.state}
                    onChange={(e) =>
                      handleAddressChange("state", e.target.value)
                    }
                    className="rounded-xl border-zinc-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest">
                    ZIP Code
                  </Label>
                  <Input
                    placeholder="Enter your ZIP code"
                    value={address.zipCode}
                    onChange={(e) =>
                      handleAddressChange("zipCode", e.target.value)
                    }
                    className="rounded-xl border-zinc-100"
                  />
                </div>
              </div>
            </Card>
            )}

            {/* Payment Method */}
            <Card className="p-6 border-zinc-100 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-5 h-5 text-zinc-950" />
                <h2 className="text-lg font-black uppercase tracking-tight">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                  <input
                    type="radio"
                    id="cod"
                    name="payment"
                    defaultChecked
                    disabled
                    className="w-5 h-5"
                  />
                  <label htmlFor="cod" className="flex-1 cursor-pointer">
                    <p className="font-bold text-sm text-zinc-950">
                      Cash on Delivery (COD)
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Pay when your order arrives
                    </p>
                  </label>
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

              <Button
                onClick={handleSubmitOrder}
                disabled={isLoading || items.length === 0}
                className="w-full h-14 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-black text-sm uppercase tracking-[0.15em] transition-all duration-300 active:scale-95"
              >
                {isLoading ? "Processing..." : "Place Order (COD)"}
              </Button>

              <p className="text-center text-xs text-zinc-500 leading-relaxed">
                By placing this order, you agree to our Terms & Conditions and
                confirm you will pay on delivery
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
