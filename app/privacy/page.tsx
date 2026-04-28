import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Priya Mobile Park — how we collect, use, and protect your data.",
};

export default function PrivacyPolicy() {
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
            Policy Document — PRIV_01
          </span>
        </div>

        {/* Title */}
        <header className="mb-10 border-b-4 border-black pb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-tight">
            Privacy Policy
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
              Priya Mobile Park
            </p>
            <p className="text-sm text-zinc-400">Last Updated: {lastUpdated}</p>
          </div>
          <p className="mt-5 text-zinc-600 leading-relaxed text-sm sm:text-base">
            At <strong>Priya Mobile Park</strong>, we are committed to protecting your personal
            information. This Privacy Policy explains what information we collect, how we use it,
            and what rights you have.
          </p>
        </header>

        <div className="space-y-10">

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              1. Information We Collect
            </h2>
            <div className="space-y-4">
              {[
                ["Personal Identification", "Full name, email address, phone number."],
                ["Delivery Information", "Shipping address, city, state, and PIN code required to fulfil your order."],
                ["Transaction Data", "Order history, products purchased, invoice details, and payment method type (not card details)."],
                ["Technical Data", "IP address, browser type, device type, and pages visited — collected automatically via cookies and server logs."],
                ["Location Data", "Approximate location (city and PIN code) if you choose to enable location services. This is optional and used only to show delivery information."],
              ].map(([title, desc]) => (
                <div key={title} className="pl-4 border-l-2 border-zinc-200">
                  <p className="font-bold text-sm text-zinc-800 mb-0.5">{title}</p>
                  <p className="text-sm text-zinc-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-700 text-sm sm:text-base">
              <li><strong>Order Processing:</strong> To confirm, process, pack, and deliver your order.</li>
              <li><strong>Customer Communication:</strong> To send order confirmations, shipping updates, and respond to queries.</li>
              <li><strong>Warranty Verification:</strong> To share your name and purchase details with authorised service centres for warranty claims.</li>
              <li><strong>Account Management:</strong> To maintain your account, saved addresses, and order history.</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws, GST regulations, and legal obligations.</li>
              <li><strong>Fraud Prevention:</strong> To detect and prevent fraudulent transactions.</li>
              <li><strong>Website Improvement:</strong> To analyse how users interact with our site (anonymised data).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              3. Payment Security
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-700 text-sm sm:text-base">
              <li>We <strong>do not store</strong> your credit/debit card numbers, CVV, or banking credentials on our servers.</li>
              <li>All payments are processed through PCI-DSS certified payment gateways.</li>
              <li>Payment data is encrypted in transit using industry-standard TLS.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              4. Data Sharing &amp; Disclosure
            </h2>
            <p className="text-zinc-700 text-sm sm:text-base mb-3">
              We <strong>do not sell</strong> your personal information to third parties. We share
              your data only in these limited circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-700 text-sm sm:text-base">
              <li><strong>Logistics Partners:</strong> Name, phone, and address — shared to fulfil your order.</li>
              <li><strong>Payment Gateways:</strong> Transaction details shared for order completion.</li>
              <li><strong>Brand Service Centres:</strong> Purchase details for warranty claim verification.</li>
              <li><strong>Legal Authorities:</strong> If required by law, court order, or government regulation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              5. Cookies
            </h2>
            <p className="text-zinc-700 text-sm sm:text-base mb-3">
              Our website uses cookies to enhance your experience:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-700 text-sm sm:text-base">
              <li><strong>Essential Cookies:</strong> Required for the website to function (cart, session). Cannot be disabled.</li>
              <li><strong>Preference Cookies:</strong> Store your preferences such as saved location.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site (anonymised).</li>
            </ul>
            <p className="text-zinc-600 text-sm mt-3">
              You can control cookie settings through your browser. Disabling essential cookies may
              affect website functionality.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              6. Data Retention
            </h2>
            <p className="text-zinc-700 leading-relaxed text-sm sm:text-base">
              We retain your data only as long as necessary to provide our services and comply with
              legal obligations (e.g., GST invoice records for 7 years under Indian tax law). Account
              data is retained until you request deletion. To request deletion, email{" "}
              <a href="mailto:priyamobilepark3@gmail.com" className="underline font-semibold">
                priyamobilepark3@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              7. Your Rights
            </h2>
            <p className="text-zinc-700 text-sm sm:text-base mb-3">
              Under the Digital Personal Data Protection Act, 2023 (India), you have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-700 text-sm sm:text-base">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Erasure:</strong> Request deletion of your data (subject to legal retention).</li>
              <li><strong>Grievance Redressal:</strong> Raise a complaint regarding how your data is handled.</li>
            </ul>
            <p className="text-zinc-600 text-sm mt-3">
              We will respond to all data requests within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              8. Children&apos;s Privacy
            </h2>
            <p className="text-zinc-700 leading-relaxed text-sm sm:text-base">
              Our services are not directed to individuals under 18. We do not knowingly collect
              personal information from minors. If you believe a minor has provided us with personal
              information, contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight border-b border-zinc-200 pb-2 mb-4">
              9. Changes to This Policy
            </h2>
            <p className="text-zinc-700 leading-relaxed text-sm sm:text-base">
              We may update this Privacy Policy from time to time. The updated version will be
              indicated by a revised "Last Updated" date. Continued use of our services after any
              changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact box */}
          <section className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight mb-4">
              10. Contact &amp; Grievance Officer
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-zinc-700">
              <p><span className="font-bold">Business:</span> Priya Mobile Park</p>
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
