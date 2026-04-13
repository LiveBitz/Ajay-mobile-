"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Truck, MapPin, Package, MessageCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { redirectToWhatsApp } from "@/lib/whatsapp-order";
import { useToast } from "@/hooks/use-toast";

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    size: string | null;
    color: string | null;
    product: {
      id: string;
      name: string;
      image: string;
    };
  }>;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [pollingActive, setPollingActive] = useState(true);
  const { toast } = useToast();

  // Fetch order function
  const fetchOrder = async (showError = false) => {
    try {
      const supabase = createClient();
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `/api/orders?orderId=${orderId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }

      const data = await response.json();

      // Check if order belongs to current user
      if (data.userId !== userData.user.id) {
        throw new Error("Unauthorized");
      }

      setOrder(data);
      setError(null);

      // Stop polling if order is no longer pending
      if (data.paymentStatus === "completed" || data.status === "confirmed") {
        setPollingActive(false);
        if (data.paymentStatus === "completed") {
          toast({
            title: "Order Confirmed!",
            description: "Your order has been confirmed by our team.",
            duration: 5000,
          });
        }
      }
    } catch (err: any) {
      if (showError) {
        setError(err.message || "Failed to load order");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    if (orderId) {
      fetchOrder(true);
    }
  }, [orderId, router]);

  // Real-time polling for order updates
  useEffect(() => {
    if (!orderId || !pollingActive) return;

    const pollInterval = setInterval(() => {
      fetchOrder(false);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [orderId, pollingActive]);

  const handleResendWhatsApp = async () => {
    if (!order) return;

    setIsResending(true);

    try {
      // Format order details for WhatsApp
      const orderDetails = {
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        deliveryAddress: {
          street: order.street,
          city: order.city,
          state: order.state,
          zipCode: order.zipCode,
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
        setIsResending(false);
        return;
      }

      // Show ready message
      toast({
        title: "Opening WhatsApp",
        description: "Your order details are ready to send",
        duration: 2000,
      });

      // Redirect to WhatsApp with pre-filled message
      setTimeout(() => {
        redirectToWhatsApp(adminPhone, orderDetails);
      }, 500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open WhatsApp",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "shipped":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "delivered":
        return "bg-green-50 text-green-700 border-green-100";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-zinc-50 text-zinc-700 border-zinc-100";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-950 mx-auto"></div>
          <p className="mt-4 text-zinc-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center border-zinc-100 rounded-2xl">
          <p className="text-red-600 font-bold mb-4">{error || "Order not found"}</p>
          <Link href="/cart">
            <Button className="w-full rounded-full">Return to Cart</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-8 md:pt-0">
      {/* Hero Section */}
      <div style={{ backgroundColor: '#0a0a0a' }} className="py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Order Confirmed!
          </h1>
          {order.orderNumber && (
            <p className="text-zinc-400 text-sm mt-2 font-mono">#{order.orderNumber}</p>
          )}
          <p className="text-zinc-500 text-sm mt-3 max-w-sm mx-auto leading-relaxed">
            Thank you for your order. Your package will be with you very soon.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Order Info */}
          <Card className="p-6 border-zinc-100 rounded-2xl">
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-600 mb-4">
              Order Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">
                  Order Number
                </p>
                <p className="text-lg font-black text-zinc-950 mt-1">
                  {order.orderNumber}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">
                  Order Date
                </p>
                <p className="text-sm font-bold text-zinc-950 mt-1">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">
                  Status
                </p>
                <Badge className={`mt-2 ${getStatusColor(order.status)}`}>
                  {order.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Delivery Info */}
          <Card className="p-6 border-zinc-100 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4" />
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-600">
                Delivery Address
              </h2>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-bold text-zinc-950">{order.customerName}</p>
              <p className="text-zinc-600">{order.street}</p>
              <p className="text-zinc-600">
                {order.city}, {order.state} {order.zipCode}
              </p>
              <p className="text-zinc-600 font-mono text-xs">{order.customerPhone}</p>
            </div>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="p-6 border-zinc-100 rounded-2xl mb-8">
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-600 mb-6">
            Order Items
          </h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-zinc-100 last:border-b-0 last:pb-0">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-50 shrink-0">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-zinc-950 text-sm">
                    {item.product.name}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                    <span>Qty: {item.quantity}</span>
                    {item.size && <span>Size: {item.size}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                  </div>
                  <p className="text-sm font-bold text-zinc-950 mt-3">
                    ₹{((item.price ?? 0) * (item.quantity ?? 0)).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Order Total */}
        <Card className="p-6 border-zinc-100 rounded-2xl mb-8">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Subtotal</span>
              <span className="font-bold">₹{(order.subtotal ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Shipping</span>
              <span className="font-bold">FREE</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Tax</span>
              <span className="font-bold">₹{(order.tax ?? 0).toLocaleString()}</span>
            </div>
            <div className="border-t border-zinc-100 pt-4 flex justify-between items-center">
              <span className="text-sm font-bold text-zinc-600 uppercase tracking-wider">Total</span>
              <span className="text-xl font-black text-zinc-900">
                ₹{(order.total ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        {/* WhatsApp Reminder Section - Show only for pending WhatsApp orders */}
        {order.paymentMethod === "whatsapp" && 
         order.paymentStatus === "pending" && 
         order.status === "pending" && (
          <Card className="p-6 border-2 border-green-200 rounded-2xl mb-8 bg-green-50">
            <div className="flex gap-4">
              <AlertCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-black text-green-900 mb-2 uppercase tracking-tight">
                  Important: Send Your Order on WhatsApp
                </h3>
                <p className="text-sm text-green-800 mb-4 leading-relaxed">
                  Your order has been created successfully! Now you need to send the order details to our WhatsApp to confirm with our team. Click the button below to open WhatsApp with your pre-filled order details.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={handleResendWhatsApp}
                    disabled={isResending}
                    className="w-full sm:w-auto h-12 rounded-full bg-green-600 hover:bg-green-700 text-white font-black text-sm uppercase tracking-[0.15em] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {isResending ? "Opening..." : "Send Order on WhatsApp"}
                  </Button>
                  <p className="text-xs text-green-700 mt-2">
                    ⚠️ If you didn't send the message yet, please click above. If you already sent it, you can proceed to continue shopping.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Confirmation Message - Show when order is confirmed */}
        {order.paymentMethod === "whatsapp" && 
         order.paymentStatus === "completed" && (
          <Card className="p-6 border-2 border-green-200 rounded-2xl mb-8 bg-green-50 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex gap-4">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-black text-green-900 mb-2 uppercase tracking-tight">
                  Order Confirmed!
                </h3>
                <p className="text-sm text-green-800">
                  Thank you! Our team has confirmed your order. We will prepare and ship it within 1-2 business days.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/profile" className="flex-1">
            <button className="w-full h-12 rounded-xl border border-zinc-200 text-zinc-700 font-semibold text-sm hover:bg-zinc-50 transition-colors">
              View All Orders
            </button>
          </Link>
          <Link href="/" className="flex-1">
            <button
              style={{ backgroundColor: '#dc2626' }}
              className="w-full h-12 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
