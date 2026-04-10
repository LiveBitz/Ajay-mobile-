/**
 * Core Type Definitions
 * Replace all 'any' types with proper interfaces
 */

import { ProductSize } from "./inventory-validator";

// ============== PRODUCT TYPES ==============

export interface IProductSize {
  size: string;
  quantity: number;
}

export enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DISCONTINUED = "DISCONTINUED",
}

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  sizes: IProductSize[]; // Modern format: array of {size, quantity}
  isNew: boolean;
  isBestSeller: boolean;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductWithCategory extends IProduct {
  category: ICategory;
}

export interface ICreateProductInput {
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  sizes: Record<string, number>; // {M: 10, L: 15}
  isNew?: boolean;
  isBestSeller?: boolean;
}

export interface IUpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  categoryId?: string;
  sizes?: Record<string, number>;
  isNew?: boolean;
  isBestSeller?: boolean;
  status?: ProductStatus;
}

// ============== CATEGORY TYPES ==============

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCategoryInput {
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

// ============== ORDER TYPES ==============

export interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: IProduct;
  size: string;
  quantity: number;
  priceAtPurchase: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export interface IOrder {
  id: string;
  userId: string;
  items: IOrderItem[];
  address: string;
  postalCode?: string;
  city?: string;
  state?: string;
  contactInfo: string;
  paymentMethod: string;
  status: OrderStatus;
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateOrderInput {
  items: Array<{
    productId: string;
    size: string;
    quantity: number;
  }>;
  address: string;
  postalCode?: string;
  city?: string;
  state?: string;
  contactInfo: string;
  paymentMethod?: string;
}

// ============== ADDRESS TYPES ==============

export interface IAddress {
  id: string;
  userId: string;
  address: string;
  postalCode?: string;
  city?: string;
  state?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateAddressInput {
  address: string;
  postalCode?: string;
  city?: string;
  state?: string;
  isDefault?: boolean;
}

// ============== WISHLIST TYPES ==============

export interface IWishlist {
  id: string;
  userId: string;
  productId: string;
  product?: IProduct;
  createdAt: Date;
}

// ============== BANNER TYPES ==============

export interface IBanner {
  id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateBannerInput {
  title: string;
  description?: string;
  image: string;
  link?: string;
  order?: number;
  isActive?: boolean;
}

// ============== API RESPONSE TYPES ==============

export interface IApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface IApiErrorResponse {
  error: string;
  status: number;
  retryAfter?: number;
}

export interface IPaginationParams {
  page?: number;
  limit?: number;
  skip?: number;
  take?: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
  hasMore: boolean;
}
