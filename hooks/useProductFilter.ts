import { useState, useMemo } from "react";

export type Product = {
  id: string;
  name: string;
  categoryId: string;
  category?: {
    name: string;
    slug: string;
  };
  subCategory: string;
  price: number;
  originalPrice: number;
  discount: number;
  sizes: string[];
  colors: string[];
  image: string;
  isNew: boolean;
  isBestSeller: boolean;
};

export type Filters = {
  sizes: string[];
  colors: string[];
  priceRange: [number, number];
  discount: number;
  subCategories: string[];
};

export function useProductFilter(products: Product[], slug: string) {
  const [filters, setFilters] = useState<Filters>({
    sizes: [],
    colors: [],
    priceRange: [0, 10000], // Increased for real data
    discount: 0,
    subCategories: [],
  });
  
  const [sortBy, setSortBy] = useState("relevance");

  // Filter products by category/slug first
  const baseProducts = useMemo(() => {
    if (!products || !slug) return [];
    
    const targetSlug = String(slug).toLowerCase();
    
    if (targetSlug === "sale") return products.filter((p) => p.discount > 0);
    if (targetSlug === "new-arrivals") return products.filter((p) => p.isNew);
    
    return products.filter((p) => {
      const categorySlug = p.category?.slug?.toLowerCase();
      return (categorySlug && categorySlug === targetSlug) || p.categoryId === slug;
    });
  }, [products, slug]);

  // Compute counts based on data in this category
  const counts = useMemo(() => {
    const sCounts: Record<string, number> = {};
    const cCounts: Record<string, number> = {};
    const subCounts: Record<string, number> = {};
    let max = 0;

    baseProducts.forEach((p) => {
      p.sizes.forEach((s) => (sCounts[s] = (sCounts[s] || 0) + 1));
      p.colors.forEach((c) => (cCounts[c] = (cCounts[c] || 0) + 1));
      subCounts[p.subCategory] = (subCounts[p.subCategory] || 0) + 1;
      if (p.price > max) max = p.price;
    });

    const calculatedMax = Math.ceil((max || 10000) / 100) * 100;

    return { 
      sizes: sCounts, 
      colors: cCounts, 
      subCategories: subCounts,
      maxPrice: calculatedMax
    };
  }, [baseProducts]);

  // Sync price range when category changes
  const [lastMaxPrice, setLastMaxPrice] = useState(counts.maxPrice);
  if (counts.maxPrice !== lastMaxPrice) {
    setLastMaxPrice(counts.maxPrice);
    setFilters(prev => ({ ...prev, priceRange: [0, counts.maxPrice] }));
  }

  const filteredProducts = useMemo(() => {
    return baseProducts
      .filter(
        (p) =>
          filters.sizes.length === 0 ||
          p.sizes.some((s) => filters.sizes.includes(s))
      )
      .filter(
        (p) =>
          filters.colors.length === 0 ||
          p.colors.some((c) => filters.colors.includes(c))
      )
      .filter(
        (p) =>
          p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
      )
      .filter((p) => p.discount >= filters.discount)
      .filter(
        (p) =>
          filters.subCategories.length === 0 ||
          filters.subCategories.includes(p.subCategory)
      )
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "discount") return b.discount - a.discount;
        if (sortBy === "newest") return b.id.localeCompare(a.id); // String ID comparison
        return 0;
      });
  }, [baseProducts, filters, sortBy]);

  const activeFilterCount =
    filters.sizes.length +
    filters.colors.length +
    filters.subCategories.length +
    (filters.discount > 0 ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000 ? 1 : 0);

  return {
    filters,
    setFilters,
    sortBy,
    setSortBy,
    filteredProducts,
    activeFilterCount,
    counts,
  };
}
