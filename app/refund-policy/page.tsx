import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RefundPolicy() {
  const lastUpdated = "April 23, 2026";

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased">
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
        
        <header className="mb-12 border-b-4 border-black pb-8">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            Return & Refund Policy
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
              PRIYA MOBILE PARK
            </p>
            <p className="text-sm font-medium text-zinc-400">
              Effective Date: {lastUpdated}
            </p>
          </div>
        </header>

        <div className="space-y-12">
          
          <section>
            <h2 className="text-xl font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-6">
              1. No Refund Policy
            </h2>
            <p className="text-lg leading-relaxed text-zinc-800 font-bold">
              All payments made are final. We maintain a strict no-refund policy under any circumstances once the transaction is completed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-6">
              2. No Return Policy
            </h2>
            <p className="text-lg leading-relaxed text-zinc-800 font-bold">
              Products once sold cannot be returned or exchanged. We strongly advise customers to verify their choice and check the product condition at the time of purchase/delivery.
            </p>
          </section>

        </div>

        <footer className="mt-20 pt-12 border-t-2 border-black flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-1">
            <p className="text-xs font-black uppercase">PRIYA MOBILE PARK</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
