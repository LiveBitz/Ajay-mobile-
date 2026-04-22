"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Mail, Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { sendPasswordReset } from "@/lib/actions/password-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await sendPasswordReset(formData);

    if (result?.error) {
      toast({
        title: "Something went wrong",
        description: result.error,
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      setIsSuccess(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-zinc-50 p-4 pt-8 md:pt-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-white border border-zinc-100 rounded-3xl shadow-xl p-8 md:p-10">

          {/* Logo + Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex mb-4">
              <Image
                src="/images/cropped_circle_image.png"
                alt="Priya Mobile Park"
                width={64}
                height={64}
                className="rounded-full object-cover"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">
              {isSuccess ? "Check your inbox" : "Reset your password"}
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              {isSuccess
                ? `We sent a reset link to ${email}`
                : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-zinc-700">
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 pl-10 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:bg-white text-sm text-zinc-900 transition-all"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-sm gap-2 transition-all active:scale-95"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send reset link
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-4 py-2"
              >
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Click the link in the email to reset your password. If you don&apos;t see it, check your spam folder.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => { setIsSuccess(false); setEmail(""); }}
                  className="w-full h-11 rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium text-sm gap-2"
                >
                  Try a different email
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-zinc-100 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to sign in
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-400 mt-6">Your data is safe with us 🔒</p>
      </motion.div>
    </div>
  );
}
