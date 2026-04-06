export type Product = {
  id: number | string;
  name: string;
  slug: string;
  category: any;
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

export const productsBySlug: Record<string, string> = {
  men: "Men's Collection",
  watches: "Watches Collection",
  perfumes: "Luxury Perfumes",
  accessories: "Premium Accessories",
};

export const allProducts: any[] = [
  { id: 1, name: "Classic White Oversized Tee", category: "men", subCategory: "T-Shirts", price: 699, originalPrice: 999, discount: 30, sizes: ["S","M","L","XL"], colors: ["White","Black"], image: "https://picsum.photos/seed/p1/400/400", isNew: true, isBestSeller: false },
  { id: 2, name: "Acid Wash Graphic Tee", category: "men", subCategory: "T-Shirts", price: 799, originalPrice: 1099, discount: 27, sizes: ["M","L","XL","XXL"], colors: ["Grey","Black"], image: "https://picsum.photos/seed/p2/400/400", isNew: false, isBestSeller: true },
  { id: 3, name: "Pullover Hoodie - Navy", category: "men", subCategory: "Hoodies", price: 1299, originalPrice: 1799, discount: 28, sizes: ["S","M","L"], colors: ["Navy","Black"], image: "https://picsum.photos/seed/p3/400/400", isNew: true, isBestSeller: false },
  { id: 4, name: "Slim Fit Polo", category: "men", subCategory: "T-Shirts", price: 599, originalPrice: 849, discount: 29, sizes: ["S","M","L","XL"], colors: ["White","Navy","Red"], image: "https://picsum.photos/seed/p4/400/400", isNew: false, isBestSeller: true },
  { id: 5, name: "Cargo Jogger Pants", category: "men", subCategory: "Joggers", price: 1099, originalPrice: 1499, discount: 27, sizes: ["M","L","XL"], colors: ["Black","Grey"], image: "https://picsum.photos/seed/p5/400/400", isNew: false, isBestSeller: false },
  { id: 6, name: "Drop Shoulder Tee - Olive", category: "men", subCategory: "T-Shirts", price: 749, originalPrice: 999, discount: 25, sizes: ["M","L","XL","XXL"], colors: ["Green","Black"], image: "https://picsum.photos/seed/p6/400/400", isNew: true, isBestSeller: false },
  { id: 7, name: "Zip-Up Bomber Jacket", category: "men", subCategory: "Jackets", price: 1899, originalPrice: 2499, discount: 24, sizes: ["S","M","L"], colors: ["Black","Navy"], image: "https://picsum.photos/seed/p7/400/400", isNew: true, isBestSeller: false },
  { id: 8, name: "French Terry Sweatshirt", category: "men", subCategory: "Hoodies", price: 999, originalPrice: 1399, discount: 29, sizes: ["M","L","XL"], colors: ["Grey","White"], image: "https://picsum.photos/seed/p8/400/400", isNew: false, isBestSeller: true },
  
  // Watches
  { id: 9, name: "Classic Silver Watch", category: "watches", subCategory: "Analog", price: 2499, originalPrice: 3499, discount: 29, sizes: ["One Size"], colors: ["Grey","White"], image: "https://picsum.photos/seed/w1/400/400", isNew: true, isBestSeller: true },
  { id: 10, name: "Minimalist Black Watch", category: "watches", subCategory: "Analog", price: 1999, originalPrice: 2999, discount: 33, sizes: ["One Size"], colors: ["Black"], image: "https://picsum.photos/seed/w2/400/400", isNew: false, isBestSeller: true },
  { id: 11, name: "Sport Digital Watch", category: "watches", subCategory: "Digital", price: 1299, originalPrice: 1799, discount: 28, sizes: ["One Size"], colors: ["Black","Blue"], image: "https://picsum.photos/seed/w3/400/400", isNew: true, isBestSeller: false },
  { id: 12, name: "Chronograph Leather", category: "watches", subCategory: "Chronograph", price: 4499, originalPrice: 5999, discount: 25, sizes: ["One Size"], colors: ["Brown","Black"], image: "https://picsum.photos/seed/w4/400/400", isNew: true, isBestSeller: false },
  { id: 13, name: "Luxury Gold Watch", category: "watches", subCategory: "Analog", price: 5999, originalPrice: 8999, discount: 33, sizes: ["One Size"], colors: ["Yellow"], image: "https://picsum.photos/seed/w5/400/400", isNew: false, isBestSeller: true },
  { id: 14, name: "Military Rugged Watch", category: "watches", subCategory: "Digital", price: 1499, originalPrice: 1999, discount: 25, sizes: ["One Size"], colors: ["Green","Black"], image: "https://picsum.photos/seed/w6/400/400", isNew: false, isBestSeller: false },
  { id: 15, name: "Skeleton Automatic", category: "watches", subCategory: "Analog", price: 7999, originalPrice: 10999, discount: 27, sizes: ["One Size"], colors: ["Grey","Black"], image: "https://picsum.photos/seed/w7/400/400", isNew: true, isBestSeller: false },
  { id: 16, name: "Retro Digital Blue", category: "watches", subCategory: "Digital", price: 999, originalPrice: 1499, discount: 33, sizes: ["One Size"], colors: ["Blue"], image: "https://picsum.photos/seed/w8/400/400", isNew: false, isBestSeller: false },

  // Perfumes
  { id: 17, name: "Oud Royale EDP", category: "perfumes", subCategory: "EDP", price: 3499, originalPrice: 4999, discount: 30, sizes: ["50ml", "100ml"], colors: ["Gold"], image: "https://picsum.photos/seed/perf1/400/400", isNew: true, isBestSeller: true },
  { id: 18, name: "Oceanic Mist EDT", category: "perfumes", subCategory: "EDT", price: 1899, originalPrice: 2599, discount: 27, sizes: ["100ml"], colors: ["Blue"], image: "https://picsum.photos/seed/perf2/400/400", isNew: false, isBestSeller: true },
  { id: 19, name: "Midnight Musk", category: "perfumes", subCategory: "EDP", price: 2799, originalPrice: 3999, discount: 30, sizes: ["100ml"], colors: ["Black"], image: "https://picsum.photos/seed/perf3/400/400", isNew: true, isBestSeller: false },
  { id: 20, name: "Citrus Bloom", category: "perfumes", subCategory: "EDT", price: 1499, originalPrice: 1999, discount: 25, sizes: ["50ml"], colors: ["Orange"], image: "https://picsum.photos/seed/perf4/400/400", isNew: false, isBestSeller: false },
  
  // Accessories
  { id: 21, name: "Genuine Leather Belt", category: "accessories", subCategory: "Belts", price: 1299, originalPrice: 1799, discount: 28, sizes: ["32","34","36"], colors: ["Brown","Black"], image: "https://picsum.photos/seed/acc1/400/400", isNew: true, isBestSeller: true },
  { id: 22, name: "Aviator Sunglasses", category: "accessories", subCategory: "Eyewear", price: 1999, originalPrice: 2999, discount: 33, sizes: ["One Size"], colors: ["Black","Gold"], image: "https://picsum.photos/seed/acc2/400/400", isNew: false, isBestSeller: true },
  { id: 23, name: "Slim Leather Wallet", category: "accessories", subCategory: "Wallets", price: 899, originalPrice: 1299, discount: 31, sizes: ["One Size"], colors: ["Tan","Black"], image: "https://picsum.photos/seed/acc3/400/400", isNew: true, isBestSeller: false },
  { id: 24, name: "Silver Cufflinks", category: "accessories", subCategory: "Jewelry", price: 1499, originalPrice: 1999, discount: 25, sizes: ["One Size"], colors: ["Grey"], image: "https://picsum.photos/seed/acc4/400/400", isNew: false, isBestSeller: false },
];

export const products = (allProducts as any[]).map(p => ({
  id: p.id,
  name: p.name,
  slug: p.slug || p.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""),
  category: p.category.charAt(0).toUpperCase() + p.category.slice(1),
  price: p.price,
  originalPrice: p.originalPrice,
  discount: p.discount,
  image: p.image,
}));

export const categories = [
  { id: 1, name: "Men", image: "https://picsum.photos/seed/cat-men/600/600" },
  { id: 2, name: "Watches", image: "https://picsum.photos/seed/cat-watch/600/600" },
  { id: 3, name: "Perfumes", image: "https://picsum.photos/seed/cat-perf/600/600" },
  { id: 4, name: "Accessories", image: "https://picsum.photos/seed/cat-acc/600/600" },
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
