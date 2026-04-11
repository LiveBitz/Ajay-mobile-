export type Product = {
  id: number | string;
  name: string;
  slug: string;
  category: any;
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

export const productsBySlug: Record<string, string> = {
  apple: "Apple iPhones",
  samsung: "Samsung Phones",
  oneplus: "OnePlus Devices",
  xiaomi: "Xiaomi Phones",
  realme: "Realme Phones",
  poco: "Poco Devices",
};

export const allProducts: any[] = [
  // Apple
  { id: 1, name: "iPhone 15 Pro Max", category: "apple", subCategory: "Flagship", price: 129999, originalPrice: 149999, discount: 13, stock: 12, sizes: ["256GB","512GB","1TB"], colors: ["Titanium Black","Titanium White"], image: "https://picsum.photos/seed/iphone15pro/400/400", isNew: true, isBestSeller: true },
  { id: 2, name: "iPhone 15", category: "apple", subCategory: "Standard", price: 79999, originalPrice: 99999, discount: 20, stock: 18, sizes: ["128GB","256GB","512GB"], colors: ["Black","Blue","Pink"], image: "https://picsum.photos/seed/iphone15/400/400", isNew: true, isBestSeller: true },
  { id: 3, name: "iPhone 14 Pro", category: "apple", subCategory: "Flagship", price: 99999, originalPrice: 129999, discount: 23, stock: 8, sizes: ["128GB","256GB","512GB"], colors: ["Space Black","Gold"], image: "https://picsum.photos/seed/iphone14pro/400/400", isNew: false, isBestSeller: true },
  { id: 4, name: "iPhone SE", category: "apple", subCategory: "Budget", price: 39999, originalPrice: 49999, discount: 20, stock: 24, sizes: ["128GB","256GB"], colors: ["Red","White","Black"], image: "https://picsum.photos/seed/iphonese/400/400", isNew: false, isBestSeller: false },
  
  // Samsung
  { id: 5, name: "Samsung Galaxy S24 Ultra", category: "samsung", subCategory: "Flagship", price: 139999, originalPrice: 159999, discount: 12, stock: 10, sizes: ["256GB","512GB"], colors: ["Phantom Black","Cream"], image: "https://picsum.photos/seed/galaxys24ultra/400/400", isNew: true, isBestSeller: true },
  { id: 6, name: "Samsung Galaxy S24", category: "samsung", subCategory: "Standard", price: 79999, originalPrice: 99999, discount: 20, stock: 16, sizes: ["128GB","256GB"], colors: ["Onyx Black","Amber Gold"], image: "https://picsum.photos/seed/galaxys24/400/400", isNew: true, isBestSeller: true },
  { id: 7, name: "Samsung Galaxy A54", category: "samsung", subCategory: "Mid-Range", price: 35999, originalPrice: 45999, discount: 22, stock: 22, sizes: ["128GB","256GB"], colors: ["Black","Lime"], image: "https://picsum.photos/seed/galaxya54/400/400", isNew: false, isBestSeller: false },
  { id: 8, name: "Samsung Galaxy Z Fold5", category: "samsung", subCategory: "Foldable", price: 154999, originalPrice: 189999, discount: 18, stock: 5, sizes: ["256GB","512GB"], colors: ["Phantom Black","Cream"], image: "https://picsum.photos/seed/galaxyzfold5/400/400", isNew: true, isBestSeller: false },
  
  // OnePlus
  { id: 9, name: "OnePlus 12", category: "oneplus", subCategory: "Flagship", price: 64999, originalPrice: 79999, discount: 19, stock: 14, sizes: ["256GB","512GB"], colors: ["Black","White"], image: "https://picsum.photos/seed/oneplus12/400/400", isNew: true, isBestSeller: true },
  { id: 10, name: "OnePlus 12R", category: "oneplus", subCategory: "Mid-Range", price: 42999, originalPrice: 54999, discount: 22, stock: 20, sizes: ["128GB","256GB"], colors: ["Cool Black","Astro Black"], image: "https://picsum.photos/seed/oneplus12r/400/400", isNew: true, isBestSeller: true },
  { id: 11, name: "OnePlus Nord CE 4", category: "oneplus", subCategory: "Budget", price: 24999, originalPrice: 32999, discount: 24, stock: 30, sizes: ["128GB","256GB"], colors: ["Dark Grey","Silver"], image: "https://picsum.photos/seed/oneplusnordce4/400/400", isNew: false, isBestSeller: false },
  { id: 12, name: "OnePlus Pad", category: "oneplus", subCategory: "Tablet", price: 39999, originalPrice: 49999, discount: 20, stock: 8, sizes: ["128GB","256GB"], colors: ["Halo Grey","Moonstone Black"], image: "https://picsum.photos/seed/oneluspad/400/400", isNew: false, isBestSeller: false },
  
  // Xiaomi
  { id: 13, name: "Xiaomi 14 Ultra", category: "xiaomi", subCategory: "Flagship", price: 84999, originalPrice: 99999, discount: 15, stock: 11, sizes: ["256GB","512GB"], colors: ["Black","White","Gold"], image: "https://picsum.photos/seed/xiaomi14ultra/400/400", isNew: true, isBestSeller: true },
  { id: 14, name: "Xiaomi 14", category: "xiaomi", subCategory: "Standard", price: 52999, originalPrice: 64999, discount: 18, stock: 19, sizes: ["256GB","512GB"], colors: ["Black","White"], image: "https://picsum.photos/seed/xiaomi14/400/400", isNew: true, isBestSeller: true },
  { id: 15, name: "Xiaomi 13 Lite", category: "xiaomi", subCategory: "Mid-Range", price: 29999, originalPrice: 39999, discount: 25, stock: 25, sizes: ["128GB","256GB"], colors: ["Black","Green"], image: "https://picsum.photos/seed/xiaomi13lite/400/400", isNew: false, isBestSeller: false },
  { id: 16, name: "Xiaomi Redmi Note 13", category: "xiaomi", subCategory: "Budget", price: 16999, originalPrice: 22999, discount: 26, stock: 35, sizes: ["128GB"], colors: ["Black","Blue","Silver"], image: "https://picsum.photos/seed/redminote13/400/400", isNew: false, isBestSeller: false },
  
  // Realme
  { id: 17, name: "Realme GT 5 Pro", category: "realme", subCategory: "Flagship", price: 54999, originalPrice: 69999, discount: 21, stock: 13, sizes: ["256GB","512GB"], colors: ["Green","Titanium Black"], image: "https://picsum.photos/seed/realmeGT5pro/400/400", isNew: true, isBestSeller: true },
  { id: 18, name: "Realme 12 Pro+", category: "realme", subCategory: "Mid-Range", price: 34999, originalPrice: 44999, discount: 22, stock: 23, sizes: ["128GB","256GB"], colors: ["Gold","Black"], image: "https://picsum.photos/seed/realme12proplus/400/400", isNew: true, isBestSeller: false },
  { id: 19, name: "Realme 12", category: "realme", subCategory: "Budget", price: 19999, originalPrice: 27999, discount: 29, stock: 32, sizes: ["128GB","256GB"], colors: ["Starlight Blue","Midnight Black"], image: "https://picsum.photos/seed/realme12/400/400", isNew: false, isBestSeller: false },
  { id: 20, name: "Realme C67", category: "realme", subCategory: "Entry-Level", price: 9999, originalPrice: 13999, discount: 29, stock: 40, sizes: ["64GB","128GB"], colors: ["Black","Blue"], image: "https://picsum.photos/seed/realmec67/400/400", isNew: false, isBestSeller: false },
  
  // Poco
  { id: 21, name: "Poco F6 Pro", category: "poco", subCategory: "Flagship", price: 39999, originalPrice: 49999, discount: 20, stock: 15, sizes: ["256GB","512GB"], colors: ["Black","Blue","White"], image: "https://picsum.photos/seed/pocof6pro/400/400", isNew: true, isBestSeller: true },
  { id: 22, name: "Poco X6", category: "poco", subCategory: "Mid-Range", price: 24999, originalPrice: 33999, discount: 26, stock: 26, sizes: ["128GB","256GB"], colors: ["Black","Silver","Gold"], image: "https://picsum.photos/seed/pocox6/400/400", isNew: true, isBestSeller: false },
  { id: 23, name: "Poco M6", category: "poco", subCategory: "Budget", price: 12999, originalPrice: 17999, discount: 28, stock: 38, sizes: ["128GB"], colors: ["Black","Green","Gold"], image: "https://picsum.photos/seed/pocom6/400/400", isNew: false, isBestSeller: false },
  { id: 24, name: "Poco C65", category: "poco", subCategory: "Entry-Level", price: 8999, originalPrice: 11999, discount: 25, stock: 45, sizes: ["64GB","128GB"], colors: ["Black","Blue"], image: "https://picsum.photos/seed/pococ65/400/400", isNew: false, isBestSeller: false },
];

export const products = (allProducts as any[]).map(p => ({
  id: p.id,
  name: p.name,
  slug: p.slug || p.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""),
  category: p.category.charAt(0).toUpperCase() + p.category.slice(1),
  subCategory: p.subCategory,
  price: p.price,
  originalPrice: p.originalPrice,
  discount: p.discount,
  stock: p.stock,
  sizes: p.sizes,
  colors: p.colors,
  image: p.image,
  isNew: p.isNew,
  isBestSeller: p.isBestSeller,
}));

export const categories = [
  { id: 1, name: "Apple", image: "https://picsum.photos/seed/cat-apple/600/600" },
  { id: 2, name: "Samsung", image: "https://picsum.photos/seed/cat-samsung/600/600" },
  { id: 3, name: "OnePlus", image: "https://picsum.photos/seed/cat-oneplus/600/600" },
  { id: 4, name: "Xiaomi", image: "https://picsum.photos/seed/cat-xiaomi/600/600" },
  { id: 5, name: "Realme", image: "https://picsum.photos/seed/cat-realme/600/600" },
  { id: 6, name: "Poco", image: "https://picsum.photos/seed/cat-poco/600/600" },
];

export const heroSlides = [
  {
    id: 1,
    title: "PREMIUM\nMENSWEAR",
    subtitle: "Redefine your wardrobe with our signature essentials.",
    image: "https://picsum.photos/seed/hero-men/1400/600",
  },
  {
    id: 2,
    title: "LUXURY\nTIMEPIECES",
    subtitle: "Elegance on your wrist. Explore the watch collection.",
    image: "https://picsum.photos/seed/hero-watch/1400/600",
  },
  {
    id: 3,
    title: "SIGNATURE\nFRAGRANCES",
    subtitle: "Make a lasting impression with our luxury perfumes.",
    image: "https://picsum.photos/seed/hero-perf/1400/600",
  },
];
