"use client";

import React, { useState } from "react";
import { 
  UserPlus, 
  Mail, 
  Lock, 
  ArrowRight, 
  Store, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { signUp } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData);

    if (result?.error) {
      toast({
        title: "Registration Strategy Failure",
        description: result.error,
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      setIsSuccess(true);
      toast({
        title: "Registry Entry Created",
        description: "Please verify your email to synchronize your session.",
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center space-y-8 bg-white rounded-[48px] border border-zinc-100 p-12 shadow-2xl"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-50 rounded-[40px]">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold font-heading tracking-tight text-zinc-900">Registration Complete</h1>
            <p className="text-zinc-500 font-medium leading-relaxed">
              We&apos;ve sent a verification link to your identity address. 
              Please confirm to synchronize your <span className="text-zinc-900 font-bold">Curator Session</span>.
            </p>
          </div>
          <Link href="/login" className="block w-full">
            <Button className="w-full h-14 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 font-bold text-sm uppercase tracking-widest gap-2">
              Proceed to Identification
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4">
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
                <UserPlus className="w-8 h-8 text-brand" />
              </div>
              <h1 className="text-3xl font-extrabold font-heading tracking-tight text-zinc-900">
                Curator Registry
              </h1>
              <p className="text-zinc-500 font-medium text-sm">
                 Establish your flagship <span className="text-zinc-900 font-bold underline decoration-brand/30">Registry Identity</span>.
              </p>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                {/* Full Name Orchestration */}
                <div className="space-y-2.5">
                  <Label 
                    htmlFor="name"
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1"
                  >
                    Full Name
                  </Label>
                  <div className="relative group/input">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within/input:text-brand transition-colors" />
                    <Input 
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      className="h-14 pl-12 rounded-2xl border-zinc-100 bg-zinc-50/50 text-sm font-bold text-zinc-900 focus:bg-white transition-all shadow-sm"
                    />
                  </div>
                </div>

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
                  <Label 
                    htmlFor="password"
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1"
                  >
                    Secure Key (Password)
                  </Label>
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
                    Creating Registry...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Establish Registry
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Navigation Strategy */}
            <div className="pt-6 border-t border-zinc-50 text-center space-y-4">
              <p className="text-zinc-500 text-xs font-semibold">
                Already registered? 
                <Link 
                  href="/login" 
                  className="ml-2 text-brand font-black hover:underline underline-offset-4"
                >
                  Identitify Session →
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
