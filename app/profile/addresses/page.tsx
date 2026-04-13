"use client"

import React from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AddressesManager } from "@/components/profile/AddressesManager";

export default function AddressesPage() {
  return (
    <div className="min-h-screen bg-white pt-8 md:pt-0 pb-20 px-4 md:px-8 lg:px-16">
      <div className="container mx-auto max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-zinc-100 w-10 h-10"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-500" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-zinc-900">My Addresses</h1>
          </div>

          <Button
            className="gap-2 h-10 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-sm px-4"
          >
            <Plus className="w-4 h-4" />
            Add Address
          </Button>
        </div>

        {/* Addresses Manager */}
        <AddressesManager />

      </div>
    </div>
  );
}
