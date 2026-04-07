export interface CartItem {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  quantity: number;
  size: string;
  stock: number;
}

export const mockCartItems: CartItem[] = [
  {
    id: 1,
    name: "Classic White Oversized Tee",
    category: "Men",
    price: 699,
    originalPrice: 999,
    discount: 30,
    image: "https://picsum.photos/seed/p1/400/400",
    quantity: 1,
    size: "L",
    stock: 10
  }
];
