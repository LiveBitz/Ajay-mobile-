import React from "react";
import { Truck, RotateCcw, ShieldCheck, Gift } from "lucide-react";

export function FeaturesStrip() {
  const features = [
    {
      icon: <Truck className="w-6 h-6 text-brand" />,
      title: "Free Delivery",
      subtitle: "On orders above ₹499",
    },
    {
      icon: <RotateCcw className="w-6 h-6 text-brand" />,
      title: "Easy Returns",
      subtitle: "7-day hassle-free returns",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-brand" />,
      title: "Secure Payments",
      subtitle: "100% safe checkout",
    },
    {
      icon: <Gift className="w-6 h-6 text-brand" />,
      title: "Warranty Support",
      subtitle: "Complete device protection included",
    },
  ];

  return (
    <section className="py-12 md:py-14 bg-white border-y border-zinc-200">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {features.map((feature, idx) => (
          <div 
            key={idx} 
            className="flex flex-col items-center text-center space-y-3"
          >
            <div className="p-3 rounded-lg bg-brand/10">
              {feature.icon}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm md:text-base font-semibold text-zinc-900">
                {feature.title}
              </h4>
              <p className="text-xs text-zinc-600 font-medium">
                {feature.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
