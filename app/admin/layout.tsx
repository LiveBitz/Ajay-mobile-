import React from "react";
import { 
  Menu,
  Settings,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminSidebarContent } from "@/components/admin/AdminSidebarContent";
import { MobileNav } from "@/components/admin/MobileNav";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-zinc-50/20 antialiased">
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:flex w-72 border-r border-zinc-100 bg-white flex-col sticky top-0 h-screen shrink-0 shadow-sm z-20">
        <AdminSidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen relative">
        {/* Responsive Header */}
        <header className="h-16 lg:h-24 border-b border-zinc-100 bg-white/80 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-8 lg:px-12 flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-3 sm:gap-6">
             {/* Mobile Navigation Toggle */}
             <MobileNav />
             
             <div className="hidden sm:block">
               <h2 className="text-[9px] font-extrabold text-brand uppercase tracking-[0.2em] px-1">Management</h2>
               <p className="text-sm font-bold text-zinc-900 tracking-tight">Portal Console</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-8">
            <div className="hidden md:flex items-center gap-1.5 bg-zinc-50 border border-zinc-100 px-4 py-2 rounded-2xl">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Server: AWS-AP-1</p>
            </div>

            <Button variant="ghost" size="icon" className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl hover:bg-zinc-50 relative group border border-zinc-100 sm:border-transparent">
              <Bell className="w-5 h-5 text-zinc-400 group-hover:text-brand transition-colors" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand rounded-full border-2 border-white shadow-sm" />
            </Button>
            
            <div className="h-8 w-px bg-zinc-100 hidden sm:block" />

            <div className="flex items-center gap-3 sm:gap-4 group cursor-pointer p-0.5 rounded-2xl transition-all">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-extrabold text-zinc-900 leading-tight">Admin User</p>
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">Superuser</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-zinc-500 shadow-sm overflow-hidden group-hover:border-brand/30 transition-all ring-2 ring-transparent group-hover:ring-brand/10">
                <img 
                  src="https://api.dicebear.com/7.x/shapes/svg?seed=Admin&backgroundColor=f4f4f5" 
                  alt="Admin" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Page */}
        <section className="flex-1 overflow-x-hidden">
          <div className="p-4 sm:p-8 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
