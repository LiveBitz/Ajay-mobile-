import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
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
          <span className="text-xs text-zinc-400 font-medium">Bussiness Policy Document: PRIV_01</span>
        </div>
      </nav>

      <main className="container mx-auto px-4 md:px-8 py-16 max-w-4xl">
        
        <header className="mb-12 border-b-4 border-black pb-8">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            Privacy Policy
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

        <div className="space-y-12">
          
          <section>
            <h2 className="text-xl font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-6">
              1. Commitment to Privacy
            </h2>
            <p className="text-lg leading-relaxed text-zinc-800">
              At **Priya Mobile Park**, we value your trust and are committed to protecting your personal information. This policy explains how we handle your data when you visit our store or make a purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-6">
              2. Information We Collect
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              We collect only the essential information required to fulfill your orders and provide customer support:
            </p>
            <ul className="list-disc pl-5 space-y-3 text-zinc-700">
              <li>**Contact Information**: Your name, phone number, and email address.</li>
              <li>**Delivery Details**: Your shipping address for order fulfillment.</li>
              <li>**Order History**: Records of products purchased for warranty and service centre verification.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-6">
              3. Data Usage & Security
            </h2>
            <ul className="list-disc pl-5 space-y-3 text-zinc-700">
              <li>**No Data Sharing**: We do not sell, trade, or share your personal information with third-party marketing agencies.</li>
              <li>**Order Processing**: Your data is used exclusively for processing transactions and communicating order updates.</li>
              <li>**Payment Security**: We do not store your credit card or sensitive financial information on our servers. All payments are processed through secure, industry-standard encrypted gateways.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-6">
              4. Service Verifications
            </h2>
            <p className="text-zinc-700 leading-relaxed">
              We may provide your name and contact details to authorized brand Service Centres if required to verify your purchase and facilitate warranty claims as per company policy.
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
