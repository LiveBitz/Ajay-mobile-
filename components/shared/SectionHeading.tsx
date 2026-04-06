import React from "react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
}

export function SectionHeading({ title, subtitle, trailing }: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between mb-8 group">
      <div className="space-y-1">
        <div className="relative inline-block">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <div className="absolute -bottom-1 left-0 w-1/3 h-1 bg-brand rounded-full transition-all duration-300 group-hover:w-full" />
        </div>
        {subtitle && (
          <p className="text-sm md:text-base text-muted-foreground max-w-lg">
            {subtitle}
          </p>
        )}
      </div>
      {trailing && <div className="text-sm font-medium">{trailing}</div>}
    </div>
  );
}
