"use client";

import { Smartphone, Cpu, Zap, Star, Wifi, BatteryCharging, Bluetooth } from "lucide-react";

const ICONS = [Smartphone, Cpu, Zap, Star, Wifi, BatteryCharging, Bluetooth, Smartphone];

// Fixed, hand-picked positions/timings — deterministic on purpose so server and
// client render the same markup (Math.random() here would cause a hydration
// mismatch). Values are staggered to keep the rain feeling continuous.
const DROPS = [
  { left: "4%",  size: 15, delay: 0.0, duration: 6.5, icon: 0 },
  { left: "13%", size: 11, delay: 1.6, duration: 7.4, icon: 1 },
  { left: "22%", size: 17, delay: 3.1, duration: 6.0, icon: 2 },
  { left: "31%", size: 12, delay: 0.7, duration: 7.8, icon: 3 },
  { left: "41%", size: 19, delay: 4.2, duration: 6.3, icon: 0 },
  { left: "51%", size: 13, delay: 2.0, duration: 7.1, icon: 4 },
  { left: "61%", size: 16, delay: 0.3, duration: 6.8, icon: 5 },
  { left: "70%", size: 12, delay: 3.6, duration: 7.5, icon: 6 },
  { left: "79%", size: 18, delay: 1.2, duration: 6.2, icon: 7 },
  { left: "88%", size: 14, delay: 4.8, duration: 7.0, icon: 2 },
  { left: "95%", size: 11, delay: 2.6, duration: 6.6, icon: 4 },
];

// Decorative "rain" of small tech icons that falls from the very top of the
// page (over the navbar) and fades out before reaching the hero banner.
// Absolutely positioned relative to the page (not the viewport), so it scrolls
// away naturally once the user scrolls past the top. Purely visual — sits above
// the navbar in stacking order but never intercepts clicks.
export function FallingTechIcons() {
  return (
    <div
      className="absolute top-0 left-0 right-0 overflow-hidden pointer-events-none z-[60]"
      style={{ height: "calc(var(--navbar-height) + 260px)" }}
      aria-hidden="true"
    >
      {DROPS.map((d, i) => {
        const Icon = ICONS[d.icon];
        return (
          <span
            key={i}
            className="falling-tech-icon absolute top-0 text-brand"
            style={{
              left: d.left,
              animationDelay: `${d.delay}s`,
              animationDuration: `${d.duration}s`,
            }}
          >
            <Icon size={d.size} strokeWidth={1.5} />
          </span>
        );
      })}

      <style>{`
        .falling-tech-icon {
          animation-name: falling-tech-drop;
          animation-timing-function: ease-in;
          animation-iteration-count: infinite;
          will-change: transform, opacity;
        }
        @keyframes falling-tech-drop {
          0%   { transform: translateY(-24px); opacity: 0; }
          10%  { opacity: 0.6; }
          65%  { opacity: 0.32; }
          100% { transform: translateY(380px); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .falling-tech-icon { animation: none; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
