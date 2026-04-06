import React from "react";
import { Truck, RotateCcw, ShieldCheck, Gift } from "lucide-react";

export function FeaturesStrip() {
  const features = [
    {
      icon: <Truck className="w-8 h-8 text-brand" />,
      title: "Free Delivery",
      subtitle: "On orders above ₹499",
    },
    {
      icon: <RotateCcw className="w-8 h-8 text-brand" />,
      title: "Easy Returns",
      subtitle: "7-day hassle-free returns",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-brand" />,
      title: "Secure Payments",
      subtitle: "100% safe checkout",
    },
    {
      icon: <Gift className="w-8 h-8 text-brand" />,
      title: "Gift Wrapping",
      subtitle: "Available on all orders",
    },
  ];

  return (
    <section className="py-12 bg-zinc-50 border-y border-zinc-200 mt-12 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
        {features.map((feature, idx) => (
          <div 
            key={idx} 
            className="flex flex-col md:flex-row items-center text-center md:text-left gap-4 md:gap-6 group"
          >
            <div className="p-4 rounded-2xl bg-white shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:bg-brand/5">
              {feature.icon}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm md:text-base font-bold text-zinc-900 font-heading">
                {feature.title}
              </h4>
              <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-tight">
                {feature.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
