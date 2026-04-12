import React from "react";
import { Truck, RotateCcw, ShieldCheck, Gift } from "lucide-react";

export function FeaturesStrip() {
  const features = [
    {
      icon: <Truck className="w-5 h-5 text-zinc-600" />,
      title: "Free Delivery",
      subtitle: "On orders above ₹499",
    },
    {
      icon: <RotateCcw className="w-5 h-5 text-zinc-600" />,
      title: "Easy Returns",
      subtitle: "7-day hassle-free returns",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-zinc-600" />,
      title: "Secure Payments",
      subtitle: "100% safe checkout",
    },
    {
      icon: <Gift className="w-5 h-5 text-zinc-600" />,
      title: "Warranty Support",
      subtitle: "Complete device protection included",
    },
  ];

  return (
    <section className="py-10 md:py-14 bg-white border-y border-zinc-100">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="group flex flex-row sm:flex-col items-center sm:items-center text-left sm:text-center gap-4 sm:gap-3 p-4 rounded-xl hover:bg-zinc-50 transition-all duration-200"
          >
            <div className="p-2.5 rounded-xl bg-zinc-100 shrink-0">
              {feature.icon}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-900">{feature.title}</h4>
              <p className="text-xs text-zinc-500 mt-0.5">{feature.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
