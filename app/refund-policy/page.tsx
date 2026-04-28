import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return & Refund Policy",
  description: "Return and Refund Policy for Priya Mobile Park.",
};

export default function RefundPolicy() {
  const lastUpdated = "April 28, 2026";

  return (
    <div className="min-h-screen bg-white text-black antialiased">
      <main className="container mx-auto px-4 sm:px-6 md:px-8 pt-8 pb-8 md:pt-12 md:pb-16 max-w-4xl">

        {/* Back + doc tag */}
        <div className="flex items-center justify-between mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-black transition-colors text-sm font-medium"
          >
            <ArrowLeft size={15} />
            Back to Home
          </Link>
          <span className="text-[11px] text-zinc-400 font-medium tracking-wide hidden sm:block">
            Policy Document — REF_01
          </span>
        </div>

        {/* Title */}
        <header className="mb-10 border-b-4 border-black pb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-tight">
            Return &amp; Refund Policy
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
              Priya Mobile Park
            </p>
            <p className="text-sm text-zinc-400">Effective Date: {lastUpdated}</p>
          </div>
          <p className="mt-5 text-zinc-600 leading-relaxed text-sm sm:text-base">
            This policy governs all purchases made through <strong>priyamobilepark.com</strong>.
            Please read it carefully before placing an order. By completing a purchase you
            acknowledge and agree to the terms below.
          </p>
        </header>

        <div className="space-y-10">

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              1. General Policy
            </h2>
            <p className="text-zinc-700 leading-relaxed text-sm sm:text-base mb-3">
              All sales at Priya Mobile Park are <strong>final</strong>. We do not accept returns
              or issue refunds except in the specific circumstances outlined in Section 2.
              We strongly advise every customer to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-700 text-sm sm:text-base">
              <li>Verify the model, colour, storage variant, and box contents upon receiving the product.</li>
              <li>Retain all original packaging, invoice, and accessories.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              2. Exceptions — When We Accept Returns / Issue Refunds
            </h2>
            <p className="text-zinc-700 text-sm sm:text-base mb-6">
              Notwithstanding our general no-return policy, the following exceptions apply in
              accordance with the <strong>Consumer Protection Act, 2019</strong>:
            </p>

            <div className="space-y-5">

              <div className="border border-zinc-200 rounded-xl p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-black uppercase tracking-tight mb-3 text-red-700">
                  2A — Wrong Product Delivered
                </h3>
                <p className="text-zinc-700 text-sm leading-relaxed mb-2">
                  If you receive a product materially different from what you ordered (wrong model,
                  colour, or storage), report it <strong>within 24 hours</strong> of delivery.
                </p>
                <p className="text-zinc-700 text-sm leading-relaxed mb-2">
                  <strong>Resolution:</strong> We arrange a pick-up and deliver the correct product
                  at no extra cost. If unavailable, a full refund is issued within{" "}
                  <strong>7 business days</strong>.
                </p>
                <p className="text-xs text-zinc-500">
                  <strong>How to report:</strong> Email{" "}
                  <a href="mailto:priyamobilepark3@gmail.com" className="underline">
                    priyamobilepark3@gmail.com
                  </a>{" "}
                  or call{" "}
                  <a href="tel:+918336084672" className="underline">+91 83360-84672</a>{" "}
                  with your order number and photos.
                </p>
              </div>

              <div className="border border-zinc-200 rounded-xl p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-black uppercase tracking-tight mb-3 text-red-700">
                  2B — Dead on Arrival (DOA)
                </h3>
                <p className="text-zinc-700 text-sm leading-relaxed mb-2">
                  If the device does not power on or is non-functional upon first use, report it{" "}
                  <strong>within 48 hours</strong> of delivery.
                </p>
                <p className="text-zinc-700 text-sm leading-relaxed mb-2">
                  <strong>Resolution:</strong> We coordinate with the brand's authorised service
                  centre for a DOA certificate. A replacement or full refund is processed within{" "}
                  <strong>7–10 business days</strong>.
                </p>
                <p className="text-xs text-zinc-500">
                  <strong>How to report:</strong> Contact us immediately with a video of the issue.
                  Do not attempt third-party repair — it voids the DOA claim.
                </p>
              </div>

              <div className="border border-zinc-200 rounded-xl p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-black uppercase tracking-tight mb-3 text-red-700">
                  2C — Manufacturing Defect (Post-Use)
                </h3>
                <p className="text-zinc-700 text-sm leading-relaxed">
                  Manufacturing defects discovered after the device has been used are covered by
                  the <strong>manufacturer's warranty</strong>. Visit the nearest authorised brand
                  service centre with your original invoice. We will help locate the nearest
                  service centre on request.
                </p>
              </div>

            </div>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              3. Refund Timeline
            </h2>
            <p className="text-zinc-700 text-sm sm:text-base mb-4">
              Refunds are only issued in the circumstances described in Section 2. Once approved:
            </p>
            <div className="overflow-x-auto rounded-lg border border-zinc-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-100">
                    <th className="text-left px-4 py-3 font-black border-b border-zinc-200">Payment Method</th>
                    <th className="text-left px-4 py-3 font-black border-b border-zinc-200">Refund Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["UPI / Net Banking", "3–5 business days"],
                    ["Credit / Debit Card", "5–7 business days"],
                    ["EMI / Wallet", "7–10 business days"],
                    ["Cash on Delivery", "Bank transfer within 5 business days"],
                  ].map(([method, time], i) => (
                    <tr key={method} className={i % 2 === 1 ? "bg-zinc-50" : ""}>
                      <td className="px-4 py-3 border-b border-zinc-100 last:border-0">{method}</td>
                      <td className="px-4 py-3 border-b border-zinc-100 last:border-0">{time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              4. Non-Returnable Conditions
            </h2>
            <p className="text-zinc-700 text-sm sm:text-base mb-3">
              Returns and refunds will <strong>not</strong> be accepted under these circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-700 text-sm sm:text-base">
              <li>Product shows physical damage caused by the customer.</li>
              <li>Original packaging, invoice, or accessories are missing.</li>
              <li>Customer changed their mind after purchase.</li>
              <li>Software issues, app compatibility, or personal preference.</li>
              <li>Device has been tampered with or repaired by an unauthorised service centre.</li>
              <li>Report made beyond the timelines specified in Section 2.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              5. Order Cancellation
            </h2>
            <p className="text-zinc-700 text-sm sm:text-base mb-2">
              Orders may be cancelled <strong>before dispatch</strong> by contacting us on{" "}
              <a href="tel:+918336084672" className="underline font-semibold">
                +91 83360-84672
              </a>
              . Once dispatched, the order cannot be cancelled.
            </p>
            <p className="text-zinc-700 text-sm sm:text-base">
              Prepaid order cancellations (before dispatch) receive a full refund within 5–7 business
              days to the original payment method.
            </p>
          </section>

          {/* Contact box */}
          <section className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight mb-4">
              6. Contact Us
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-zinc-700">
              <p><span className="font-bold">Email:</span>{" "}
                <a href="mailto:priyamobilepark3@gmail.com" className="underline break-all">
                  priyamobilepark3@gmail.com
                </a>
              </p>
              <p><span className="font-bold">Phone:</span>{" "}
                <a href="tel:+918336084672" className="underline">+91 83360-84672</a>
              </p>
              <p className="sm:col-span-2"><span className="font-bold">Address:</span> No. 7, Station Road, Belgharia, Kolkata — 700056</p>
              <p className="sm:col-span-2"><span className="font-bold">Hours:</span> Monday – Sunday, 9:00 AM – 9:00 PM IST</p>
            </div>
          </section>

        </div>

        <footer className="mt-16 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row justify-between gap-3 text-xs text-zinc-400">
          <p className="font-bold uppercase tracking-wide">Priya Mobile Park</p>
          <p>The version on this page is always the current version.</p>
        </footer>
      </main>
    </div>
  );
}
