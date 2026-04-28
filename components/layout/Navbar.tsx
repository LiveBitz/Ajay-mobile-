"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { CartSheet } from "@/components/cart/CartSheet";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { signOut } from "@/lib/actions/auth-actions";

export function Navbar({ categoryNames = [] }: { categoryNames?: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const isStaticPage = ["/terms", "/privacy", "/refund-policy"].includes(pathname ?? "");
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
  const [locationPermission, setLocationPermission] = useState<"unknown" | "granted" | "denied" | "unavailable">("unknown");

  const { totalItems, setIsOpen: setOpenCart } = useCart();
  const { items: wishlistItems }               = useWishlist();
  const { toast } = useToast();
  const supabase = createClient();
  // Ref to the search pill container — used to detect outside touches on iOS
  const searchPillRef = React.useRef<HTMLDivElement>(null);

  const [placeholder, setPlaceholder] = useState("Smartphones");

  useEffect(() => {
    if (categoryNames.length > 0) {
      setPlaceholder(categoryNames[0]);
      const interval = setInterval(() => {
        setPlaceholder(prev => {
          const currentIndex = categoryNames.indexOf(prev);
          const nextIndex = (currentIndex + 1) % categoryNames.length;
          return categoryNames[nextIndex];
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [categoryNames]);

  const goToSearchResults = React.useCallback((rawQuery: string) => {
    const query = rawQuery.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  }, [router]);

  const onSearchSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    goToSearchResults(searchQuery);
  }, [goToSearchResults, searchQuery]);

  const onSearchKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goToSearchResults(searchQuery);
    }
  }, [goToSearchResults, searchQuery]);

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
  const reverseGeocode = React.useCallback(async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { headers: { "Accept": "application/json", "User-Agent": "PriyaMobilePark/1.0" } }
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
      setLocationPermission("granted");
      return loc;
    } catch {
      // Geocode failed but GPS worked — still show coords-based fallback
      const loc = { city: "Your Location", postalCode: "" };
      setLocation(loc);
      return loc;
    }
  }, []);

  const requestLocation = React.useCallback(() => {
    if (!navigator.geolocation) {
      setLocationPermission("unavailable");
      setLocation({ city: "Not Supported", postalCode: "" });
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        await reverseGeocode(coords.latitude, coords.longitude);
        setLocationLoading(false);
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === 1) {
          // User denied
          setLocationPermission("denied");
          setLocation(null);
          localStorage.removeItem("userLocation");
          localStorage.removeItem("userLocationTime");
        } else if (err.code === 2) {
          setLocation({ city: "Location Unavailable", postalCode: "" });
        } else {
          // Timeout — retry once with lower accuracy
          navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
              await reverseGeocode(coords.latitude, coords.longitude);
              setLocationLoading(false);
            },
            () => {
              setLocationLoading(false);
              setLocation({ city: "Timed Out", postalCode: "Tap to retry" });
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }
          );
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
    );
  }, [reverseGeocode]);

  // On mount: load cache or check permission state first
  useEffect(() => {
    const cached = localStorage.getItem("userLocation");
    const time   = localStorage.getItem("userLocationTime");
    // Use cache if fresh (6 hours)
    if (cached && time && Date.now() - parseInt(time) < 21600000) {
      setLocation(JSON.parse(cached));
      setLocationPermission("granted");
      return;
    }
    // Check permission API if available (Chrome/Firefox/Edge)
    if (typeof navigator !== "undefined" && navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          requestLocation();
        } else if (result.state === "denied") {
          setLocationPermission("denied");
        } else {
          // "prompt" — auto-fire so the browser popup appears on page load
          requestLocation();
        }
        result.onchange = () => {
          if (result.state === "granted") requestLocation();
          else if (result.state === "denied") setLocationPermission("denied");
          else setLocationPermission("unknown");
        };
      }).catch(() => {
        // permissions API not supported — fire directly (Safari etc.)
        requestLocation();
      });
    } else {
      // No permissions API — fire directly
      requestLocation();
    }
  }, [requestLocation]);

  const handleRefreshLocation = React.useCallback(() => {
    if (locationPermission === "denied") {
      toast({
        title: "Location blocked",
        description: "Go to browser Settings → Site Settings → Location → find this site and set it to Allow.",
      });
      return;
    }
    localStorage.removeItem("userLocation");
    localStorage.removeItem("userLocationTime");
    requestLocation();
  }, [requestLocation, locationPermission, toast]);

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
      const target = e.target as Node;
      const isInsideMobile = searchPillRef.current?.contains(target);
      const isInsideDesktop = document.getElementById("desktop-search-container")?.contains(target);

      if (!isInsideMobile && !isInsideDesktop) {
        setSearchOpen(false);
        // We only clear query if we want it to fully reset, 
        // but often users just want to close the dropdown.
        // Let's keep the query but close results.
        if (!isInsideDesktop) setSearchQuery(""); 
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
    // One AbortController per query — aborted immediately when the user types
    // the next character, so stale responses can never overwrite fresh ones.
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) { setSearchResults([]); return; }
      setSearchLoading(true);
      try {
        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(searchQuery)}`,
          { signal: controller.signal }
        );
        setSearchResults(await res.json());
      } catch (err) {
        // AbortError just means a newer request superseded this one — not a real error
        if ((err as Error).name !== "AbortError") setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
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
      className="relative w-full z-50 bg-white shadow-sm"
    >

      {/* ══════════════════════════════════════════
          MOBILE LAYOUT  (md:hidden)
══════════════════════════════════════════ */}
      <div className="md:hidden relative" suppressHydrationWarning style={{ paddingBottom: isStaticPage ? "8px" : "40px" }}>

        {/* ── Row 1: Logo · Icons · Menu ── */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/images/cropped_circle_image.png"
              alt="Priya Mobile Park"
              width={44}
              height={44}
              className="rounded-full object-cover"
              priority
            />
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
                  <p className="text-[10px] text-zinc-400">© 2026 Priya Mobile Park. All Rights Reserved.</p>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* ── Row 2: Location ── */}
        <button
          onClick={handleRefreshLocation}
          disabled={locationLoading}
          suppressHydrationWarning
          className="flex items-center gap-2 px-4 pb-2 w-full text-left group disabled:opacity-60"
        >
          <MapPin className="w-4 h-4 text-brand shrink-0" />
          <div className="flex items-center gap-1.5 min-w-0 flex-1" suppressHydrationWarning>
            {!mounted ? (
              <div className="flex flex-col leading-none">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Set location</span>
                <span className="text-[17px] font-black text-brand leading-tight">Enable Location</span>
              </div>
            ) : locationLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400 shrink-0" />
                <span className="text-base font-bold text-zinc-400">Detecting…</span>
              </>
            ) : locationPermission === "denied" ? (
              <div className="flex flex-col leading-none">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Location</span>
                <span className="text-[15px] font-bold text-zinc-500 leading-tight">Blocked · Allow in browser</span>
              </div>
            ) : locationPermission === "granted" && location ? (
              <>
                <div className="flex flex-col leading-none min-w-0">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Deliver to</span>
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="text-[18px] font-black text-zinc-900 leading-tight truncate">{location.city}</span>
                    {location.postalCode && (
                      <span className="text-[13px] font-bold text-brand shrink-0 leading-tight">{location.postalCode}</span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0 group-hover:text-brand transition-colors ml-0.5" />
              </>
            ) : (
              <div className="flex flex-col leading-none">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Set location</span>
                <span className="text-[17px] font-black text-brand leading-tight">Enable Location</span>
              </div>
            )}
          </div>
        </button>

        {/* ── Row 3: Search bar ──
            Positioned at the bottom center of the navbar border.
        ── */}
        {mounted && !isStaticPage && (
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
              <form
                onSubmit={onSearchSubmit}
                className="w-full flex items-center gap-2 px-5 py-3.5 rounded-2xl
                           bg-white border-2 border-brand
                           shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)]
                           focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.12)]
                           transition-all duration-200"
              >
                <Search className="w-4 h-4 text-brand shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search products…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  className="flex-1 bg-transparent outline-none text-sm font-medium
                             text-zinc-900 placeholder:text-zinc-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1 hover:bg-zinc-100 rounded-full shrink-0"
                    type="button"
                  >
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                )}
              </form>
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
                        <div className="relative w-12 h-14 rounded-lg bg-zinc-100 shrink-0 overflow-hidden">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
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
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/images/cropped_circle_image.png"
            alt="Priya Mobile Park"
            width={52}
            height={52}
            className="rounded-full object-cover"
            priority
          />
        </Link>

        {/* Location pill (lg+) */}
        <div className="hidden lg:flex items-center shrink-0">
          {mounted && locationLoading ? (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
              <span className="text-sm font-semibold text-zinc-500">Detecting…</span>
            </div>
          ) : (
            <button
              onClick={handleRefreshLocation}
              suppressHydrationWarning
              title={mounted && locationPermission === "denied" ? "Allow location in browser settings" : "Click to set location"}
              className="group flex items-center gap-3 px-4 py-2.5 rounded-lg border border-zinc-200
                         bg-white hover:bg-brand/5 hover:border-brand/30
                         transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <MapPin className="w-4 h-4 text-brand/70 group-hover:text-brand transition-colors shrink-0" />
              <div className="text-left" suppressHydrationWarning>
                <p className="text-[10px] font-semibold text-zinc-400 leading-none uppercase tracking-wide" suppressHydrationWarning>
                  {!mounted ? "Set location" : locationPermission === "denied" ? "Blocked" : locationPermission === "granted" ? "Deliver to" : "Set location"}
                </p>
                <div className="flex items-baseline gap-1.5 mt-0.5" suppressHydrationWarning>
                  <p className="text-sm font-bold leading-tight text-zinc-900" suppressHydrationWarning>
                    {!mounted
                      ? "Enable Location"
                      : locationPermission === "denied"
                      ? "Allow in settings"
                      : locationPermission === "granted" && location
                      ? location.city
                      : "Enable Location"}
                  </p>
                  {mounted && locationPermission === "granted" && location?.postalCode && (
                    <span className="text-xs font-bold text-brand leading-tight">{location.postalCode}</span>
                  )}
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Search bar */}
        <form 
          id="desktop-search-container"
          onSubmit={onSearchSubmit} 
          className="flex flex-1 mx-4 lg:mx-6 max-w-2xl relative group"
        >
          <div className="w-full relative">
            <div
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg
                         bg-zinc-50/80 border-2 border-rose-500
                         group-focus-within:border-brand group-focus-within:bg-white
                         group-focus-within:shadow-lg group-focus-within:shadow-brand/10
                         transition-all duration-200"
            >
              <Search className="w-5 h-5 text-zinc-400 group-focus-within:text-brand transition-colors shrink-0" />
              <input
                type="text"
                placeholder={`Search for "${placeholder}"...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={onSearchKeyDown}
                className="flex-1 bg-transparent outline-none text-sm font-medium
                           text-zinc-900 placeholder:text-zinc-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 hover:bg-zinc-200/60 rounded-full transition-colors shrink-0"
                  type="button"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              )}
            </div>

            {/* Dropdown results */}
            {searchOpen && searchQuery && (
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
                        <div className="relative w-10 h-12 rounded-lg bg-zinc-100 shrink-0 overflow-hidden">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
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
        </form>

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