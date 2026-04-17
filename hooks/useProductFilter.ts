import { useState, useMemo, useEffect } from "react";

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
  stock: number;
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

const normalizeArray = (val: any): string[] => {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

// Calculate total stock from size variants (format: "S:10", "S-White:5", etc.)
const getTotalStock = (sizes: string[]): number => {
  if (!Array.isArray(sizes)) return 0;
  return sizes.reduce((total, sizeStr) => {
    if (typeof sizeStr === "string" && sizeStr.includes(":")) {
      const [_, quantity] = sizeStr.split(":");
      return total + (parseInt(quantity) || 0);
    }
    return total;
  }, 0);
};

export function useProductFilter(
  products: Product[],
  slug: string,
  /**
   * Optional: pass the FULL category product list (lightweight fields) so the
   * filter sidebar always shows accurate counts even when `products` is only
   * a single page of results. When omitted, counts are derived from `products`.
   */
  facetProducts?: Product[]
) {
  const [filters, setFilters] = useState<Filters>({
    sizes: [],
    colors: [],
    priceRange: [0, 10000],
    discount: 0,
    subCategories: [],
  });

  const [sortBy, setSortBy] = useState("relevance");

  // For filter sidebar counts: use the full category list when available,
  // otherwise fall back to the current page of products.
  const countSource = useMemo(() => {
    const source = facetProducts && facetProducts.length > 0 ? facetProducts : products;
    return source.filter((p) => {
      const totalStock = getTotalStock(normalizeArray(p.sizes));
      const legacyStock = (p as any).stock || 0;
      return totalStock > 0 || legacyStock > 0;
    });
  }, [facetProducts, products]);

  // For product grid: only the products passed in (one page from the API).
  const baseProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const totalStock = getTotalStock(normalizeArray(p.sizes));
      const legacyStock = (p as any).stock || 0;
      return totalStock > 0 || legacyStock > 0;
    });
  }, [products]);

  // Compute counts based on data in this category
  const counts = useMemo(() => {
    const sCounts: Record<string, number> = {};
    const cCounts: Record<string, number> = {};
    const subCounts: Record<string, number> = {};
    let max = 0;

    if (countSource && countSource.length > 0) {
      countSource.forEach((p) => {
        const price = typeof p.price === 'number' ? p.price : parseFloat(String(p.price) || '0');
        if (!isNaN(price) && price > max) {
          max = price;
        }
      });
    }

    countSource.forEach((p) => {
      // Sum actual inventory units per size (handles both "SIZE:QTY", "SIZE-COLOR:QTY", and "SIZE" formats)
      normalizeArray(p.sizes).forEach((s) => {
        const parts = s.split(":");
        // Handle both "S:10" and "S-White:5" formats
        const fullSize = parts[0];
        const size = fullSize.includes("-") ? fullSize.split("-")[0] : fullSize;
        
        // If format has quantity (both "SIZE:QTY" and "SIZE-COLOR:QTY")
        let quantity = 0;
        if (parts.length > 1) {
          quantity = parseInt(parts[1]) || 0;
        } else {
          // Legacy format without qty - distribute total stock across all sizes
          const totalStock = (p as any).stock || 0;
          const sizeCount = normalizeArray(p.sizes).length;
          quantity = sizeCount > 0 ? Math.ceil(totalStock / sizeCount) : totalStock;
        }
        
        // Only count if size has available stock
        if (quantity > 0) {
          sCounts[size] = (sCounts[size] || 0) + quantity;
        }
      });
      
      normalizeArray(p.colors).forEach((c) => (cCounts[c] = (cCounts[c] || 0) + 1));
      subCounts[p.subCategory] = (subCounts[p.subCategory] || 0) + 1;
    });

    const calculatedMax = max > 0 ? Math.ceil(max / 100) * 100 : 1000;

    return {
      sizes: sCounts,
      colors: cCounts,
      subCategories: subCounts,
      maxPrice: calculatedMax,
    };
  }, [countSource]);

  // Update price range when category maxPrice changes
  useEffect(() => {
    if (counts.maxPrice > 0) {
      setFilters(prev => ({ 
        ...prev, 
        priceRange: [0, counts.maxPrice] 
      }));
    }
  }, [counts.maxPrice]);

  const filteredProducts = useMemo(() => {
    return baseProducts
      .filter(
        (p) =>
          filters.sizes.length === 0 ||
          normalizeArray(p.sizes).some((s) => filters.sizes.includes(s.split(":")[0]))
      )
      .filter(
        (p) =>
          filters.colors.length === 0 ||
          normalizeArray(p.colors).some((c) => filters.colors.includes(c))
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
