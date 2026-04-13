"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Heart, ShoppingBag, User, Menu, X,
  ChevronRight, ChevronDown, LogIn, HelpCircle,
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
  const navRef = React.useRef<HTMLElement>(null);
  const [mounted,         setMounted]         = useState(false);
  const [isOpen,          setIsOpen]          = useState(false);
  const [user,            setUser]            = useState<any>(null);
  const [loading,         setLoading]         = useState(true);
  const [searchOpen,      setSearchOpen]      = useState(false);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [searchResults,   setSearchResults]   = useState<any[]>([]);
  const [searchLoading,   setSearchLoading]   = useState(false);
  const [location,        setLocation]        = useState<{ city: string; postalCode: string } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const { totalItems, setIsOpen: setOpenCart } = useCart();
  const { items: wishlistItems }               = useWishlist();
  const supabase = createClient();
  // Ref to the search pill container — used to detect outside touches on iOS
  const searchPillRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  /* ── Navbar Height CSS Variable ── */
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const update = () => {
      document.documentElement.style.setProperty(
        "--navbar-height",
        `${nav.offsetHeight}px`
      );
    };
    update(); // set immediately on mount
    const obs = new ResizeObserver(update);
    obs.observe(nav);
    return () => obs.disconnect();
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
      async ({ coords }) => {
        await reverseGeocode(coords.latitude, coords.longitude);
        setLocationLoading(false);
      },
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
      setUser(user);
      setLoading(false);
    })();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => { subscription.unsubscribe(); };
  }, []);

  /* ── Close search on outside touch (iOS-safe) ──
     iOS Safari does NOT fire click events on transparent fixed divs, even with
     cursor:pointer.  A document-level touchstart listener is the only reliable
     way to detect "tap outside" on iOS.  The listener checks whether the touch
     originated inside the pill — if not, it closes the search. */
  useEffect(() => {
    if (!searchOpen) return;
    const handleOutside = (e: TouchEvent | MouseEvent) => {
      if (
        searchPillRef.current &&
        !searchPillRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("touchstart", handleOutside, { passive: true });
    document.addEventListener("mousedown",  handleOutside);
    return () => {
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("mousedown",  handleOutside);
    };
  }, [searchOpen]);

  /* ── Search ── */
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) { setSearchResults([]); return; }
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(await res.json());
      } catch { setSearchResults([]); }
      finally  { setSearchLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = async () => { await signOut(); };

  /* ── Badge style ── */
  const badgeCls =
    "absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 " +
    "min-w-[18px] h-[18px] flex items-center justify-center px-1 " +
    "text-[10px] font-black rounded-full border-2 border-white z-20 " +
    "bg-rose-500 text-white shadow-sm shadow-rose-400/40 pointer-events-none";

  /* ── Shared drawer menu (used in both mobile sheet and desktop) ── */
  const DrawerMenu = () => (
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

      {/* Account & Help */}
      <div className="p-4">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">
          Account & Help
        </p>
        <div className="flex flex-col">
          {user && (
            <Link
              href="/wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              <Heart className="w-5 h-5 text-zinc-400" />
              <span className="font-semibold text-zinc-800 text-sm">My Wishlist</span>
            </Link>
          )}
          {!user ? (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              <LogIn className="w-5 h-5 text-zinc-400" />
              <span className="font-semibold text-zinc-800 text-sm">Login / Signup</span>
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="w-5 h-5 text-red-400" />
              <span className="font-semibold text-red-600 text-sm">Secure Logout</span>
            </button>
          )}
          <Link
            href="/profile?tab=orders"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-zinc-400" />
            <span className="font-semibold text-zinc-800 text-sm">My Orders</span>
          </Link>
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <ShoppingBag className="w-5 h-5 text-zinc-400" />
            <span className="font-semibold text-zinc-800 text-sm">Shop All</span>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <nav
      ref={navRef}
      suppressHydrationWarning
      style={{ borderBottomLeftRadius: "24px", borderBottomRightRadius: "24px" }}
      className="relative w-full z-50 bg-white md:overflow-hidden border border-black shadow-sm"
    >

      {/* ══════════════════════════════════════════
          MOBILE LAYOUT  (md:hidden)
══════════════════════════════════════════ */}
      <div className="md:hidden relative" suppressHydrationWarning style={{ paddingBottom: "40px" }}>

        {/* ── Row 1: Logo · Icons · Menu ── */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand/70
                            flex items-center justify-center shadow-sm shadow-brand/20">
              <span className="text-white font-black text-sm">N</span>
            </div>
            <span className="text-xl font-black tracking-tight text-zinc-950">
              NEXUS
            </span>
          </Link>

          {/* Right icons */}
          <div className="flex items-center gap-0.5">

            {/* Wishlist */}
            <div className="relative">
              <Button
                variant="ghost" size="icon"
                className="rounded-xl hover:bg-zinc-100 h-10 w-10"
                onClick={() => router.push("/wishlist")}
              >
                <Heart className="w-5 h-5 text-zinc-600" />
              </Button>
              {wishlistItems.length > 0 && (
                <span className={badgeCls}>
                  {wishlistItems.length > 99 ? "99+" : wishlistItems.length}
                </span>
              )}
            </div>

            {/* Cart */}
            <div className="relative">
              <Button
                variant="ghost" size="icon"
                className="rounded-xl hover:bg-zinc-100 h-10 w-10"
                onClick={() => setOpenCart(true)}
              >
                <ShoppingBag className="w-5 h-5 text-zinc-600" />
              </Button>
              {totalItems > 0 && (
                <span className={badgeCls}>
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </div>

            {/* User / Login */}
            {loading ? (
              <div className="h-10 w-10 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-zinc-200 border-t-zinc-700 rounded-full animate-spin" />
              </div>
            ) : user ? (
              <Link href="/profile">
                <Button
                  variant="ghost" size="icon"
                  className="rounded-xl bg-zinc-100 border border-zinc-200
                             hover:bg-brand/10 hover:border-brand/30 h-10 w-10"
                >
                  <User className="w-5 h-5 text-brand" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-zinc-100 h-10 w-10">
                  <LogIn className="w-5 h-5 text-zinc-700" />
                </Button>
              </Link>
            )}

            {/* Hamburger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-zinc-100 h-10 w-10 ml-0.5">
                  <Menu className="w-5 h-5 text-zinc-800" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80vw] max-w-[300px] p-0 flex flex-col bg-white border-r [&>button]:hidden">
                <SheetHeader className="p-5 border-b flex flex-row items-center justify-between space-y-0">
                  <SheetTitle className="text-xl font-black tracking-tighter text-zinc-950">MENU</SheetTitle>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
                  >
                    <X className="w-4 h-4 text-zinc-600" />
                  </button>
                </SheetHeader>
                <DrawerMenu />
                <div className="p-5 border-t bg-zinc-50 space-y-1.5 shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400">Language</span>
                    <span className="text-xs font-bold text-zinc-800">English (IN)</span>
                  </div>
                  <p className="text-[10px] text-zinc-400">© 2026 NEXUS. All Rights Reserved.</p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* ── Row 2: Location — always renders, shows placeholder until resolved ── */}
        <button
          onClick={handleRefreshLocation}
          disabled={locationLoading}
          className="flex items-center gap-2 px-4 pb-2 w-full text-left group disabled:opacity-60"
        >
          <MapPin className="w-4 h-4 text-brand shrink-0" />
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {locationLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400 shrink-0" />
                <span className="text-base font-bold text-zinc-400">Detecting…</span>
              </>
            ) : (
              <>
                {/* Bold large city name — the Sangeetha "48 Hours" equivalent */}
                <span className="text-[22px] font-black text-zinc-900 leading-none truncate">
                  {location?.city ?? "Set Location"}
                </span>
                {location?.postalCode && (
                  <span className="text-sm font-bold text-zinc-500 shrink-0 leading-none">
                    {location.postalCode}
                  </span>
                )}
                <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0 group-hover:text-brand transition-colors" />
              </>
            )}
          </div>
        </button>

        {/* ── Row 3: Search bar ──
            Positioned at the bottom center of the navbar border.
        ── */}
        {mounted && (
          <div className="absolute left-1/2 -translate-x-1/2 w-full flex justify-center px-4 z-50 pointer-events-none" style={{ bottom: "-25px" }}>
            <div ref={searchPillRef} className={`w-full max-w-sm relative group ${searchOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
            {/* Search trigger button */}
            {!searchOpen ? (
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl
                           bg-white border-2 border-rose-500 pointer-events-auto
                           shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)]
                           hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)]
                           active:scale-[0.99] transition-all duration-200"
              >
                <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                <span className="text-sm font-medium text-zinc-400 flex-1 text-left select-none">
                  Search for "Smartphones"
                </span>
              </button>
            ) : (
              /* Search input - inline */
              <div className="w-full flex items-center gap-2 px-5 py-3.5 rounded-2xl
                             bg-white border-2 border-brand
                             shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)]
                             focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.12)]
                             transition-all duration-200">
                <Search className="w-4 h-4 text-brand shrink-0" />
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
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1 hover:bg-zinc-100 rounded-full shrink-0"
                  >
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                )}
                <button
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  className="p-1 hover:bg-zinc-100 rounded-full shrink-0"
                >
                  <ChevronRight className="w-4 h-4 text-zinc-400 rotate-180" />
                </button>
              </div>
            )}

            {/* Dropdown results - appears below searchbar when active */}
            {searchOpen && searchQuery && (
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl
                           border border-zinc-200 shadow-xl shadow-black/8
                           overflow-hidden z-40 max-h-[320px] overflow-y-auto"
              >
                {searchLoading && (
                  <div className="p-6 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                  </div>
                )}
                {!searchLoading && searchResults.length === 0 && (
                  <div className="p-6 text-center">
                    <p className="text-sm font-medium text-zinc-400">No results for "{searchQuery}"</p>
                  </div>
                )}
                {!searchLoading && searchResults.length > 0 && (
                  <div className="p-2 space-y-1">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => { router.push(`/product/${product.slug}`); setSearchQuery(""); setSearchOpen(false); }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg
                                   hover:bg-zinc-50 active:bg-zinc-100 transition-colors
                                   text-left"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-14 object-cover rounded-lg bg-zinc-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-zinc-900 truncate text-sm">{product.name}</p>
                          <p className="text-xs text-zinc-400 capitalize mt-0.5">{product.category.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-zinc-900 text-sm">
                              ₹{product.price.toLocaleString("en-IN")}
                            </span>
                            {product.discount > 0 && (
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
                                {product.discount}% OFF
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Visual backdrop — pointer-events-none so taps pass straight through
                to page links.  Closing is handled by the document touchstart/mousedown
                listener above, which is the only approach that reliably works on iOS. */}
            {searchOpen && (
              <div className="fixed inset-0 z-[49] pointer-events-none" />
            )}
          </div>
        </div>
        )}
      </div>

      {/* ╔══════════════════════════════════════════╗
          ║        DESKTOP LAYOUT  (hidden md:flex)  ║
          ╚══════════════════════════════════════════╝ */}
      <div className="hidden md:flex w-full px-4 md:px-8 lg:px-12 xl:px-20
                      items-center justify-between gap-4 lg:gap-6
                      py-2 md:py-3">

        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0 group">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand to-brand/70
                            flex items-center justify-center shadow-md shadow-brand/20
                            group-hover:shadow-lg group-hover:shadow-brand/30 transition-all">
              <span className="text-white font-black text-base">N</span>
            </div>
            <span className="text-xl lg:text-2xl font-black tracking-tight text-zinc-950
                             group-hover:text-brand transition-colors">
              NEXUS
            </span>
          </div>
        </Link>

        {/* Location pill (lg+) */}
        <div className="hidden lg:flex items-center shrink-0">
          {locationLoading ? (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
              <span className="text-sm font-semibold text-zinc-500">Detecting…</span>
            </div>
          ) : (
            <button
              onClick={handleRefreshLocation}
              title="Click to refresh location"
              className="group flex items-center gap-3 px-4 py-2.5 rounded-lg border border-zinc-200
                         bg-white hover:bg-brand/5 hover:border-brand/30
                         transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <MapPin className="w-4 h-4 text-brand/70 group-hover:text-brand transition-colors shrink-0" />
              <div className="text-left">
                <p className="text-[10px] font-semibold text-zinc-400 leading-none uppercase tracking-wide">
                  Deliver to
                </p>
                <p className="text-sm font-bold text-zinc-900 leading-tight mt-0.5">
                  {location?.city ?? "—"}
                  {location?.postalCode && (
                    <span className="text-xs font-normal text-zinc-400 ml-1.5">
                      {location.postalCode}
                    </span>
                  )}
                </p>
              </div>
            </button>
          )}
        </div>

        {/* Search bar */}
        <div className="flex flex-1 mx-4 lg:mx-6 max-w-2xl relative group">
          <div className="w-full relative">
            <div
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg
                         bg-zinc-50/80 border-2 border-rose-500
                         group-focus-within:border-brand group-focus-within:bg-white
                         group-focus-within:shadow-lg group-focus-within:shadow-brand/10
                         transition-all duration-200"
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

            {/* Dropdown results */}
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
                          src={product.image}
                          alt={product.name}
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
                              <span className="text-[10px] font-bold text-rose-600">
                                {product.discount}% OFF
                              </span>
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

        {/* Right icons */}
        <div className="flex items-center gap-2 md:gap-3 lg:gap-4 shrink-0">

          {/* Wishlist */}
          <div className="relative inline-flex overflow-visible">
            <Button
              variant="ghost" size="icon"
              className="rounded-full group hover:bg-red-50 transition-all h-10 w-10"
              onClick={() => router.push("/wishlist")}
            >
              <Heart className="w-5 h-5 text-zinc-600 group-hover:text-rose-500 group-hover:scale-110 transition-all" />
            </Button>
            {wishlistItems.length > 0 && (
              <span className={badgeCls}>
                {wishlistItems.length > 99 ? "99+" : wishlistItems.length}
              </span>
            )}
          </div>

          {/* Cart */}
          <div className="relative inline-flex overflow-visible">
            <Button
              variant="ghost" size="icon"
              className="rounded-full group hover:bg-brand/5 transition-all h-10 w-10"
              onClick={() => setOpenCart(true)}
            >
              <ShoppingBag className="w-5 h-5 text-zinc-600 group-hover:text-brand group-hover:scale-110 transition-all" />
            </Button>
            {totalItems > 0 && (
              <span className={badgeCls}>
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </div>

          {/* User */}
          {loading ? (
            <div className="h-10 w-10 flex items-center justify-center">
              <div className="w-3.5 h-3.5 border-2 border-zinc-200 border-t-zinc-700 rounded-full animate-spin" />
            </div>
          ) : user ? (
            <Link href="/profile">
              <Button
                variant="ghost" size="icon"
                className="rounded-full bg-zinc-50 border border-zinc-200
                           hover:bg-brand/10 hover:border-brand/30
                           hover:scale-105 active:scale-95 transition-all
                           h-10 w-10 shadow-sm hover:shadow-md"
              >
                <User className="w-5 h-5 text-brand" />
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button
                variant="ghost" size="icon"
                className="rounded-full hover:bg-zinc-100 hover:scale-105 active:scale-95 transition-all h-10 w-10"
              >
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