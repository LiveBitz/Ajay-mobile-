"use client";

import React, { useState } from "react";
import { 
  ShieldAlert, 
  Key, 
  ArrowRight, 
  Loader2,
  Lock,
  History,
  ShieldCheck
} from "lucide-react";
import { verifyAdminPasscode } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminEntryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [passcode, setPasscode] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await verifyAdminPasscode(formData);

    if (result?.error) {
      toast({
        title: "Access Logic Failure",
        description: result.error,
        variant: "destructive",
      });
      setIsLoading(false);
      setPasscode("");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <div className="bg-white rounded-[56px] border border-zinc-100 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] overflow-hidden relative">
          {/* Decorative Security Background */}
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <ShieldAlert className="w-64 h-64 text-zinc-900" />
          </div>

          <div className="p-10 sm:p-16 space-y-12 relative z-10">
            {/* Branding Orchestration */}
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-900 rounded-[32px] shadow-xl shadow-zinc-200 mb-2">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold font-heading tracking-tight text-zinc-900">
                  Curator Access
                </h1>
                <p className="text-zinc-500 font-medium text-base">
                  Identify your administrative status by providing the <span className="text-zinc-900 font-bold underline decoration-brand/30">Secure Orchestration Key</span>.
                </p>
              </div>
            </div>

            {/* Passcode Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <Label
                  htmlFor="passcode"
                  className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400 px-2"
                >
                  Administrative Key
                </Label>
                <div className="relative group/input">
                  <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within/input:text-zinc-900 transition-colors" />
                  <Input
                    id="passcode"
                    name="passcode"
                    type="password"
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="••••••••"
                    className="h-20 pl-14 text-3xl tracking-[1em] font-black rounded-[28px] border-zinc-100 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-100 transition-all shadow-sm placeholder:text-zinc-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Button 
                  type="submit"
                  disabled={isLoading || passcode.length < 8}
                  className="w-full h-18 rounded-[28px] bg-zinc-900 text-white hover:bg-zinc-800 font-bold text-base uppercase tracking-widest gap-3 shadow-2xl shadow-zinc-300 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Decrypting Access...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      Authorize Access
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Security Log Strategy */}
            <div className="pt-8 border-t border-zinc-50 flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-zinc-400">
                <History className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Session strictly monitored</span>
              </div>
              <div className="flex items-center gap-1.5 py-1 px-3 bg-zinc-50 rounded-full border border-zinc-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase text-zinc-500">Security Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Support Orchestration */}
        <p className="mt-8 text-center text-zinc-400 text-xs font-semibold">
          Lost your key? Contact the <span className="text-zinc-900 underline underline-offset-4 cursor-pointer hover:text-brand transition-colors">Security Orchestrator</span>.
        </p>
      </motion.div>
    </div>
  );
}
