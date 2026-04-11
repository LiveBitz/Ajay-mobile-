"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Heart, ShoppingBag, User, Menu, X,
  ChevronRight, LogIn, HelpCircle, PhoneCall,
  LogOut, Loader2, MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { CartSheet } from "@/components/cart/CartSheet";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/actions/auth-actions";



export function Navbar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isScrolled,     setIsScrolled]     = useState(false);
  const [isOpen,         setIsOpen]         = useState(false);
  const [user,           setUser]           = useState<any>(null);
  const [loading,        setLoading]        = useState(true);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [searchResults,  setSearchResults]  = useState<any[]>([]);
  const [searchLoading,  setSearchLoading]  = useState(false);
  const [location,       setLocation]       = useState<{ city: string; postalCode: string } | null>(null);
  const [locationLoading,setLocationLoading]= useState(false);

  const { totalItems, setIsOpen: setOpenCart } = useCart();
  const { items: wishlistItems }               = useWishlist();
  const supabase = createClient();

  // Hydration fix - ensure component is mounted before rendering client-specific features
  useEffect(() => {
    setMounted(true);
  }, []);

  /* ── Geocoding ── */
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
        { headers: { "Accept": "application/json", "User-Agent": "Nexus-App/1.0" } }
      );
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      const city =
        data.address?.city || data.address?.town || data.address?.village ||
        data.address?.city_district || data.address?.district ||
        data.address?.county || data.name || "Your Location";
      const postalCode = data.address?.postcode || "";
      const loc = { city, postalCode };
      localStorage.setItem("userLocation",     JSON.stringify(loc));
      localStorage.setItem("userLocationTime", Date.now().toString());
      setLocation(loc);
      return loc;
    } catch {
      const fallback = { city: "Your Location", postalCode: "" };
      setLocation(fallback);
      return fallback;
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) { setLocation({ city: "Not Available", postalCode: "" }); return; }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => { await reverseGeocode(coords.latitude, coords.longitude); setLocationLoading(false); },
      (err) => {
        const msgs: Record<number, string> = { 1: "Enable Location", 2: "Unavailable", 3: "Timed Out" };
        setLocation({ city: msgs[err.code] ?? "Location Error", postalCode: "" });
        setLocationLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  useEffect(() => {
    const cached = localStorage.getItem("userLocation");
    const time   = localStorage.getItem("userLocationTime");
    if (cached && time && Date.now() - parseInt(time) < 86400000) {
      setLocation(JSON.parse(cached));
    } else {
      setTimeout(requestLocation, 1000);
    }
  }, []);

  const handleRefreshLocation = () => {
    localStorage.removeItem("userLocation");
    localStorage.removeItem("userLocationTime");
    requestLocation();
  };

  /* ── Auth ── */
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user); setLoading(false);
    })();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); subscription.unsubscribe(); };
  }, []);

  /* ── Search ── */
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) { setSearchResults([]); return; }
      setSearchLoading(true);
      try {
        const res  = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(await res.json());
      } catch { setSearchResults([]); }
      finally  { setSearchLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = async () => { await signOut(); };

  /* ── Shared badge style ── */
  const badgeCls =
    "absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 " +
    "min-w-[18px] h-[18px] flex items-center justify-center px-1 " +
    "text-[10px] font-black rounded-full border-2 border-white z-20 " +
    "bg-rose-500 text-white shadow-sm shadow-rose-400/40 pointer-events-none";

  return (
    <nav
      suppressHydrationWarning
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-white/95 backdrop-blur-lg shadow-lg shadow-black/5 border-zinc-100 py-2"
          : "bg-white border-zinc-100/50 py-3 sm:py-3.5 md:py-4 lg:py-4"
      )}
    >
      {/* ─── Main row ─── */}
      <div className="w-full px-3 sm:px-4 md:px-8 lg:px-12 xl:px-20 flex items-center justify-between gap-2 sm:gap-3 md:gap-4 lg:gap-6">

        {/* ── Left: Hamburger + Logo (mobile) ── */}
        <div className="flex items-center gap-1.5 md:gap-0 shrink-0">
          {/* Hamburger (mobile only) */}
          <div className="flex items-center md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-100">
                  <Menu className="w-6 h-6 text-zinc-800" />
                </Button>
              </SheetTrigger>

            <SheetContent side="left" className="w-[80vw] max-w-[300px] p-0 flex flex-col bg-white border-r">
              <SheetHeader className="p-5 border-b">
                <SheetTitle className="text-xl font-black tracking-tighter text-zinc-950">MENU</SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto">
                {/* Location */}
                <div className="p-4">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">
                    Delivery Location
                  </p>
                  <button
                    onClick={handleRefreshLocation}
                    disabled={locationLoading}
                    className="w-full p-3.5 rounded-xl bg-brand/5 border border-brand/20
                               hover:border-brand/40 hover:bg-brand/10 transition-all
                               flex items-center gap-3 disabled:opacity-50"
                  >
                    <MapPin className="w-5 h-5 text-brand shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      {locationLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-brand" />
                          <span className="text-sm font-semibold text-zinc-500">Detecting…</span>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-zinc-900 truncate">{location?.city ?? "—"}</p>
                          <p className="text-xs text-zinc-400">{location?.postalCode || "Tap to refresh"}</p>
                        </>
                      )}
                    </div>
                  </button>
                </div>

                <div className="px-5"><Separator className="bg-zinc-100" /></div>

                {/* Account */}
                <div className="p-4">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">
                    Account & Help
                  </p>
                  <div className="flex flex-col">
                    {user && (
                      <Link href="/wishlist" onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-zinc-50 transition-colors">
                        <Heart className="w-5 h-5 text-zinc-400" />
                        <span className="font-semibold text-zinc-800 text-sm">My Wishlist</span>
                      </Link>
                    )}
                    {!user ? (
                      <Link href="/login" onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-zinc-50 transition-colors">
                        <LogIn className="w-5 h-5 text-zinc-400" />
                        <span className="font-semibold text-zinc-800 text-sm">Login / Signup</span>
                      </Link>
                    ) : (
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-50 transition-colors text-left">
                        <LogOut className="w-5 h-5 text-red-400" />
                        <span className="font-semibold text-red-600 text-sm">Secure Logout</span>
                      </button>
                    )}
                    <Link href="/track-order" onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-zinc-50 transition-colors">
                      <HelpCircle className="w-5 h-5 text-zinc-400" />
                      <span className="font-semibold text-zinc-800 text-sm">Track Order</span>
                    </Link>
                    <Link href="/contact" onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-zinc-50 transition-colors">
                      <PhoneCall className="w-5 h-5 text-zinc-400" />
                      <span className="font-semibold text-zinc-800 text-sm">Contact Us</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Drawer footer */}
              <div className="p-5 border-t bg-zinc-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400">Language</span>
                  <span className="text-xs font-bold text-zinc-800">English (IN)</span>
                </div>
                <p className="text-[10px] text-zinc-400">© 2026 NEXUS. All Rights Reserved.</p>
              </div>
            </SheetContent>
          </Sheet>
          </div>

          {/* Logo – shown on mobile, hidden on desktop, appears next to hamburger */}
          <Link href="/" className="flex items-center shrink-0 md:hidden">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand to-brand/70 flex items-center justify-center shadow-sm shadow-brand/30">
                <span className="text-white font-black text-xs">N</span>
              </div>
            </div>
          </Link>
        </div>

        {/* ── Logo (desktop only) ── */}
        <Link href="/" className="hidden md:flex items-center shrink-0 group">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-brand to-brand/70 flex items-center justify-center shadow-md shadow-brand/20 group-hover:shadow-lg group-hover:shadow-brand/30 transition-all">
              <span className="text-white font-black text-sm md:text-base">N</span>
            </div>
            <span className="text-lg md:text-xl lg:text-2xl font-black tracking-tight text-zinc-950 group-hover:text-brand transition-colors">
              NEXUS
            </span>
          </div>
        </Link>

        {/* ── Location pill (desktop only) ── */}
        <div className="hidden lg:flex items-center shrink-0 ml-2">
          {locationLoading ? (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
              <span className="text-sm font-semibold text-zinc-500">Detecting…</span>
            </div>
          ) : (
            <button
              onClick={handleRefreshLocation}
              title="Click to refresh location"
              className="group flex items-center gap-3 px-4 py-3 rounded-lg border border-zinc-200
                         bg-white hover:bg-brand/5 hover:border-brand/30 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <MapPin className="w-5 h-5 text-brand/70 group-hover:text-brand transition-colors shrink-0" />
              <div className="text-left">
                <p className="text-[11px] font-semibold text-zinc-400 leading-none uppercase">Deliver to</p>
                <p className="text-sm font-bold text-zinc-900 leading-tight mt-0.5">
                  {location?.city ?? "—"}
                  {location?.postalCode && (
                    <span className="text-xs font-normal text-zinc-400 ml-2">{location.postalCode}</span>
                  )}
                </p>
              </div>
            </button>
          )}
        </div>

        {/* ── Search bar (desktop) ── */}
        <div className="hidden md:flex flex-1 mx-4 lg:mx-6 max-w-2xl max-h-10 relative group">
          <div className="w-full relative">
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-lg
                         bg-zinc-50/80 border border-zinc-200
                         group-focus-within:border-brand/50 group-focus-within:bg-white
                         group-focus-within:shadow-lg group-focus-within:shadow-brand/10
                         transition-all duration-200 h-full"
            >
              <Search className="w-5 h-5 text-zinc-400 group-focus-within:text-brand transition-colors shrink-0" />
              <input
                type="text"
                placeholder="Search smartphones, laptops…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm font-medium
                           text-zinc-900 placeholder:text-zinc-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 hover:bg-zinc-200/60 rounded-full transition-colors shrink-0"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              )}
            </div>

            {/* Search dropdown */}
            {searchQuery && (
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl
                           border border-zinc-200 shadow-xl shadow-black/8
                           overflow-hidden z-40 max-h-[380px] overflow-y-auto"
              >
                {searchLoading && (
                  <div className="p-6 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                  </div>
                )}
                {!searchLoading && searchResults.length === 0 && (
                  <div className="p-6 text-center">
                    <p className="text-sm text-zinc-400 font-medium">No products found</p>
                  </div>
                )}
                {!searchLoading && searchResults.length > 0 && (
                  <div className="p-2 space-y-0.5">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => { router.push(`/product/${product.slug}`); setSearchQuery(""); }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg
                                   hover:bg-zinc-50 transition-colors text-left"
                      >
                        <img
                          src={product.image} alt={product.name}
                          className="w-10 h-12 object-cover rounded-lg bg-zinc-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-zinc-900 truncate">{product.name}</p>
                          <p className="text-xs text-zinc-400 capitalize">{product.category.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-bold text-zinc-900">
                              ₹{product.price.toLocaleString("en-IN")}
                            </span>
                            {product.discount > 0 && (
                              <span className="text-[10px] font-bold text-rose-600">{product.discount}% OFF</span>
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

        {/* ── Right‑side icons ── */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 shrink-0 ml-2">

          {/* Mobile search toggle */}
          <div className="md:hidden">
            <Button
              variant="ghost" size="icon"
              className="rounded-full hover:bg-zinc-100 h-10 w-10"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-700" />
            </Button>

            {/* Full-screen mobile search */}
            {searchOpen && (
              <>
                <div className="fixed inset-0 z-40 bg-black/20" onClick={() => { setSearchOpen(false); setSearchQuery(""); }} />
                <div className="fixed inset-x-0 top-0 z-50 bg-white border-b border-zinc-200 shadow-lg">
                  <div className="flex items-center gap-2 p-3 px-4">
                    <button
                      onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                      className="p-2 hover:bg-zinc-100 rounded-full transition-colors shrink-0"
                    >
                      <ChevronRight className="w-5 h-5 text-zinc-700 rotate-180" />
                    </button>
                    <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-100 border border-zinc-200">
                      <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search products…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm font-medium
                                   text-zinc-900 placeholder:text-zinc-400"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-zinc-200 rounded-full shrink-0">
                          <X className="w-4 h-4 text-zinc-400" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-[calc(100vh-72px)] overflow-y-auto">
                    {searchLoading && (
                      <div className="p-8 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                      </div>
                    )}
                    {!searchLoading && searchQuery && searchResults.length === 0 && (
                      <div className="p-8 text-center">
                        <p className="text-sm text-zinc-400 font-medium">No products found</p>
                      </div>
                    )}
                    {!searchLoading && searchQuery && searchResults.length > 0 && (
                      <div className="p-3 space-y-2">
                        {searchResults.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => {
                              router.push(`/product/${product.slug}`);
                              setSearchQuery(""); setSearchOpen(false);
                            }}
                            className="w-full flex items-center gap-4 p-4 rounded-xl
                                       hover:bg-zinc-50 active:bg-zinc-100 transition-colors
                                       text-left border border-zinc-100"
                          >
                            <img
                              src={product.image} alt={product.name}
                              className="w-14 h-16 object-cover rounded-xl bg-zinc-100 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-zinc-900 truncate">{product.name}</p>
                              <p className="text-xs text-zinc-400 capitalize mt-0.5">{product.category.name}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="font-bold text-zinc-900">
                                  ₹{product.price.toLocaleString("en-IN")}
                                </span>
                                {product.discount > 0 && (
                                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                                    {product.discount}% OFF
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {!searchQuery && (
                      <div className="p-8 text-center">
                        <p className="text-sm text-zinc-400 font-medium">Start typing to search…</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Wishlist */}
          <div className="relative inline-flex overflow-visible">
            <Button
              variant="ghost" size="icon"
              className="rounded-full group hover:bg-red-50 transition-all h-11 w-11 md:h-10 md:w-10"
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery("");
                router.push("/wishlist");
              }}
            >
              <Heart className="w-5 h-5 md:w-4.5 md:h-4.5 text-zinc-600 group-hover:text-rose-500 group-hover:scale-110 transition-all" />
            </Button>
            {wishlistItems.length > 0 && (
              <span className={badgeCls}>{wishlistItems.length > 99 ? "99+" : wishlistItems.length}</span>
            )}
          </div>

          {/* Cart */}
          <div className="relative inline-flex overflow-visible">
            <Button
              variant="ghost" size="icon"
              className="rounded-full group hover:bg-brand/5 transition-all h-11 w-11 md:h-10 md:w-10"
              onClick={() => setOpenCart(true)}
            >
              <ShoppingBag className="w-5 h-5 md:w-4.5 md:h-4.5 text-zinc-600 group-hover:text-brand group-hover:scale-110 transition-all" />
            </Button>
            {totalItems > 0 && (
              <span className={badgeCls}>
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </div>

          {/* User */}
          {loading ? (
            <div className="h-11 w-11 md:h-10 md:w-10 flex items-center justify-center">
              <div className="w-4 h-4 md:w-3.5 md:h-3.5 border-2 border-zinc-200 border-t-zinc-700 rounded-full animate-spin" />
            </div>
          ) : user ? (
            <Link href="/profile">
              <Button
                variant="ghost" size="icon"
                className="rounded-full bg-zinc-50 border border-zinc-200
                           hover:bg-brand/10 hover:border-brand/30 hover:scale-105 active:scale-95 transition-all h-11 w-11 md:h-10 md:w-10 shadow-sm hover:shadow-md"
              >
                <User className="w-5 h-5 md:w-4.5 md:h-4.5 text-brand" />
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button
                variant="ghost" size="icon"
                className="rounded-full hover:bg-zinc-100 hover:scale-105 active:scale-95 transition-all h-11 w-11 md:h-10 md:w-10"
              >
                <LogIn className="w-5 h-5 md:w-4.5 md:h-4.5 text-zinc-700" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      <CartSheet />
    </nav>
  );
}