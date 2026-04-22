"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";

const HIDDEN_NAVBAR_ROUTES = new Set(["/login", "/signup", "/forgot-password", "/reset-password"]);

export function ConditionalNavbar({ categoryNames }: { categoryNames: string[] }) {
  const pathname = usePathname();

  if (pathname && HIDDEN_NAVBAR_ROUTES.has(pathname)) {
    return null;
  }

  return <Navbar categoryNames={categoryNames} />;
}