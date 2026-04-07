import React from "react";
import { 
  LogOut,
  MapPin,
  ShoppingBag,
  Settings,
  Mail,
  Calendar
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { signOut } from "@/lib/actions/auth-actions";
import { AddressesManager } from "@/components/profile/AddressesManager";
import { OrderHistory } from "@/components/profile/OrderHistory";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userInitial = user.email?.[0].toUpperCase() || "U";
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const userName = user.email?.split('@')[0] || "User";

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto max-w-5xl">
        
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand to-brand/80 flex items-center justify-center text-white text-2xl font-black shrink-0">
                {userInitial}
              </div>
              
              {/* User Info */}
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-black text-zinc-900 capitalize">
                  {userName}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-zinc-400" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span>Joined {joinDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <form action={signOut}>
              <Button 
                type="submit"
                variant="outline"
                className="md:w-auto w-full gap-2 rounded-lg border-zinc-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-semibold text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </form>
          </div>

          {/* Divider */}
          <div className="h-px bg-zinc-200" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar - Quick Actions */}
          <div className="lg:col-span-1">
            <div className="space-y-4 lg:sticky lg:top-24">
              {/* Quick Links */}
              <div className="bg-zinc-50 rounded-xl p-6 space-y-3">
                <h3 className="font-semibold text-sm text-zinc-900">Quick Links</h3>
                <Link href="/cart" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-100 transition-colors group">
                  <ShoppingBag className="w-4 h-4 text-zinc-400 group-hover:text-brand" />
                  <span className="text-sm text-zinc-600 group-hover:text-brand font-medium">View Cart</span>
                </Link>
                <Link href="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-100 transition-colors group">
                  <ShoppingBag className="w-4 h-4 text-zinc-400 group-hover:text-brand" />
                  <span className="text-sm text-zinc-600 group-hover:text-brand font-medium">Continue Shopping</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Addresses Section */}
            <section>
              <AddressesManager />
            </section>

            {/* Order History Section */}
            <section>
              <OrderHistory />
            </section>

            {/* Account Info Card */}
            <div className="bg-zinc-50 rounded-xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-brand/10 rounded-lg">
                  <Settings className="w-5 h-5 text-brand" />
                </div>
                <h2 className="text-lg font-bold text-zinc-900">Account Information</h2>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-medium text-zinc-900">{user.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Account Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <Badge className="bg-emerald-50 text-emerald-700 rounded-full px-3 py-0.5 text-xs font-semibold border border-emerald-200">
                      Active
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Member Since</p>
                  <p className="text-sm font-medium text-zinc-900">{joinDate}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Account Type</p>
                  <p className="text-sm font-medium text-zinc-900">Standard User</p>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 md:p-8">
              <h2 className="text-lg font-bold text-zinc-900 mb-6">Need Help?</h2>
              <div className="space-y-3">
                <p className="text-sm text-zinc-600 leading-relaxed">
                  If you have any questions about your account or need assistance, please don't hesitate to reach out to our support team.
                </p>
                <Button 
                  variant="outline"
                  className="gap-2 rounded-lg border-zinc-200 hover:bg-brand/5 hover:border-brand/20 font-medium text-sm"
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
