"use client";

import { LogOut, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { signOut } from "@/lib/actions/auth-actions";

function LogoutButtonContent() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-5 h-11 text-sm font-semibold text-zinc-100 shadow-sm transition-all hover:border-red-400/70 hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-70"
      aria-disabled={pending}
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
      {pending ? "Logging out..." : "Logout"}
    </button>
  );
}

export function LogoutButton() {
  return (
    <form action={signOut}>
      <LogoutButtonContent />
    </form>
  );
}