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
    <section className="py-12 md:py-14 lg:py-16 bg-gradient-to-r from-stone-50 via-white to-stone-50 border-y-2 border-stone-100">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="group flex flex-col items-center text-center space-y-3 p-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300"
          >
            <div className="p-3 md:p-4 rounded-2xl bg-brand/10 group-hover:bg-brand/15 transition-colors duration-300">
              {feature.icon}
            </div>
            <div className="space-y-2">
              <h4 className="text-sm md:text-base font-bold text-stone-900">
                {feature.title}
              </h4>
              <p className="text-xs md:text-sm text-stone-600 font-medium">
                {feature.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
