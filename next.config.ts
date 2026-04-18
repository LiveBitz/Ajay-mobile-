import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ============================================
  // IMAGE OPTIMIZATION - Bandwidth Reduction
  // ============================================
  images: {
    formats: ["image/avif", "image/webp"],  // Modern formats (60% smaller)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 85, 88, 90],
    
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "zjhxlwanzqdigsvqxzau.supabase.co",
      },
      // ✅ Added - current Supabase project
      {
        protocol: "https",
        hostname: "zmsbmnxqhmxaaemnswzc.supabase.co",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },

  // ============================================
  // SECURITY HEADERS & CACHE CONTROL
  // ============================================
  async headers() {
    // Content-Security-Policy — tightened per actual usage:
    //   - next.js needs 'unsafe-inline' for its runtime style injection
    //   - WhatsApp redirect opens an external URL (handled client-side, no fetch)
    //   - Images come from several external CDNs (listed in img-src)
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // unsafe-eval needed by Next.js dev/turbopack
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://picsum.photos https://i.pinimg.com https://images.unsplash.com https://i.imgur.com https://zmsbmnxqhmxaaemnswzc.supabase.co https://zjhxlwanzqdigsvqxzau.supabase.co https://api.dicebear.com https://placehold.co",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://nominatim.openstreetmap.org",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      // HTML pages - short cache for real-time updates
      {
        source: "/((?!api|_next/static|_next/image|favicon\\.ico).*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(self), microphone=(), camera=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: csp,
          },
          // Short cache for HTML pages (5 minutes) + revalidate + CDN
          {
            key: "Cache-Control",
            value: "public, max-age=300, s-maxage=300, stale-while-revalidate=86400, stale-if-error=86400",
          },
        ],
      },
      // Static assets - long cache (immutable)
      {
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Next.js static files - long cache
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Images - moderate cache
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=2592000",
          },
        ],
      },
      // API routes - no cache by default
      {
        source: "/api/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400",
          },
          {
            key: "Cache-Control",
            value: "private, no-store, must-revalidate",
          },
        ],
      },
    ];
  },

  // ============================================
  // REDIRECTS
  // ============================================
  async redirects() {
    return [
      {
        source: "/products",
        destination: "/category",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;