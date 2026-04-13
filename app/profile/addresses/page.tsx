"use client"

import React from "react";
import { 
  ArrowLeft, 
  ShieldCheck,
  MapPin,
  ChevronRight,
  Info,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AddressesPage() {
  return (
    <div className="min-h-screen bg-zinc-50/50 pt-8 md:pt-0 pb-20 px-4 md:px-8 lg:px-16">
      <div className="container mx-auto max-w-2xl">
        
        {/* Navigation Registry */}
        <div className="flex items-center gap-4 mb-8 group">
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-100">
              <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-brand transition-colors" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            <Link href="/profile" className="hover:text-brand transition-colors">Profile</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-900">Managed Addresses</span>
          </div>
        </div>

        {/* Info Card - Redirect Notice */}
        <div className="bg-gradient-to-br from-brand/10 to-brand/5 rounded-[40px] border border-brand/20 p-8 sm:p-12 space-y-6 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
              <Info className="w-7 h-7 text-brand" />
            </div>
            <div className="flex-1 space-y-3">
              <h1 className="text-2xl font-black text-zinc-900 uppercase">
                Enhanced Address Management
              </h1>
              <p className="text-zinc-600 font-medium leading-relaxed">
                We've integrated address management directly into your profile page for a seamless experience. You can now add, edit, and manage all your delivery addresses without leaving the profile dashboard.
              </p>
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-tight">
                No navigation needed — everything is in one place for your convenience.
              </p>
            </div>
          </div>

          <Link href="/profile" className="block">
            <Button 
              className="w-full h-13 gap-2 rounded-2xl bg-brand hover:bg-brand/90 text-white font-black text-xs uppercase tracking-[0.1em] shadow-lg"
            >
              Go to Profile & Manage Addresses
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-2">What You Can Do</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[32px] border border-zinc-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-brand" />
              </div>
              <h3 className="font-black text-sm text-zinc-900">Add Addresses</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Register multiple delivery locations with complete details including name, phone, street, and postal information.</p>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-zinc-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="font-black text-sm text-zinc-900">Set Primary</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Designate a default address to be automatically selected during checkout for faster acquisition processing.</p>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-zinc-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="font-black text-sm text-zinc-900">Edit Details</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Update recipient name, phone number, or address information anytime with inline editing.</p>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-zinc-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-black text-sm text-zinc-900">Remove Addresses</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Securely delete old or unused addresses from your registry with a single click.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center space-y-4">
          <h2 className="text-xl font-black text-zinc-900 uppercase">Ready to Manage Addresses?</h2>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            Head to your profile page where you'll find the complete address management interface integrated seamlessly with your account details.
          </p>
          <Link href="/profile">
            <Button 
              size="lg"
              className="gap-2 rounded-2xl bg-brand hover:bg-brand/90 text-white font-black text-xs uppercase tracking-[0.1em]"
            >
              Go to Profile
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
