"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Truck, MapPin, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

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

  useEffect(() => {
    const fetchOrder = async () => {
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
      } catch (err: any) {
        setError(err.message || "Failed to load order");
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, router]);

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
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-950">
            Order Confirmed!
          </h1>
          <p className="text-zinc-500 mt-2">
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
                <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
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
                    ₹{(item.price * item.quantity).toLocaleString()}
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
              <span className="font-bold">₹{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Shipping</span>
              <span className="font-bold">FREE</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Tax</span>
              <span className="font-bold">₹{order.tax}</span>
            </div>
            <div className="border-t border-zinc-100 pt-4 flex justify-between">
              <span className="font-bold text-zinc-600">TOTAL</span>
              <span className="text-2xl font-black text-zinc-950">
                ₹{order.total.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
          <div className="flex gap-4">
            <Truck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">What's Next?</h3>
              <p className="text-sm text-blue-800">
                You will receive a confirmation email shortly with tracking details. Our team will prepare and ship your order within 1-2 business days.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/profile" className="flex-1">
            <Button
              variant="outline"
              className="w-full h-12 rounded-full border-zinc-100 font-bold text-sm uppercase tracking-widest"
            >
              View All Orders
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button className="w-full h-12 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-sm uppercase tracking-widest">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
