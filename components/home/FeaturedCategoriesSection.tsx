import React from "react";
import prisma from "@/lib/prisma";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { getSiteSetting } from "@/lib/actions/settings-actions";

async function getFeaturedGroups() {
  const groups = await prisma.featuredGroup.findMany({
    orderBy: {
      order: 'asc',
    },
    include: {
      categories: true
    }
  });

  return groups;
}

export async function FeaturedCategoriesSection() {
  // ✅ Check if the section should be visible
  const isVisible = await getSiteSetting("show_featured_categories", "true");
  
  if (isVisible === "false") return null;

  const groups = await getFeaturedGroups();

  if (groups.length === 0) return null;

  // Map FeaturedGroup to the format CategoryGrid expects
  // Although CategoryGrid might need refinement to handle "Featured Groups" specifically
  return <CategoryGrid categories={groups as any} />;
}
