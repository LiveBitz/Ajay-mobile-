"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, PackageOpen } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function CartSheet() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, isOpen, setIsOpen } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-white border-l shadow-2xl">
        <SheetHeader className="p-6 border-b bg-zinc-50/50">
          <SheetTitle className="flex items-center gap-3 text-xl font-black italic tracking-tighter text-zinc-950">
            <div className="bg-zinc-950 p-2 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            YOUR COLLECTIVE
            {totalItems > 0 && (
              <span className="text-[11px] font-black not-italic bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full ml-auto">
                {totalItems} ITEMS
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-zinc-50 flex items-center justify-center animate-pulse">
                <PackageOpen className="w-10 h-10 text-zinc-200" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-zinc-950 tracking-tight uppercase">Collective is Empty</h3>
                <p className="text-sm text-white font-bold tracking-tight max-w-[200px]">
                  Your curation awaits. Start exploring the latest drops.
                </p>
              </div>
              <Button 
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-white text-zinc-950 px-8 py-6 font-black uppercase tracking-widest text-[10px] hover:bg-zinc-50 transition-colors border border-zinc-200"
              >
                Start Exploring
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="group relative flex gap-5 animate-in fade-in slide-in-from-right-4 duration-500">
                    {/* Item Image */}
                    <div className="relative w-24 h-32 rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" quality={75} loading="lazy" />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col py-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-black text-zinc-950 line-clamp-1 leading-tight tracking-tight uppercase">
                          {item.name}
                        </h4>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-zinc-300 hover:text-rose-500 transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {item.size && (
                          <span className="text-[9px] font-black bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full uppercase tracking-widest">
                            {item.size}
                          </span>
                        )}
                        {item.color && (
                          <div className="flex items-center gap-1.5 bg-zinc-100 px-2 py-0.5 rounded-full">
                            <span 
                              className="w-2 h-2 rounded-full border border-zinc-200" 
                              style={{ backgroundColor: item.color.toLowerCase() }} 
                            />
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                              {item.color}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center bg-zinc-50 border border-zinc-100 rounded-full px-1.5 py-1">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-950 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-black text-zinc-950">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-950 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-black text-zinc-950">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="p-8 border-t flex-col bg-white">
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Subtotal</span>
                <span className="text-lg font-black text-zinc-950 tracking-tighter italic">₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
              
              <Separator className="bg-zinc-100" />

              <Link href="/checkout" className="w-full" onClick={() => setIsOpen(false)}>
                <Button className="w-full h-16 rounded-[2rem] bg-zinc-950 hover:bg-zinc-800 text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-zinc-200 transition-all active:scale-95 group gap-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed" disabled={items.length === 0}>
                  Secure Checkout
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link href="/cart" className="block w-full" onClick={() => setIsOpen(false)}>
                <Button 
                  variant="outline"
                  className="w-full h-14 rounded-full border-zinc-100 text-zinc-400 font-black uppercase text-[10px] tracking-[0.15em] hover:bg-zinc-50 hover:text-zinc-950 transition-all active:scale-95"
                >
                  View Full Curation
                </Button>
              </Link>

              <p className="text-[9px] text-center text-zinc-400 font-bold uppercase tracking-widest mt-2">
                Logistics and taxes recalibrated at checkout
              </p>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
