export type Gender = "woman" | "man" | "kids" | "unisex";

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  parentId?: string;
  gender: Gender;
  image?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IProductColor {
  name: string;
  hex: string;
  image?: string;
}

export interface IProductSize {
  name: string;
  inStock: boolean;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  categoryIds: string[];
  images: string[];
  colors: IProductColor[];
  sizes: IProductSize[];
  tags: string[];
  materials?: string[];
  careInstructions?: string;
  isNewArrival: boolean;
  isTrending: boolean;
  isSale: boolean;
  gender: Gender;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  _id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: "user" | "admin";
  wishlist: string[];
  addresses: IAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface IAddress {
  _id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface ICartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface ILook {
  _id: string;
  image: string;
  userName?: string;
  caption?: string;
  instagramHandle?: string;
  likes: number;
  isFeatured: boolean;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IHeroSection {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  leftImage?: string;
  rightImage?: string;
  ctaText: string;
  ctaLink: string;
  sortOrder: number;
  isActive: boolean;
  gender: Gender;
  createdAt: string;
  updatedAt: string;
}

export interface INavItem {
  _id: string;
  label: string;
  href: string;
  position: "header-main" | "header-secondary" | "sidebar" | "footer";
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  userId: string;
  items: ICartItem[];
  shippingAddress: IAddress;
  billingAddress: IAddress;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: "cod" | "online" | "card";
  totalAmount: number;
  shippingCost: number;
  discountAmount: number;
  finalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IReview {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITrackingEvent {
  _id: string;
  visitorId: string;
  userId?: string;
  eventType: string;
  productId?: string;
  url?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}
