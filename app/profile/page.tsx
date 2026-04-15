import React from "react";
import {
  MapPin,
  ShoppingBag,
  Settings,
  Mail,
  Calendar,
  Store,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AddressesManager } from "@/components/profile/AddressesManager";
import { OrderHistory } from "@/components/profile/OrderHistory";
import { LogoutButton } from "@/components/profile/LogoutButton";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userInitial = user.email?.[0].toUpperCase() || "U";
  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const userName = user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-white pt-8 md:pt-0 pb-20 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto max-w-5xl">

        {/* User Banner */}
        <div className="bg-zinc-900 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-black shrink-0"
                style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}
              >
                {userInitial}
              </div>

              {/* Info */}
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-white capitalize">{userName}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Joined {joinDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout */}
            <LogoutButton />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-zinc-900 mb-4">Quick links</h3>
                <div className="space-y-1">
                  <Link
                    href="/cart"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors group"
                  >
                    <ShoppingBag className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700" />
                    <span className="text-sm font-medium text-zinc-600 group-hover:text-zinc-900">
                      View Cart
                    </span>
                  </Link>
                  <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors group"
                  >
                    <Store className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700" />
                    <span className="text-sm font-medium text-zinc-600 group-hover:text-zinc-900">
                      Continue Shopping
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Addresses */}
            <section className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="w-4 h-4 text-zinc-400" />
                <h2 className="text-base font-bold text-zinc-900">Address Book</h2>
              </div>
              <AddressesManager />
            </section>

            {/* Order History */}
            <section className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <ShoppingBag className="w-4 h-4 text-zinc-400" />
                <h2 className="text-base font-bold text-zinc-900">Order History</h2>
              </div>
              <OrderHistory />
            </section>

            {/* Account Details */}
            <section className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Settings className="w-4 h-4 text-zinc-400" />
                <h2 className="text-base font-bold text-zinc-900">Account Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Email Address
                  </p>
                  <p className="text-sm font-medium text-zinc-900">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Account Status
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-emerald-700">Active</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Member Since
                  </p>
                  <p className="text-sm font-medium text-zinc-900">{joinDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Account Type
                  </p>
                  <p className="text-sm font-medium text-zinc-900">Standard</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
