import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const contactInfo = [
    { icon: Mail, label: "support@nexus.store", href: "mailto:support@nexus.store" },
    { icon: Phone, label: "+91 98765 43210", href: "tel:+919876543210" },
    { icon: MapPin, label: "Mumbai, Maharashtra, India", href: null },
  ];

  const shopLinks = [
    { label: "Home", href: "/" },
    { label: "Smartphones", href: "/category/smartphones" },
    { label: "Apple", href: "/category/apple" },
    { label: "Samsung", href: "/category/samsung" },
    { label: "Accessories", href: "/category/accessories" },
  ];

  const policies = [
    "Privacy Policy",
    "Terms of Service",
    "Return Policy",
    "Shipping Info",
    "Track Order",
  ];

  const promises = [
    { emoji: "✦", label: "100% Genuine Products" },
    { emoji: "⚡", label: "Fast 2–4 Day Delivery" },
    { emoji: "↩", label: "7-Day Easy Returns" },
    { emoji: "🔒", label: "Secure Payments" },
    { emoji: "📞", label: "24/7 Customer Support" },
  ];

  return (
    <footer className="bg-white border-t border-zinc-100 mt-16">

      {/* ── Top accent line ── */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent" />

      {/* ── Main Grid ── */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-12 md:pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* ── Col 1: Brand ── */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-5">
            <Link href="/" className="inline-block w-fit">
              <span className="text-2xl font-black tracking-tight text-zinc-900">NEXUS</span>
            </Link>

            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              Your trusted destination for premium smartphones, accessories,
              and the latest mobile technology.
            </p>

            <div className="w-8 h-0.5 bg-red-600 rounded-full" />

            {/* Contact */}
            <div className="flex flex-col gap-3">
              {contactInfo.map(({ icon: Icon, label, href }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                  {href ? (
                    <a href={href} className="text-xs text-zinc-500 hover:text-red-600 transition-colors duration-200">{label}</a>
                  ) : (
                    <span className="text-xs text-zinc-500">{label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Col 2: Shop by Brand ── */}
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-0.5 bg-red-600 rounded-full" />
              </div>
              <p className="text-sm font-black text-zinc-900 tracking-tight">Shop by Brand</p>
            </div>

            <ul className="flex flex-col gap-2.5">
              {shopLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="group flex items-center gap-1.5 text-sm text-zinc-500 hover:text-red-600 transition-colors duration-200 w-fit">
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-red-500 shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Policies ── */}
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-0.5 bg-red-600 rounded-full" />
              </div>
              <p className="text-sm font-black text-zinc-900 tracking-tight">Quick Info</p>
            </div>

            <ul className="flex flex-col gap-2.5">
              {policies.map((item) => (
                <li key={item}>
                  <Link href="#" className="group flex items-center gap-1.5 text-sm text-zinc-500 hover:text-red-600 transition-colors duration-200 w-fit">
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-red-500 shrink-0" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 4: Our Promise ── */}
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-0.5 bg-red-600 rounded-full" />
              </div>
              <p className="text-sm font-black text-zinc-900 tracking-tight">Our Promise</p>
            </div>

            <div className="flex flex-col gap-2.5">
              {promises.map(({ emoji, label }) => (
                <div key={label} className="flex items-center gap-2.5 group">
                  <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 group-hover:bg-red-50 group-hover:border-red-100 transition-colors duration-200">
                    <span className="text-xs">{emoji}</span>
                  </div>
                  <span className="text-xs text-zinc-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-zinc-100 bg-zinc-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-400 text-center sm:text-left">
            © {currentYear}{" "}
            <span className="text-zinc-700 font-bold">NEXUS</span>. All rights reserved.
          </p>
          <p className="text-xs text-zinc-400 text-center sm:text-right">
            Built by{" "}
            <span className="text-zinc-600 font-semibold">Himanshu Meena</span>{" "}
            &{" "}
            <span className="text-zinc-600 font-semibold">Ashibur Rehman</span>
          </p>
        </div>
      </div>
    </footer>
  );
}