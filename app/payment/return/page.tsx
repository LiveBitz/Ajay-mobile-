"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, ArrowRight, RotateCcw } from "lucide-react";
import { useCart } from "@/context/CartContext";

type PaymentStatus = "checking" | "paid" | "failed" | "pending" | "unknown";

function PaymentReturnContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const orderId =
    params.get("orderId") ??
    params.get("order_id") ??
    params.get("merchant_order_reference") ??
    params.get("unique_merchant_txn_id") ??
    "";

  const [status, setStatus] = useState<PaymentStatus>("checking");
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [total, setTotal] = useState<number>(0);
  const [attempts, setAttempts] = useState(0);

  const checkStatus = useCallback(async () => {
    if (!orderId) { setStatus("unknown"); return; }
    try {
      const res = await fetch(`/api/payment/status?orderId=${orderId}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setOrderNumber(data.orderNumber ?? "");
      setTotal(data.total ?? 0);

      if (data.paymentStatus === "paid") {
        setStatus("paid");
      } else if (data.paymentStatus === "failed") {
        setStatus("failed");
      } else {
        setStatus("pending");
      }
    } catch {
      setStatus("unknown");
    }
  }, [orderId]);

  // Poll up to 10 times (20 seconds) to let webhook settle
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  useEffect(() => {
    if (status !== "pending" && status !== "checking") return;
    if (attempts >= 10) return;
    const t = setTimeout(() => {
      setAttempts((a) => a + 1);
      checkStatus();
    }, 2000);
    return () => clearTimeout(t);
  }, [status, attempts, checkStatus]);

  // Redirect to order confirmation after success
  useEffect(() => {
    if (status === "paid" && orderId) {
      clearCart();
      const t = setTimeout(() => router.push(`/order-confirmation/${orderId}`), 3000);
      return () => clearTimeout(t);
    }
  }, [status, orderId, router, clearCart]);

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-zinc-100 w-full max-w-md p-8 text-center">

        {/* Checking */}
        {(status === "checking" || (status === "pending" && attempts < 10)) && (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
              <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" style={{ borderWidth: "3px" }} />
            </div>
            <h1 className="text-xl font-black text-zinc-900 mb-2">Verifying Payment…</h1>
            <p className="text-sm text-zinc-400">
              Please wait while we confirm your payment with Pine Labs.
            </p>
            <div className="flex justify-center gap-1 mt-6">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ backgroundColor: i < attempts ? "#2563eb" : "#e4e4e7" }}
                />
              ))}
            </div>
          </>
        )}

        {/* Timeout — still pending after 10 polls */}
        {status === "pending" && attempts >= 10 && (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-xl font-black text-zinc-900 mb-2">Payment Pending</h1>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              Your payment is being processed. We&apos;ll update your order status once confirmed.
              {orderNumber && (
                <> Your order number is <strong>#{orderNumber}</strong>.</>
              )}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setAttempts(0); setStatus("checking"); checkStatus(); }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-zinc-200 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Check Again
              </button>
              {orderId && (
                <Link
                  href={`/order-confirmation/${orderId}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-bold text-white transition-all"
                  style={{ backgroundColor: "#dc2626" }}
                >
                  View Order
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </>
        )}

        {/* Success */}
        {status === "paid" && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-9 h-9 text-emerald-500" />
            </div>
            <h1 className="text-xl font-black text-zinc-900 mb-2">Payment Successful!</h1>
            {orderNumber && (
              <p className="text-sm font-bold text-emerald-600 mb-1">Order #{orderNumber}</p>
            )}
            {total > 0 && (
              <p className="text-sm text-zinc-400 mb-5">
                ₹{total.toLocaleString("en-IN")} paid via Pine Labs
              </p>
            )}
            <p className="text-xs text-zinc-400 mb-6">Redirecting to your order confirmation…</p>
            {orderId && (
              <Link
                href={`/order-confirmation/${orderId}`}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold text-white"
                style={{ backgroundColor: "#dc2626" }}
              >
                View Order Details
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </>
        )}

        {/* Unknown */}
        {status === "unknown" && (
          <>
            <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-5">
              <Clock className="w-8 h-8 text-zinc-500" />
            </div>
            <h1 className="text-xl font-black text-zinc-900 mb-2">Payment Status Unavailable</h1>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              We could not verify this payment from the return link. Please check your orders or go back home.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold text-white"
                style={{ backgroundColor: "#dc2626" }}
              >
                Go Home
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/profile"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border-2 border-zinc-200 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all"
              >
                View Orders
              </Link>
            </div>
          </>
        )}

        {/* Failed */}
        {status === "failed" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-9 h-9 text-red-500" />
            </div>
            <h1 className="text-xl font-black text-zinc-900 mb-2">Payment Failed</h1>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              Your payment could not be processed. No amount has been charged.
              Please try again or use a different payment method.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/checkout"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold text-white"
                style={{ backgroundColor: "#dc2626" }}
              >
                Try Again
              </Link>
              <Link
                href="/cart"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border-2 border-zinc-200 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all"
              >
                Back to Cart
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
      </div>
    }>
      <PaymentReturnContent />
    </Suspense>
  );
}
