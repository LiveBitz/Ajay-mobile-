import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and Conditions for Priya Mobile Park — Jaipur's trusted mobile store.",
};

export default function TermsAndConditions() {
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
            Policy Document — TC_01
          </span>
        </div>

        {/* Title */}
        <header className="mb-10 border-b-4 border-black pb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-tight">
            Terms &amp; Conditions
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
              Priya Mobile Park
            </p>
            <p className="text-sm text-zinc-400">Last Updated: {lastUpdated}</p>
          </div>
          <p className="mt-5 text-zinc-600 leading-relaxed text-sm sm:text-base">
            Please read these Terms &amp; Conditions carefully before using{" "}
            <strong>priyamobilepark.com</strong> or making any purchase. By accessing our website
            or completing a purchase, you agree to be bound by these terms.
          </p>
        </header>

        <div className="space-y-10">

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              1. About Us
            </h2>
            <p className="text-zinc-700 leading-relaxed text-sm sm:text-base">
              <strong>Priya Mobile Park</strong> is an authorised retailer of smartphones, mobile
              accessories, and related electronic products. We operate at No. 7, Station Road,
              Belgharia, Kolkata — 700056, and online at{" "}
              <a href="https://www.priyamobilepark.com" className="underline font-semibold">
                priyamobilepark.com
              </a>
              . Our GSTIN is <strong>19CDXPK8119E1ZZ</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              2. Eligibility
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-700 text-sm sm:text-base">
              <li>You must be at least 18 years of age to place an order.</li>
              <li>By placing an order you confirm that all information you provide is accurate, current, and complete.</li>
              <li>Our services are available only to individuals residing in India.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              3. Products &amp; Pricing
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-700 text-sm sm:text-base">
              <li>All products are <strong>100% genuine</strong> and sourced from authorised distributors.</li>
              <li>Prices are in Indian Rupees (INR), inclusive of applicable GST.</li>
              <li>We reserve the right to change prices at any time. The price at the time of order placement applies to that transaction.</li>
              <li>Product images are for representational purposes only. Actual appearance may vary slightly.</li>
              <li>Stock availability is not guaranteed until the order is confirmed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              4. Order Placement &amp; Confirmation
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-700 text-sm sm:text-base">
              <li>Adding an item to your cart does not reserve it. The order is confirmed only upon successful payment.</li>
              <li>You will receive an order confirmation via email/SMS after successful payment.</li>
              <li>We reserve the right to cancel or refuse any order due to stock unavailability, payment failure, or suspected fraud. A full refund will be issued in such cases.</li>
              <li>Orders may be cancelled before dispatch by calling <a href="tel:+918336084672" className="underline font-semibold">+91 83360-84672</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              5. Payment
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-700 text-sm sm:text-base">
              <li>We accept UPI, credit/debit cards, net banking, wallets, EMI, and cash on delivery (where available).</li>
              <li>All payments are processed through secure, PCI-DSS compliant gateways. We do not store your card or banking credentials.</li>
              <li>EMI terms and interest rates are governed by your card issuer or financing institution.</li>
              <li>If the amount was debited but no order was confirmed, contact us immediately.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              6. Shipping &amp; Delivery
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-700 text-sm sm:text-base">
              <li>Estimated delivery: <strong>2–4 business days</strong> from order confirmation.</li>
              <li>Shipping charges, if any, are displayed at checkout before payment.</li>
              <li>We are not responsible for delays caused by logistics partners, natural disasters, or force majeure events.</li>
              <li>Risk of loss passes to the customer upon delivery.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              7. Warranty &amp; Service
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-700 text-sm sm:text-base">
              <li>All products carry the <strong>manufacturer's standard warranty</strong>.</li>
              <li>Warranty claims must be made at the brand's authorised service centre with the original invoice.</li>
              <li>Warranty is void if the device has been tampered with or repaired by an unauthorised centre.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              8. Returns &amp; Refunds
            </h2>
            <p className="text-zinc-700 leading-relaxed text-sm sm:text-base">
              Our return and refund terms are governed by our{" "}
              <Link href="/refund-policy" className="underline font-semibold">
                Return &amp; Refund Policy
              </Link>
              , which forms an integral part of these Terms &amp; Conditions.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              9. Limitation of Liability
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-700 text-sm sm:text-base">
              <li>Priya Mobile Park shall not be liable for indirect, incidental, or consequential damages arising from use of our products or services.</li>
              <li>Our total liability in any matter shall not exceed the purchase price of the product in question.</li>
              <li>We are not liable for delays caused by logistics partners or circumstances beyond our control.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              10. Governing Law &amp; Disputes
            </h2>
            <p className="text-zinc-700 leading-relaxed text-sm sm:text-base">
              These terms are governed by the laws of India. Disputes shall be subject to the
              exclusive jurisdiction of the courts of <strong>Kolkata, West Bengal</strong>. We
              encourage customers to contact us at{" "}
              <a href="mailto:priyamobilepark3@gmail.com" className="underline font-semibold">
                priyamobilepark3@gmail.com
              </a>{" "}
              to resolve matters amicably before pursuing legal remedies.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              11. Amendments
            </h2>
            <p className="text-zinc-700 leading-relaxed text-sm sm:text-base">
              We reserve the right to update these Terms at any time. Changes are effective
              immediately upon posting. Continued use of our services constitutes acceptance
              of the revised terms.
            </p>
          </section>

          {/* Contact box */}
          <section className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight mb-4">
              12. Contact Us
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-zinc-700">
              <p><span className="font-bold">Business:</span> Priya Mobile Park</p>
              <p><span className="font-bold">GSTIN:</span> 19CDXPK8119E1ZZ</p>
              <p className="sm:col-span-2"><span className="font-bold">Address:</span> No. 7, Station Road, Belgharia, Kolkata — 700056</p>
              <p>
                <span className="font-bold">Email:</span>{" "}
                <a href="mailto:priyamobilepark3@gmail.com" className="underline break-all">
                  priyamobilepark3@gmail.com
                </a>
              </p>
              <p>
                <span className="font-bold">Phone:</span>{" "}
                <a href="tel:+918336084672" className="underline">+91 83360-84672</a>
              </p>
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
