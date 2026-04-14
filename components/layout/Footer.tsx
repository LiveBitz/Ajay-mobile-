import React from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  LockKeyhole,
  Headset,
} from "lucide-react";

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
    { icon: ShieldCheck, label: "100% Genuine Products" },
    { icon: Truck, label: "Fast 2-4 Day Delivery" },
    { icon: RotateCcw, label: "7-Day Easy Returns" },
    { icon: LockKeyhole, label: "Secure Payments" },
    { icon: Headset, label: "24/7 Customer Support" },
  ];

  return (
    <footer className="relative mt-16 overflow-hidden" style={{ backgroundColor: "#0a0a0a" }}>

      {/* Layered background for depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-28 -left-28 w-[440px] h-[440px] rounded-full blur-[120px]"
          style={{ backgroundColor: "rgba(220,38,38,0.12)" }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-[380px] h-[380px] rounded-full blur-[100px]"
          style={{ backgroundColor: "rgba(153,27,27,0.1)" }}
        />
      </div>

      {/* ── Top accent line ── */}
      <div className="relative z-10 h-0.5 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60" />

      {/* ── Main Grid ── */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8 pt-12 md:pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* ── Col 1: Brand ── */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-5">
            <Link href="/" className="inline-block w-fit">
              <span className="text-2xl font-black tracking-tight text-zinc-100">NEXUS</span>
            </Link>

            <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
              Your trusted destination for premium smartphones, accessories,
              and the latest mobile technology.
            </p>

            <div className="w-8 h-0.5 bg-red-600 rounded-full" />

            {/* Contact */}
            <div className="flex flex-col gap-3">
              {contactInfo.map(({ icon: Icon, label, href }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-zinc-300" />
                  </div>
                  {href ? (
                    <a href={href} className="text-xs text-zinc-400 hover:text-red-400 transition-colors duration-200">{label}</a>
                  ) : (
                    <span className="text-xs text-zinc-400">{label}</span>
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
              <p className="text-sm font-black text-zinc-100 tracking-tight">Shop by Brand</p>
            </div>

            <ul className="flex flex-col gap-2.5">
              {shopLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="group flex items-center gap-1.5 text-sm text-zinc-400 hover:text-red-400 transition-colors duration-200 w-fit">
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
              <p className="text-sm font-black text-zinc-100 tracking-tight">Quick Info</p>
            </div>

            <ul className="flex flex-col gap-2.5">
              {policies.map((item) => (
                <li key={item}>
                  <Link href="#" className="group flex items-center gap-1.5 text-sm text-zinc-400 hover:text-red-400 transition-colors duration-200 w-fit">
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
              <p className="text-sm font-black text-zinc-100 tracking-tight">Our Promise</p>
            </div>

            <div className="flex flex-col gap-2.5">
              {promises.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="group flex items-center gap-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/30 px-2.5 py-2 transition-colors duration-200 hover:border-red-900/70 hover:bg-red-950/20"
                >
                  <div className="w-7 h-7 rounded-lg bg-zinc-900/90 border border-zinc-800 flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:border-red-900/80 group-hover:bg-red-950/30">
                    <Icon className="w-3.5 h-3.5 text-zinc-300 transition-colors duration-200 group-hover:text-red-300" />
                  </div>
                  <span className="text-xs text-zinc-400 transition-colors duration-200 group-hover:text-zinc-200">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="relative z-10 border-t border-zinc-800/80 bg-black/25 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-500 text-center sm:text-left">
            © {currentYear}{" "}
            <span className="text-zinc-200 font-bold">NEXUS</span>. All rights reserved.
          </p>
          <p className="text-xs text-zinc-500 text-center sm:text-right">
            Built by{" "}
            <span className="text-zinc-300 font-semibold">Himanshu Meena</span>{" "}
            &{" "}
            <span className="text-zinc-300 font-semibold">Ashibur Rehman</span>
          </p>
        </div>
      </div>
    </footer>
  );
}