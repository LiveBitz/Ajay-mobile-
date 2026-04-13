"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  ChevronDown,
  Calendar,
  MapPin,
  Truck,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface OrderItem {
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
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        if (response.ok) {
          const data = await response.json();
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-blue-500" />;
      case "confirmed":
        return <Package className="w-5 h-5 text-purple-500" />;
      default:
        return <Package className="w-5 h-5 text-yellow-500" />;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 bg-zinc-100 rounded-xl" />
        <div className="h-20 bg-zinc-100 rounded-xl" />
        <div className="h-20 bg-zinc-100 rounded-xl" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-zinc-100 rounded-lg">
          <Package className="w-5 h-5 text-zinc-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Order History</h2>
          <p className="text-xs text-zinc-500 mt-1">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Empty State */}
      {orders.length === 0 ? (
        <Card className="p-12 text-center border-zinc-100 rounded-xl">
          <Package className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
          <p className="text-zinc-500 font-medium mb-4">No orders yet</p>
          <Link href="/">
            <Button
              variant="outline"
              className="gap-2 rounded-xl border-zinc-200 hover:bg-zinc-50 font-semibold"
            >
              Start Shopping
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="border-zinc-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Order Header */}
              <button
                onClick={() =>
                  setExpandedOrder(
                    expandedOrder === order.id ? null : order.id
                  )
                }
                className="w-full p-4 md:p-6 bg-white hover:bg-zinc-50 transition-colors text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(order.status)}
                      <p className="font-bold text-zinc-950 text-sm">
                        {order.orderNumber}
                      </p>
                      <Badge className={cn("text-xs font-bold", getStatusColor(order.status))}>
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-xs text-zinc-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-600">
                        <Package className="w-4 h-4" />
                        <span>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-600">
                        <MapPin className="w-4 h-4" />
                        <span>{order.city}, {order.state}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Total & Expand Icon */}
                  <div className="text-right shrink-0">
                    <p className="font-black text-zinc-950 text-lg">
                      ₹{order.total.toLocaleString()}
                    </p>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-zinc-400 transition-transform mt-2 mx-auto",
                        expandedOrder === order.id && "rotate-180"
                      )}
                    />
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {expandedOrder === order.id && (
                <div className="border-t border-zinc-100 p-4 md:p-6 bg-zinc-50 space-y-6">
                  {/* Order Items */}
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 mb-4">
                      Items Ordered
                    </h3>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-4 bg-white rounded-lg p-4"
                        >
                          {/* Product Image */}
                          <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-zinc-950 truncate">
                              {item.product.name}
                            </p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-zinc-600">
                              <span>Qty: {item.quantity}</span>
                              {item.size && <span>Size: {item.size}</span>}
                              {item.color && <span>Color: {item.color}</span>}
                            </div>
                          </div>

                          {/* Item Price */}
                          <p className="font-bold text-zinc-950 shrink-0">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 mb-3">
                      Delivery Address
                    </h3>
                    <div className="bg-white rounded-lg p-4 space-y-1 text-sm">
                      <p className="font-bold text-zinc-950">
                        {order.customerName}
                      </p>
                      <p className="text-zinc-600">{order.street}</p>
                      <p className="text-zinc-600">
                        {order.city}, {order.state} {order.zipCode}
                      </p>
                    </div>
                  </div>

                  {/* Order Totals */}
                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600">Subtotal</span>
                      <span className="font-bold">₹{order.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600">Shipping</span>
                      <span className="font-bold">FREE</span>
                    </div>
                    <div className="border-t border-zinc-100 pt-3 flex justify-between">
                      <span className="font-bold text-zinc-600">TOTAL</span>
                      <span className="font-black text-zinc-950 text-lg">
                        ₹{order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="flex gap-3">
                    <Link href={`/order-confirmation/${order.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full rounded-lg border-zinc-200 hover:bg-zinc-100"
                      >
                        View Details
                      </Button>
                    </Link>
                    {order.status === "delivered" && (
                      <Button className="flex-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white">
                        Reorder
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
