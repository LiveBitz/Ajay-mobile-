"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Lock, Loader2, ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { updatePassword } from "@/lib/actions/password-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function PasswordStrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;

  const colors = ["bg-zinc-200", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div className="space-y-1.5 mt-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < strength ? colors[strength] : "bg-zinc-100"
            }`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-medium ${strength <= 1 ? "text-red-500" : strength === 2 ? "text-orange-500" : strength === 3 ? "text-yellow-600" : "text-green-600"}`}>
        {labels[strength]}
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updatePassword(formData);

    if (result?.error) {
      toast({
        title: "Could not update password",
        description: result.error,
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      setIsSuccess(true);
      setIsLoading(false);
      // Redirect to login after 3 seconds
      setTimeout(() => router.push("/login"), 3000);
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
              {isSuccess ? "Password updated!" : "Set new password"}
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              {isSuccess
                ? "Redirecting you to sign in..."
                : "Choose a strong password for your account"}
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
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
                      New password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 pl-10 pr-11 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:bg-white text-sm text-zinc-900 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <PasswordStrengthBar password={password} />

                    {/* Requirements hint */}
                    <ul className="space-y-0.5 mt-1.5">
                      {[
                        { label: "At least 8 characters", ok: password.length >= 8 },
                        { label: "One uppercase letter", ok: /[A-Z]/.test(password) },
                        { label: "One number", ok: /[0-9]/.test(password) },
                      ].map(({ label, ok }) => (
                        <li key={label} className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${ok ? "text-green-600" : "text-zinc-400"}`}>
                          <CheckCircle2 className={`w-3 h-3 ${ok ? "text-green-500" : "text-zinc-300"}`} />
                          {label}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700">
                      Confirm new password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        required
                        placeholder="Repeat your password"
                        className="h-12 pl-10 pr-11 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:bg-white text-sm text-zinc-900 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
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
                        Updating...
                      </>
                    ) : (
                      <>
                        Update password
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
                className="flex flex-col items-center gap-4 py-4"
              >
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-sm text-zinc-500 text-center">
                  Your password has been reset. You&apos;ll be redirected to sign in shortly.
                </p>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full h-11 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-sm gap-2"
                >
                  Sign in now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-zinc-400 mt-6">Your data is safe with us 🔒</p>
      </motion.div>
    </div>
  );
}
