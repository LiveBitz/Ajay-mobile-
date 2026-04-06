import React from "react";
import Link from "next/link";
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-50 border-t border-zinc-200 mt-20 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Column 1: Brand */}
        <div className="flex flex-col gap-6">
          <Link href="/" className="text-3xl font-bold tracking-tighter text-brand">
            SOULED
          </Link>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
            Premium streetwear and casual clothing for the urban adventurer. Join the movement and redefine your style.
          </p>
          <div className="flex gap-4">
            <Link href="https://instagram.com" className="p-2 rounded-full bg-white hover:bg-brand hover:text-white transition-all shadow-sm">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="https://twitter.com" className="p-2 rounded-full bg-white hover:bg-brand hover:text-white transition-all shadow-sm">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="https://facebook.com" className="p-2 rounded-full bg-white hover:bg-brand hover:text-white transition-all shadow-sm">
              <Facebook className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="flex flex-col gap-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900 font-heading">
            Quick Links
          </h4>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-brand transition-colors">Home</Link>
            <Link href="/category/men" className="hover:text-brand transition-colors">Men</Link>
            <Link href="/category/watches" className="hover:text-brand transition-colors">Watches</Link>
            <Link href="/category/perfumes" className="hover:text-brand transition-colors">Perfumes</Link>
            <Link href="/category/accessories" className="hover:text-brand transition-colors">Accessories</Link>
          </div>
        </div>

        {/* Column 3: Help */}
        <div className="flex flex-col gap-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900 font-heading">
            Help & Support
          </h4>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <Link href="/faq" className="hover:text-brand transition-colors">FAQs</Link>
            <Link href="/contact" className="hover:text-brand transition-colors">Contact Us</Link>
            <Link href="/shipping" className="hover:text-brand transition-colors">Shipping Policy</Link>
            <Link href="/returns" className="hover:text-brand transition-colors">Return Policy</Link>
          </div>
        </div>

        {/* Column 4: Contact Info */}
        <div className="flex flex-col gap-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900 font-heading">
            Get in Touch
          </h4>
          <div className="flex flex-col gap-4 text-sm text-muted-foreground">
            <div className="flex gap-3 items-start">
              <Mail className="w-5 h-5 text-zinc-700 shrink-0" />
              <span>support@souled.store</span>
            </div>
            <div className="flex gap-3 items-start">
              <Phone className="w-5 h-5 text-zinc-700 shrink-0" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex gap-3 items-start">
              <MapPin className="w-5 h-5 text-zinc-700 shrink-0" />
              <span>Mumbai, Maharashtra, India</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 md:px-8 lg:px-16 pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <p>© {currentYear} SOULED Clothing Store. All rights reserved.</p>
        <div className="flex gap-4">
          <span className="font-semibold uppercase tracking-widest text-[10px]">VISA</span>
          <span className="font-semibold uppercase tracking-widest text-[10px]">MASTERCARD</span>
          <span className="font-semibold uppercase tracking-widest text-[10px]">UPI</span>
          <span className="font-semibold uppercase tracking-widest text-[10px]">PAYPAL</span>
        </div>
      </div>
    </footer>
  );
}
