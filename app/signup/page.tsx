"use client";

import React, { useState } from "react";
import Image from "next/image";
import { UserPlus, Mail, Lock, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { signUp } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { motion } from "framer-motion";

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: "Weak",   color: "bg-red-500" };
  if (score <= 3) return { score, label: "Fair",   color: "bg-yellow-500" };
  if (score === 4) return { score, label: "Good",  color: "bg-blue-500" };
  return             { score, label: "Strong", color: "bg-emerald-500" };
}

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData);

    if (result?.error) {
      toast({
        title: "Something went wrong",
        description: result.error,
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      setIsSuccess(true);
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center bg-zinc-50 p-4 pt-8 md:pt-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white border border-zinc-100 rounded-3xl shadow-xl p-8 md:p-10 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-50 rounded-full p-6 mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Account created!</h1>
          <p className="text-zinc-500 text-sm leading-relaxed mb-8">
            We&apos;ve sent a verification link to your email address. Please confirm it to get started.
          </p>
          <Link href="/login" className="block">
            <Button className="w-full h-12 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-sm gap-2">
              Sign in now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-zinc-900">Create your account</h1>
            <p className="text-zinc-500 text-sm mt-1">Join Priya Mobile Park and start shopping</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-zinc-700">
                Full name
              </Label>
              <div className="relative">
                <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="h-12 pl-10 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:bg-white text-sm text-zinc-900 transition-all"
                />
              </div>
            </div>

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
                  className="h-12 pl-10 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:bg-white text-sm text-zinc-900 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 pl-10 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:bg-white text-sm text-zinc-900 transition-all"
                />
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.score ? strength.color : "bg-zinc-200"}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-zinc-500">
                      Strength: <span className="font-semibold">{strength.label}</span>
                      {strength.score < 3 && " — add uppercase letters, numbers, or symbols"}
                    </p>
                  </div>
                )}
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
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-zinc-100 text-center">
            <p className="text-sm text-zinc-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-zinc-900 hover:underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-400 mt-6">Your data is safe with us 🔒</p>
      </motion.div>
    </div>
  );
}
