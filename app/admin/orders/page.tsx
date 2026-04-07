"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Package,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Image from "next/image";

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
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/orders");

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err: any) {
      alert(err.message || "Failed to update order status");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "shipped":
        return <Truck className="w-4 h-4 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-yellow-500" />;
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-black tracking-tight text-zinc-950">
          Orders
        </h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-950"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-black tracking-tight text-zinc-950">
          Orders
        </h1>
        <Card className="p-6 border-red-100 bg-red-50 rounded-2xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-600">Error: {error}</p>
          </div>
          <Button
            onClick={fetchOrders}
            variant="outline"
            className="mt-4 border-red-100"
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-950">
          Orders
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by order #, customer name, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 rounded-xl border-zinc-100"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 rounded-xl border-zinc-100">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="p-12 text-center border-zinc-100 rounded-2xl">
          <Package className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
          <p className="text-zinc-500">No orders found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="border-zinc-100 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Order Header */}
              <div
                className="p-4 sm:p-6 cursor-pointer bg-white hover:bg-zinc-50 transition-colors"
                onClick={() =>
                  setExpandedOrder(
                    expandedOrder === order.id ? null : order.id
                  )
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(order.status)}
                      <p className="font-black text-zinc-950 text-sm">
                        {order.orderNumber}
                      </p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500 mb-2">
                      {order.customerName} •{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-zinc-600 truncate">
                      {order.customerEmail}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-zinc-950">
                      ₹{order.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order.id && (
                <div className="border-t border-zinc-100 p-4 sm:p-6 space-y-6 bg-zinc-50">
                  {/* Customer Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-2">
                        Customer Info
                      </p>
                      <div className="space-y-1 text-sm">
                        <p className="font-bold text-zinc-950">
                          {order.customerName}
                        </p>
                        <p className="text-zinc-600 font-mono text-xs">
                          {order.customerEmail}
                        </p>
                        <p className="text-zinc-600 font-mono text-xs">
                          {order.customerPhone}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-2">
                        Delivery Address
                      </p>
                      <div className="space-y-1 text-sm">
                        <p className="text-zinc-950">{order.street}</p>
                        <p className="text-zinc-600">
                          {order.city}, {order.state} {order.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-4">
                      Items
                    </p>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 bg-white rounded-lg p-3"
                        >
                          <div className="relative w-12 h-16 rounded overflow-hidden bg-zinc-100 shrink-0">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0 text-xs">
                            <p className="font-bold text-zinc-950 truncate">
                              {item.product.name}
                            </p>
                            <p className="text-zinc-500 mt-1">
                              Qty: {item.quantity}
                            </p>
                            {item.size && (
                              <p className="text-zinc-500">Size: {item.size}</p>
                            )}
                            {item.color && (
                              <p className="text-zinc-500">
                                Color: {item.color}
                              </p>
                            )}
                          </div>
                          <p className="font-bold text-zinc-950 shrink-0">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-600">Subtotal</span>
                      <span className="font-bold">
                        ₹{order.subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-600">Tax</span>
                      <span className="font-bold">₹{order.tax}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-600">Shipping</span>
                      <span className="font-bold">
                        ₹{order.shipping || "FREE"}
                      </span>
                    </div>
                    <div className="border-t border-zinc-100 pt-3 flex justify-between">
                      <span className="font-bold text-zinc-600">TOTAL</span>
                      <span className="font-black text-zinc-950">
                        ₹{order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-3">
                      Update Status
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((status) => (
                        <Button
                          key={status}
                          onClick={() => updateOrderStatus(order.id, status)}
                          variant={
                            order.status === status
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className={cn(
                            "rounded-full text-xs uppercase tracking-widest font-bold",
                            order.status === status
                              ? "bg-zinc-950 hover:bg-zinc-800"
                              : "border-zinc-100 hover:bg-zinc-50"
                          )}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";
