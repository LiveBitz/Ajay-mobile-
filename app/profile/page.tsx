import React from "react";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  ShieldAlert, 
  LayoutDashboard, 
  ShoppingBag, 
  Settings, 
  LogOut,
  Fingerprint,
  Calendar,
  Lock,
  ArrowUpRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { signOut } from "@/lib/actions/auth-actions";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  const isAdmin = (await cookieStore).get("admin_access")?.value === "true";

  if (!user) {
    redirect("/login");
  }

  const userInitial = user.email?.[0].toUpperCase() || "C";
  const joinDate = new Date(user.created_at).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-zinc-50/50 pt-32 pb-20 px-4 md:px-8 lg:px-16">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Identity Card Orchestration */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[40px] border border-zinc-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="p-8 sm:p-10 text-center space-y-6">
                <div className="relative inline-flex mx-auto">
                  <div className="w-24 h-24 rounded-[32px] bg-brand/5 flex items-center justify-center border-4 border-white shadow-xl">
                    <span className="text-4xl font-black text-brand font-heading">{userInitial}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h1 className="text-xl font-black text-zinc-900 truncate px-4">
                    {user.email?.split('@')[0]}
                  </h1>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <Fingerprint className="w-3 h-3" />
                    ID: {user.id.slice(0, 8)}...
                  </p>
                </div>

                <div className="pt-6 border-t border-zinc-50 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[10px] font-black uppercase tracking-wider">Status</span>
                    <Badge className={cn(
                      "rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest",
                      isAdmin ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"
                    )}>
                      {isAdmin ? "Senior Curator" : "Standard Identity"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[10px] font-black uppercase tracking-wider">Joined</span>
                    <span className="text-xs font-bold text-zinc-900">{joinDate}</span>
                  </div>
                </div>

                <form action={signOut} className="w-full pt-4">
                  <Button 
                    type="submit"
                    variant="outline" 
                    className="w-full h-12 rounded-2xl border-zinc-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 font-black text-[10px] uppercase tracking-[0.2em] transition-all gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Secure Logout
                  </Button>
                </form>
              </div>
            </div>

            {/* Security Quick Actions */}
            <div className="bg-zinc-900 rounded-[32px] p-8 text-white space-y-6 shadow-2xl">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Lock className="w-5 h-5 text-zinc-300" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-widest">Admin Security</span>
               </div>
               <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                  Your administrative status is verified periodically using our 7014-shield protocol.
               </p>
               {!isAdmin && (
                 <Link href="/admin/entry" className="block w-full">
                    <Button className="w-full bg-white text-zinc-900 hover:bg-zinc-100 rounded-xl font-black text-[10px] uppercase tracking-widest h-11">
                      Unlock Clearance
                    </Button>
                 </Link>
               )}
            </div>
          </div>

          {/* Console Management Orchestration */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 px-4">Registry Orchestration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/admin" className="group">
                  <div className="bg-white p-8 rounded-[40px] border border-zinc-100 hover:border-brand/20 transition-all hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)] h-full space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-6 h-6 text-brand" />
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center group-hover:bg-brand/5 transition-colors">
                      <LayoutDashboard className="w-7 h-7 text-zinc-400 group-hover:text-brand" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="font-black text-xl text-zinc-900">Admin Console</h3>
                       <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                         Manage products, banners, and the category visual identity from a single orchestration module.
                       </p>
                    </div>
                  </div>
                </Link>

                <Link href="/cart" className="group">
                  <div className="bg-white p-8 rounded-[40px] border border-zinc-100 hover:border-brand/20 transition-all hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)] h-full space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-6 h-6 text-brand" />
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center group-hover:bg-brand/5 transition-colors">
                      <ShoppingBag className="w-7 h-7 text-zinc-400 group-hover:text-brand" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="font-black text-xl text-zinc-900">Order Registry</h3>
                       <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                         Review your curated selections and finalize the acquisition via our high-fidelity checkout.
                       </p>
                    </div>
                  </div>
                </Link>

                <div className="bg-white/50 p-8 rounded-[40px] border border-zinc-100/50 border-dashed space-y-6 relative opacity-60">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center">
                    <Settings className="w-7 h-7 text-zinc-300" />
                  </div>
                  <div className="space-y-2">
                     <h3 className="font-black text-xl text-zinc-300">Identity Config</h3>
                     <p className="text-zinc-400 text-sm font-medium leading-relaxed italic">
                       Professional configuration settings for the curator identity (Coming Soon).
                     </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Orchestration Timeline */}
            <div className="bg-white rounded-[40px] border border-zinc-100 p-8 sm:p-10 space-y-8">
               <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand" />
                  Registry Verified
               </h3>
               <div className="space-y-6 px-4">
                  <div className="flex gap-4 relative">
                    <div className="absolute top-0 left-2 w-px h-full bg-zinc-100" />
                    <div className="relative z-10 w-4 h-4 rounded-full bg-brand border-4 border-white shadow-sm mt-1" />
                    <div className="space-y-1">
                      <p className="text-xs font-black text-zinc-900">Identity Registered Successfully</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Email verification sequence complete</p>
                    </div>
                  </div>
                  <div className="flex gap-4 relative">
                    <div className="relative z-10 w-4 h-4 rounded-full bg-zinc-200 border-4 border-white shadow-sm mt-1" />
                    <div className="space-y-1">
                      <p className="text-xs font-black text-zinc-400 italic">No recent order history recorded</p>
                      <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-tight">Awaiting first curator acquisition</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
