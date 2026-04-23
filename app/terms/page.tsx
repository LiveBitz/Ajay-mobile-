import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsAndConditions() {
  const lastUpdated = "April 23, 2026";

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased">
      {/* ── Header / Navigation ── */}
      <nav className="border-b border-zinc-200">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-zinc-600 hover:text-black transition-colors font-medium text-sm"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <span className="text-xs text-zinc-400 font-medium">Bussiness Policy Document</span>
        </div>
      </nav>

      <main className="container mx-auto px-4 md:px-8 py-16 max-w-4xl">
        
        {/* ── Document Title ── */}
        <header className="mb-12 border-b-4 border-black pb-8">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            Terms & Conditions
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
              PRIYA MOBILE PARK
            </p>
            <p className="text-sm font-medium text-zinc-400">
              Last Updated: {lastUpdated}
            </p>
          </div>
        </header>

        {/* ── The Only Terms ── */}
        <div className="space-y-8">
          
          <ul className="space-y-6">
            <li className="flex gap-4">
              <span className="font-black text-xl">01.</span>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight mb-2">Open Box Delivery</h2>
                <p className="text-zinc-700 leading-relaxed">
                  We provide Open Box Delivery for all orders. Customers are required to inspect the product thoroughly for physical condition and specifications at the time of delivery before acceptance.
                </p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="font-black text-xl">02.</span>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight mb-2">Service Centre Service</h2>
                <p className="text-zinc-700 leading-relaxed">
                  All service-related matters, including technical issues or manufacturing defects, will be handled exclusively by the authorized Service Centre of the respective brand as per the official company policy.
                </p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="font-black text-xl">03.</span>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight mb-2">No Refund</h2>
                <p className="text-zinc-700 leading-relaxed font-bold">
                  All payments made are final. We maintain a strict no-refund policy under any circumstances once the transaction is completed.
                </p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="font-black text-xl">04.</span>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight mb-2">No Return Policy</h2>
                <p className="text-zinc-700 leading-relaxed font-bold">
                  Products once sold cannot be returned or exchanged. We strongly advise customers to verify their choice and check the product condition at the time of purchase/delivery.
                </p>
              </div>
            </li>
          </ul>

        </div>

        {/* ── Document Footer ── */}
        <footer className="mt-20 pt-12 border-t-2 border-black flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-1">
            <p className="text-xs font-black uppercase">PRIYA MOBILE PARK</p>
            <p className="text-xs text-zinc-500 font-medium italic">Authorized Retailer</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
