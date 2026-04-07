"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronRight, LogIn, HelpCircle, PhoneCall, LogOut, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { CartSheet } from "@/components/cart/CartSheet";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/actions/auth-actions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Men", href: "/category/men" },
  { name: "Watches", href: "/category/watches" },
  { name: "Perfumes", href: "/category/perfumes" },
  { name: "Accessories", href: "/category/accessories" },
];

export function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { totalItems, setIsOpen: setOpenCart } = useCart();
  const { items: wishlistItems } = useWishlist();
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Initial user fetch
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  // Search effect
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error("[SEARCH_ERROR]", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-white/80 backdrop-blur-md py-3 shadow-sm border-zinc-200"
          : "bg-white py-4 border-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 lg:px-16 flex items-center justify-between">
        {/* Mobile Menu */}
        <div className="flex items-center md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 rounded-full hover:bg-zinc-100">
                <Menu className="w-6 h-6 text-zinc-950" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0 flex flex-col bg-white border-r">
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="text-2xl font-bold tracking-tighter text-zinc-950 flex items-center justify-between">
                  MENU
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto">
                {/* Categories */}
                <div className="p-4 py-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[2px] ml-2">Categories</span>
                  <div className="mt-2 flex flex-col">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between w-full p-4 rounded-xl hover:bg-zinc-50 transition-colors group"
                      >
                        <span className="text-lg font-bold text-zinc-900 group-hover:text-brand transition-colors">{link.name}</span>
                        <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-brand transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="px-6 py-2">
                  <Separator className="bg-zinc-100" />
                </div>

                {/* More Info */}
                <div className="p-4 py-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[2px] ml-2">Account & Help</span>
                  <div className="mt-2 flex flex-col">
                    {user && (
                      <Link href="/wishlist" onClick={() => setIsOpen(false)} className="flex items-center gap-3 w-full p-4 hover:bg-zinc-50 transition-colors">
                        <Heart className="w-5 h-5 text-zinc-500" />
                        <span className="font-bold text-zinc-800">My Wishlist</span>
                      </Link>
                    )}
                    {!user ? (
                      <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center gap-3 w-full p-4 hover:bg-zinc-50 transition-colors">
                        <LogIn className="w-5 h-5 text-zinc-500" />
                        <span className="font-bold text-zinc-800">Login / Signup</span>
                      </Link>
                    ) : (
                      <>
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full p-4 hover:bg-zinc-50 transition-colors text-left">
                          <LogOut className="w-5 h-5 text-red-500" />
                          <span className="font-bold text-red-600">Secure Logout</span>
                        </button>
                      </>
                    )}
                    <Link href="/track-order" onClick={() => setIsOpen(false)} className="flex items-center gap-3 w-full p-4 hover:bg-zinc-50 transition-colors">
                      <HelpCircle className="w-5 h-5 text-zinc-500" />
                      <span className="font-bold text-zinc-800">Track Order</span>
                    </Link>
                    <Link href="/contact" onClick={() => setIsOpen(false)} className="flex items-center gap-3 w-full p-4 hover:bg-zinc-50 transition-colors">
                      <PhoneCall className="w-5 h-5 text-zinc-500" />
                      <span className="font-bold text-zinc-800">Contact Us</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Section */}
              <div className="p-6 border-t bg-zinc-50 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-zinc-500">Language</span>
                  <span className="text-sm font-bold text-zinc-950">English (IN)</span>
                </div>
                <div className="text-[10px] text-zinc-400 font-medium">
                  © 2026 SOULED Minimal. All Rights Reserved.
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-2xl md:text-3xl font-bold tracking-tighter text-brand">
            SOULED
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 ml-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-semibold text-zinc-800 hover:text-brand transition-all relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-brand after:transition-all hover:after:w-full"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 ml-8 mr-8 max-w-md relative group">
          <div className="w-full relative">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 border border-zinc-200 group-focus-within:border-zinc-400 group-focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm font-medium text-zinc-900 placeholder:text-zinc-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 hover:bg-zinc-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-zinc-200 shadow-lg overflow-hidden z-40 max-h-[400px] overflow-y-auto">
                {searchLoading && (
                  <div className="p-6 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                  </div>
                )}

                {!searchLoading && searchResults.length === 0 && (
                  <div className="p-6 text-center">
                    <p className="text-sm text-zinc-500 font-medium">No products found</p>
                  </div>
                )}

                {!searchLoading && searchResults.length > 0 && (
                  <div className="p-2 space-y-1">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          router.push(`/product/${product.slug}`);
                          setSearchQuery("");
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors text-left"
                      >
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-10 h-12 object-cover rounded bg-zinc-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-zinc-900 truncate">{product.name}</p>
                          <p className="text-xs text-zinc-500 capitalize">{product.category.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-bold text-zinc-900">₹{product.price.toLocaleString("en-IN")}</span>
                            {product.discount > 0 && (
                              <span className="text-[10px] text-rose-600 font-bold">{product.discount}% OFF</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center gap-1 md:gap-4">
          {/* Mobile Search Toggle */}
          <div className="md:hidden relative w-full">
            {!searchOpen ? (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="w-5 h-5 text-zinc-700" />
              </Button>
            ) : (
              <div className="fixed inset-0 z-40" onClick={() => setSearchOpen(false)} />
            )}

            {/* Mobile Search Expanded */}
            {searchOpen && (
              <div className="fixed inset-x-0 top-0 z-50 bg-white border-b border-zinc-200">
                <div className="flex items-center gap-2 p-4 px-4">
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-zinc-700 rotate-180" />
                  </button>
                  
                  <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-zinc-100 border border-zinc-200">
                    <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-sm font-medium text-zinc-900 placeholder:text-zinc-400"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="p-1 hover:bg-zinc-200 rounded-full transition-colors shrink-0"
                      >
                        <X className="w-4 h-4 text-zinc-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile Search Results */}
                <div className="max-h-[calc(100vh-80px)] overflow-y-auto">
                  {searchLoading && (
                    <div className="p-8 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                    </div>
                  )}

                  {!searchLoading && searchQuery && searchResults.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-sm text-zinc-500 font-medium">No products found</p>
                    </div>
                  )}

                  {!searchLoading && searchQuery && searchResults.length > 0 && (
                    <div className="p-3 space-y-2">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => {
                            router.push(`/product/${product.slug}`);
                            setSearchQuery("");
                            setSearchOpen(false);
                          }}
                          className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-zinc-50 active:bg-zinc-100 transition-colors text-left border border-zinc-100"
                        >
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-14 h-18 object-cover rounded-lg bg-zinc-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-zinc-900 truncate">{product.name}</p>
                            <p className="text-xs text-zinc-500 capitalize">{product.category.name}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="font-bold text-zinc-900">₹{product.price.toLocaleString("en-IN")}</span>
                              {product.discount > 0 && (
                                <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">{product.discount}% OFF</span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {!searchQuery && (
                    <div className="p-8 text-center">
                      <p className="text-sm text-zinc-500 font-medium">Start typing to search...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <Link href="/wishlist">
            <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full relative group">
              <Heart className="w-5 h-5 text-zinc-700 group-hover:scale-110 transition-transform" />
              {wishlistItems.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-black bg-brand text-white hover:bg-brand border-2 border-white">
                  {wishlistItems.length}
                </Badge>
              )}
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full relative group"
            onClick={() => setOpenCart(true)}
          >
            <ShoppingBag className="w-5 h-5 text-zinc-700 group-hover:scale-110 transition-transform" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-black bg-zinc-950 text-white hover:bg-zinc-950 border-2 border-white">
                {totalItems}
              </Badge>
            )}
          </Button>

          {loading ? (
            <div className="w-10 h-10 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
            </div>
          ) : user ? (
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="rounded-full bg-zinc-50 border border-zinc-100 transition-all hover:bg-zinc-100 hover:scale-105 active:scale-95">
                <User className="w-5 h-5 text-brand" />
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon" className="rounded-full transition-all hover:bg-zinc-100 hover:scale-105 active:scale-95">
                <LogIn className="w-5 h-5 text-zinc-700" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      <CartSheet />
    </nav>
  );
}
