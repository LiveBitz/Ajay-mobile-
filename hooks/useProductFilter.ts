import { useState, useMemo, useEffect } from "react";
import {
  extractAvailableBaseSizes,
  extractColors,
  getTotalStock,
  hasAvailableVariant,
} from "@/lib/inventory";

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

const normalizeArray = (val: unknown): string[] => {
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

const hasProductStock = (product: Product): boolean => {
  const sizes = normalizeArray(product.sizes);
  const totalStock = getTotalStock(sizes);
  return totalStock > 0 || product.stock > 0;
};

const matchesAvailableVariantFilters = (product: Product, filters: Filters): boolean => {
  const sizes = normalizeArray(product.sizes);

  if (filters.sizes.length === 0 && filters.colors.length === 0) {
    return true;
  }

  const availableSizes = extractAvailableBaseSizes(sizes);
  const availableColors = extractColors(sizes);

  const selectedSizes = filters.sizes.length > 0 ? filters.sizes : availableSizes;
  const selectedColors = filters.colors.length > 0 ? filters.colors : availableColors;

  if (filters.sizes.length > 0 && availableSizes.length === 0) return false;
  if (filters.colors.length > 0 && availableColors.length === 0) return false;

  if (filters.sizes.length > 0 && filters.colors.length > 0) {
    return selectedSizes.some((size) =>
      selectedColors.some((color) => hasAvailableVariant(sizes, size, color))
    );
  }

  if (filters.sizes.length > 0) {
    return selectedSizes.some((size) => hasAvailableVariant(sizes, size));
  }

  return selectedColors.some((color) =>
    availableSizes.some((size) => hasAvailableVariant(sizes, size, color))
  );
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
    return source.filter(hasProductStock);
  }, [facetProducts, products]);

  // For product grid: only the products passed in (one page from the API).
  const baseProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(hasProductStock);
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
      extractAvailableBaseSizes(normalizeArray(p.sizes)).forEach((size) => {
        sCounts[size] = (sCounts[size] || 0) + 1;
      });

      extractColors(normalizeArray(p.sizes)).forEach((color) => {
        cCounts[color] = (cCounts[color] || 0) + 1;
      });

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
      queueMicrotask(() => {
        setFilters(prev => ({ 
          ...prev, 
          priceRange: [0, counts.maxPrice] 
        }));
      });
    }
  }, [counts.maxPrice]);

  const filteredProducts = useMemo(() => {
    return baseProducts
      .filter((p) => matchesAvailableVariantFilters(p, filters))
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
