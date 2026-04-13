"use client";

import React, { useState } from "react";
import { 
  LogIn, 
  Mail, 
  Lock, 
  ArrowRight, 
  Store, 
  Loader2,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { signIn } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);

    if (result?.error) {
      toast({
        title: "Identity Verification Failure",
        description: result.error,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 pt-8 md:pt-0">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[48px] border border-zinc-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="p-8 sm:p-12 space-y-10">
            {/* Branding Orchestration */}
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand/5 rounded-3xl mb-4">
                <Store className="w-8 h-8 text-brand" />
              </div>
              <h1 className="text-3xl font-extrabold font-heading tracking-tight text-zinc-900">
                Identity Console
              </h1>
              <p className="text-zinc-500 font-medium text-sm">
                Authenticate your session to access the <span className="text-zinc-900 font-bold">Orchestration Console</span>.
              </p>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                {/* Email Orchestration */}
                <div className="space-y-2.5">
                  <Label 
                    htmlFor="email"
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1"
                  >
                    Curator Identity (Email)
                  </Label>
                  <div className="relative group/input">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within/input:text-brand transition-colors" />
                    <Input 
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="e.g. curator@flagship.com"
                      className="h-14 pl-12 rounded-2xl border-zinc-100 bg-zinc-50/50 text-sm font-bold text-zinc-900 focus:bg-white transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Password Orchestration */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <Label 
                      htmlFor="password"
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400"
                    >
                      Secure Key (Password)
                    </Label>
                  </div>
                  <div className="relative group/input">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within/input:text-brand transition-colors" />
                    <Input 
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="h-14 pl-12 rounded-2xl border-zinc-100 bg-zinc-50/50 text-sm font-bold text-zinc-900 focus:bg-white transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 font-bold text-sm uppercase tracking-widest gap-2 shadow-lg shadow-zinc-200 active:scale-95 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying Identity...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Authenticate Session
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Navigation Strategy */}
            <div className="pt-6 border-t border-zinc-50 text-center space-y-4">
              <p className="text-zinc-500 text-xs font-semibold">
                New curator? 
                <Link 
                  href="/signup" 
                  className="ml-2 text-brand font-black hover:underline underline-offset-4"
                >
                  Create Registry →
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Security Overlay */}
        <div className="mt-8 flex items-center justify-center gap-2 text-zinc-400">
           <AlertCircle className="w-3 h-3" />
           <span className="text-[9px] font-black uppercase tracking-widest">Flagship Security Protocol Active</span>
        </div>
      </motion.div>
    </div>
  );
}
