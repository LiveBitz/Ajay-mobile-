# SOULED - Next.js E-Commerce Application: Comprehensive Codebase Analysis

**Project Date**: April 2026  
**Analysis Date**: April 7, 2026

---

## 1. PROJECT STRUCTURE & PURPOSE

### Overview
**SOULED** is a premium e-commerce platform built with Next.js, designed as a "conversion-focused clothing shop." It's a modern, full-stack web application for selling high-end fashion items including:
- Men's apparel (T-shirts, hoodies, jackets, pants)
- Luxury watches
- Premium perfumes  
- Accessories (belts, sunglasses, wallets, jewelry)

### Brand Identity
- **Tagline**: "SOULED | Premium Clothing Store"
- **Minimal Design Philosophy**: "souled minimal" suggests a clean, refined aesthetic
- **Core Value**: Experience and conversion-focused commerce with premium positioning

### Primary User Segments
1. **Customers**: Browse, filter, and purchase products; manage carts and addresses
2. **Administrators**: Manage products, categories, banners, and store inventory
3. **Public**: Home page viewers, unauthenticated browsing

---

## 2. ARCHITECTURE OVERVIEW

### 2.1 Entry Points & Page Structure

#### Main Pages
```
app/
├── page.tsx                    # Home - Hero + categories + products + banners
├── login/page.tsx              # Authentication entry
├── signup/page.tsx             # User registration
├── cart/page.tsx               # Shopping cart view
├── profile/page.tsx            # User profile management
│   └── addresses/              # Address management
├── category/[slug]/            # Dynamic category filtering
├── product/[slug]/             # Dynamic product detail page
└── admin/                      # Admin dashboard (protected)
    ├── page.tsx                # Dashboard overview
    ├── entry/page.tsx          # Admin passcode gate
    ├── products/page.tsx       # Product management
    ├── categories/page.tsx     # Category management
    ├── banners/page.tsx        # Banner management
    └── actions/
        └── product.ts          # Server actions for products
```

### 2.2 Core Architecture Pattern

**Hybrid SSR/Client Architecture**:
- **Server Components** (RSC): Home page, product lists, admin pages leverage Prisma + Next.js data fetching
- **Client Components** (**"use client"**): Context providers, interactive features (carousel, filters, cart management)
- **Server Actions** ("use server"): Database mutations, authentication, batch operations

#### Data Flow Diagram
```
Client Browser
    ↓
Middleware (Supabase auth session refresh)
    ↓
Route Handler / Server Component / Server Action
    ↓
Supabase Auth OR Prisma ORM
    ↓
PostgreSQL Database
```

### 2.3 Key Infrastructure Components

#### Authentication Layer
- **Provider**: Supabase (managed PostgreSQL + Auth)
- **Flow**:
  1. User signs up → Supabase creates auth user
  2. Middleware intercepts requests → validates session
  3. Admin access requires additional passcode verification
  4. Auth changes broadcast via Supabase listener

#### Database Layer
- **ORM**: Prisma v7.6.0 with PostgreSQL adapter
- **Connection**: Supabase managed PostgreSQL
- **Regional Probe**: [probe.ts](lib/prisma/probe.ts) detects database region across 6 AWS regions

#### Frontend Framework
- **UI Foundation**: shadcn/ui components with Radix UI
- **Styling**: Tailwind CSS v4 (PostCSS)
- **Fonts**: Google Fonts (Space Grotesk for headings, DM Sans for body)
- **Animations**: Framer Motion, Embla Carousel

### 2.4 Context & State Management

#### CartContext
**Location**: [context/CartContext.tsx](context/CartContext.tsx)  
**Pattern**: React Context API with localStorage persistence

```typescript
Interface CartItem {
  id: string;              // Composite: productId-size-color
  productId: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
}
```

**Features**:
- Local storage sync (key: `souled_cart`)
- Composite ID prevents duplicate variants
- Auto-open cart on item addition (UX conversion signal)
- Total calculation (items count + price)

**Context Methods**:
- `addItem()` - Deduplicate by variant, increment quantity
- `removeItem()` - Delete from cart
- `updateQuantity()` - Adjust by delta, auto-remove if 0
- `clearCart()` - Empty cart

---

## 3. FEATURE AREAS

### 3.1 Authentication & Authorization

#### Sign Up Flow
**File**: [lib/actions/auth-actions.ts](lib/actions/auth-actions.ts)

```typescript
export async function signUp(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${SITE_URL}/auth/callback`
    }
  });
  // Returns success or error message
}
```

#### Sign In Flow
- Standard email/password authentication
- Redirects to `/` on success
- Native Supabase authentication

#### Admin Access Control
**Protection Mechanism**:
1. User must be authenticated (Supabase Auth)
2. User must enter admin passcode → stored in httpOnly cookie (`admin_access`)
3. **Passcode**: "7014" (environment variable: `ADMIN_PASSCODE`)
4. **Cookie Expiry**: 24 hours

**Middleware Check**: [lib/supabase/middleware.ts](lib/supabase/middleware.ts)
```typescript
if (user && isAdminPath && !isEntryPath) {
  const adminAccess = request.cookies.get('admin_access');
  if (!adminAccess || adminAccess.value !== 'true') {
    redirect('/admin/entry');
  }
}
```

#### Public Routes
- `/`, `/login`, `/signup`, `/auth/*`
- Unauthenticated users can browse products and categories

### 3.2 Product Management (Admin)

#### Create Product
**File**: [app/admin/actions/product.ts](app/admin/actions/product.ts)

**Input Fields**:
- Basic: name, slug, category, sub-category
- Pricing: price, originalPrice, discount (%)
- Attributes: sizes[], colors[]
- Media: image (primary), images[] (gallery)
- Metadata: description, features[], isNew, isBestSeller

**Category Logic**:
- **Perfumes**: Auto-populate sizes as ["50ml", "100ml"]
- **Men's Apparel**: Auto-populate sizes as ["S", "M", "L", "XL"]
- **Watches**: "One Size" variant
- Custom sizes allowed

#### Update Product
- Full CRUD via Prisma
- Revalidates `/admin/products` and `/` (Next.js ISR)
- Slug enforcement to ensure unique URLs

#### Delete Product
- Cascading delete via Prisma schema
- Revalidates related paths

### 3.3 Catalog & Shopping

#### Home Page Features
**File**: [app/page.tsx](app/page.tsx)

Components displayed:
1. **HeroBanner** - Carousel of hero images
2. **CategoryGrid** - Browse by category
3. **NewArrivals** - Latest products (isNew: true)
4. **PromoBanner** - Promotional section
5. **BestSellers** - Top products (isBestSeller: true)
6. **FeaturesStrip** - Brand value proposition
7. **NewsletterBanner** - Email signup

#### Product Filtering
**File**: [hooks/useProductFilter.ts](hooks/useProductFilter.ts)

**Supported Filters**:
- **Price Range**: [0, 10000]
- **Discount**: Minimum discount threshold
- **Sizes**: Multi-select
- **Colors**: Multi-select
- **Sub-Categories**: Multi-select
- **Sort Options**: relevance, price (asc/desc), newest, best-sellers

**Dynamic Routes**:
- `/category/[slug]` - Category-specific filtering
- `/category/sale` - Products with discount > 0
- `/category/new-arrivals` - Products with isNew: true

#### Product Detail Page
**Route**: `/product/[slug]`

**Data Displayed**:
- Product images (gallery)
- Pricing (current, original, discount %)
- Available sizes and colors
- Description and features
- Add to cart button

### 3.4 Cart Management

#### Cart Features
**File**: [components/cart/CartSheet.tsx](components/cart/CartSheet.tsx)

- **Side Sheet UI**: Slide-in cart panel
- **Item Operations**: 
  - View image, name, price
  - Update size/color (select)
  - Adjust quantity (±buttons)
  - Remove item (with undo toast)
- **Calculations**:
  - Subtotal per item
  - Total items & price
  - Free delivery threshold (₹499+)
  - Delivery fee: ₹49

#### Cart Persistence
- localStorage key: `souled_cart`
- Synced on mount and updated
- Survives page refreshes

### 3.5 User Profile & Addresses

#### Address Management
**File**: [lib/actions/address-actions.ts](lib/actions/address-actions.ts)

**Operations**:
- **Get Addresses**: Fetch by userId (from Supabase auth)
- **Add Address**: Create with optional default flag
- **Update Address**: Modify existing address
- **Delete Address**: Remove (with ownership check)
- **Set Default**: Transaction to update all addresses for user

**Fields**:
```typescript
Address {
  id: String @id
  userId: String       // Supabase user ID
  name: String
  phone: String
  street: String
  city: String
  state: String
  zipCode: String
  isDefault: Boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Security**: All operations verify user ownership via Supabase session

### 3.6 Banner Management (Admin)

#### Banner Types
- **HERO**: Full-width hero banners (home page top)
- **PROMO**: Promotional section banners
- **NEWSLETTER**: Email signup banners
- Custom types supported

**File**: [lib/actions/banner-actions.ts](lib/actions/banner-actions.ts)

**CRUD Operations**:
- Create banner (with type, title, image, link, order)
- Update banner (modify any field)
- Delete banner
- Toggle active status
- Get navigation links (for banner editor)

**Admin Dashboard**:
- List all banners by type and order
- Reorder banners (drag-and-drop via order field)
- Edit inline or full form modal

---

## 4. DEPENDENCIES & INTEGRATIONS

### 4.1 External Services

#### Supabase
- **Auth**: User authentication (managed by Supabase)
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: File uploads (referenced in Supabase CDN)
- **Middleware**: Session refresh on each request

**Environment Variables**:
```
NEXT_PUBLIC_SUPABASE_URL=https://zjhxlwanzqdigsvqxzau.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000 (or production URL)
ADMIN_PASSCODE=7014
```

#### PostgreSQL
- Hosted via Supabase
- Regional failover supported (see probe.ts)
- Prisma adapter for connection pooling

### 4.2 NPM Dependencies (Key)

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.2.2 | React framework |
| `react` | 19.2.4 | UI library |
| `@prisma/client` | 7.6.0 | Database ORM |
| `@supabase/ssr` | 0.10.0 | Auth integration |
| `@supabase/supabase-js` | 2.101.1 | Client SDK |
| `@radix-ui/*` | 2.x | Headless UI components |
| `shadcn` | 4.1.2 | UI component library |
| `react-hook-form` | 7.72.1 | Form state management |
| `@hookform/resolvers` | 5.2.2 | Form validation |
| `zod` | 4.3.6 | Schema validation |
| `framer-motion` | 12.38.0 | Animations |
| `embla-carousel-react` | 8.6.0 | Carousel component |
| `lucide-react` | 0.477.0 | Icon library |
| `tailwindcss` | 4 | CSS framework |
| `pg` | 8.20.0 | PostgreSQL driver |

### 4.3 Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | 5 | Type checking |
| `eslint` | 9 | Code linting |
| `prisma` | 7.6.0 | Schema & migrations |
| `tailwindcss` | 4 | Build CSS |

### 4.4 Image Hosting

**Allowed Remote Domains** (next.config.ts):
- `picsum.photos` - Placeholder images
- `i.pinimg.com` - Pinterest images
- `images.unsplash.com` - Unsplash stock
- `i.imgur.com` - Imgur images
- `zjhxlwanzqdigsvqxzau.supabase.co` - Supabase storage
- `api.dicebear.com` - Avatar generation

---

## 5. CODE PATTERNS & BEST PRACTICES

### 5.1 Server Actions Pattern

**Convention**: All mutations use "use server" directive

```typescript
// lib/actions/category-actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function updateCategoryImage(id: string, imageUrl: string) {
  const category = await prisma.category.update({
    where: { id },
    data: { image: imageUrl },
  });
  
  revalidatePath("/admin/categories");
  revalidatePath("/");  // Home uses categories
  
  return { success: true, category };
}
```

**Benefits**:
- Type-safe server-only operations
- Automatic request deduplication
- Built-in error handling
- Cache invalidation via revalidatePath

### 5.2 Component Organization

#### Pattern: Layered Components
```
components/
├── admin/              # Admin-only components
├── cart/               # Cart UI components
├── catalog/            # Filtering & display
├── home/               # Home page sections
├── layout/             # Navbar, Footer
├── profile/            # User pages
├── shared/             # Reusable (ProductCard)
└── ui/                 # Shadcn UI primitives
```

#### Naming Convention
- `Component.tsx` (PascalCase)
- Exported as named exports
- Single responsibility principle

### 5.3 Type Safety

**Prisma Types**:
```typescript
import { Product, Category, Banner, Address } from "@prisma/client";

// Type-safe model operations
export async function getProduct(slug: string): Promise<Product | null> {
  return await prisma.product.findUnique({
    where: { slug }
  });
}
```

**Custom Types**:
```typescript
export type Product = {
  id: string | number;
  name: string;
  slug: string;
  category: { name: string; slug: string };
  price: number;
  originalPrice: number;
  discount: number;
  sizes: string[];
  colors: string[];
  image: string;
  isNew: boolean;
  isBestSeller: boolean;
};
```

### 5.4 Authentication Pattern

**Server Component Auth Check**:
```typescript
import { createClient } from '@/lib/supabase/server';

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect('/login');
  }
  
  // Safe to use user.id
}
```

**Client Component Auth Listen**:
```typescript
import { createClient } from '@/lib/supabase/client';

export function Navbar() {
  const [user, setUser] = useState(null);
  const supabase = createClient();
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => subscription.unsubscribe();
  }, []);
}
```

### 5.5 Form Handling

**Pattern**: React Hook Form + Zod Validation

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Invalid email"),
});

export function AddressForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  );
}
```

### 5.6 Error Handling

**Defensive Programming**:
- Try-catch blocks in all async operations
- Graceful fallbacks
- User-friendly error messages

```typescript
export async function getBanners(type?: string) {
  try {
    if (!(prisma as any).banner) {
      console.warn("Prisma client stale: banner model not found");
      return [];
    }
    
    const banners = await (prisma as any).banner.findMany({...});
    return banners;
  } catch (error) {
    console.error("Failed to fetch banners:", error);
    return [];
  }
}
```

**Developer Note**: Stale Prisma client detection suggests potential issues with schema generation on hot reload.

### 5.7 Data Seeding

**Endpoint**: `/api/seed` (GET)

```typescript
// app/api/seed/route.ts
export async function GET() {
  // 1. Create categories
  // 2. Create products with category relationships
  // 3. Create banners
  return NextResponse.json({ success: true });
}
```

**Data Source**: [lib/data.ts](lib/data.ts) contains 24 pre-defined products across 4 categories

---

## 6. TECH STACK SUMMARY

### Frontend Layer
| Technology | Version | Role |
|-----------|---------|------|
| **Next.js** | 16.2.2 | Full-stack React framework, SSR/SSG |
| **React** | 19.2.4 | UI library, component model |
| **TypeScript** | 5 | Type safety |
| **Tailwind CSS** | 4 | Utility-first CSS |
| **Radix UI** | 2.x | Unstyled accessible components |
| **shadcn/ui** | 4.1.2 | Styled component system |
| **Framer Motion** | 12.38.0 | Complex animations |
| **Embla** | 8.6.0 | Carousel carousel |
| **React Hook Form** | 7.72.1 | Performant form management |
| **Zod** | 4.3.6 | Runtime schema validation |

### Backend Layer
| Technology | Version | Role |
|-----------|---------|------|
| **Next.js API Routes** | 16.2.2 | Backend endpoints & server actions |
| **Prisma ORM** | 7.6.0 | Database abstraction & migrations |
| **PostgreSQL** | 14+ (Supabase) | Relational database |
| **Supabase** | Cloud | Managed Auth & Database |

### Infrastructure & DevOps
| Technology | Purpose |
|-----------|---------|
| **Vercel** | Assumed deployment platform (Next.js native) |
| **ESLint** | Code linting |
| **Prisma Migrations** | Database schema versioning |

### Architecture Pattern
- **SSR/SSG Hybrid**: Server-rendered home, hybrid category pages
- **Client-Side State**: React Context (Cart)
- **Server State**: Prisma ORM with revalidation
- **Authentication**: Supabase managed sessions

---

## 7. POTENTIAL ISSUES & GAPS

### 7.1 Critical Issues

#### 1. **No Product Inventory/Stock Management**
- **Issue**: Products lack a `stock` or `inventory` field
- **Impact**: Cannot prevent overselling
- **Recommendation**: Add inventory tracking to schema:
  ```prisma
  model Product {
    // ... existing fields
    stock: Int @default(0)
    reserved: Int @default(0)  // for active carts
  }
  ```

#### 2. **No Order Management System**
- **Issue**: Cart context doesn't persist to database; no order history
- **Impact**: Lost sales data, no customer order tracking
- **Recommendation**: Create Order & OrderItem models:
  ```prisma
  model Order {
    id String @id
    userId String
    items OrderItem[]
    totalAmount Float
    status OrderStatus
    createdAt DateTime
  }
  ```

#### 3. **No Payment Integration**
- **Issue**: Cart page exists but no checkout/payment flow
- **Impact**: Feature is incomplete; cannot accept payments
- **Recommendation**: Integrate Stripe/Razorpay:
  ```typescript
  // Needs payment gateway setup
  export async function createPaymentIntent(orderId: string) {...}
  ```

#### 4. **Admin Passcode Hardcoded**
- **Issue**: Passcode "7014" visible in source code and stored in env
- **Impact**: Weak security; should be enforced at build time or rotated
- **Recommendation**: Use two-factor authentication or admin invitation tokens

### 7.2 Architectural Gaps

#### 5. **No Input Validation on Product Form**
- **Issue**: ProductForm accepts arbitrary sizes/colors without schema validation
- **Impact**: Malformed data in database
- **Mitigation Exists**: Hook form + Zod used elsewhere; not implemented here
- **Recommendation**: Add Zod schema to ProductForm

#### 6. **Stale Prisma Client Warnings**
- **Issue**: Defensive checks for `!(prisma as any).banner` in banner actions
- **Message**: "Prisma client stale on dev server cache"
- **Impact**: Suggests middleware issue or schema generation timing
- **Recommendation**: 
  - Ensure Prisma codegen runs before dev start
  - Check `.next` directory cleanup in dev workflow
  - Update `next.config.ts` to regenerate Prisma on startup

#### 7. **No API Rate Limiting**
- **Issue**: `/api/seed` endpoint not protected
- **Impact**: Can be called repeatedly, causing data duplication
- **Recommendation**: Protect with admin check or API key

#### 8. **Missing Error Boundaries**
- **Issue**: No React Error Boundaries in client components
- **Impact**: Runtime errors crash entire page
- **Recommendation**: Wrap route segments with error.tsx

#### 9. **No Product Slug Generation**
- **Issue**: Relies on manual slug entry in admin form
- **Impact**: Inconsistent URLs if admin makes typos
- **Recommendation**: Auto-generate slugs from product name:
  ```typescript
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
  ```

#### 10. **No Search Functionality**
- **Issue**: No full-text search on products or categories
- **Impact**: Large catalogs hard to navigate
- **Recommendation**: Add Prisma search or Algolia integration

### 7.3 Security Concerns

#### 11. **Missing CSRF Protection**
- **Issue**: Server actions lack explicit CSRF tokens
- **Mitigation**: Next.js handles automatically; acceptable if HTTPS enforced
- **Verify**: Ensure production deployment uses HTTPS

#### 12. **No Rate Limiting on Auth Endpoints**
- **Issue**: No brute-force protection on login/signup
- **Impact**: Accounts vulnerable to attacks
- **Recommendation**: Use Supabase Auth rules or middleware rate limiting

#### 13. **Client-Side Cart Data Unencrypted**
- **Issue**: localStorage stores cart in plain JSON
- **Impact**: User can edit their own cart before checkout (acceptable for MVP)
- **Recommendation**: Move cart validation to server before order creation

### 7.4 Performance Gaps

#### 14. **No Image Optimization Strategy**
- **Issue**: Remote images from various CDNs without consistent sizing
- **Mitigation**: Next.js Image component used; good foundation
- **Recommendation**: 
  - Specify `width` and `height` on all images
  - Use srcSet for responsive images
  - Consider WebP conversion

#### 15. **No Caching Strategy**
- **Issue**: Categories fetched on every home page load
- **Mitigation**: Prisma cache is in-memory; revalidation works
- **Recommendation**: Consider Redis for distributed caching at scale

#### 16. **No Pagination**
- **Issue**: Product queries fetch all results; `allProducts` is 24 items (manageable)
- **Impact**: Scales poorly at 1000+ products
- **Recommendation**: Implement cursor-based pagination

### 7.5 Feature Completeness

#### 17. **Incomplete Navbar Implementation**
- **Issue**: Mobile menu fully built, but some desktop features incomplete
- **Recommendation**: Test navigation hierarchy on all screen sizes

#### 18. **No Product Reviews/Ratings**
- **Issue**: No customer feedback system
- **Impact**: Cannot build social proof
- **Recommendation**: Add Review model with ratings and comments

#### 19. **No Wishlist Persistence**
- **Issue**: Wishlist button (❤️) updates local state only; not stored
- **Impact**: Wishlist lost on refresh
- **Recommendation**: Add Wishlist model or use AddressBook pattern

#### 20. **Limited Newsletter Integration**
- **Issue**: NewsletterBanner component exists but no subscribe logic
- **Impact**: Cannot collect emails
- **Recommendation**: Connect to email service (SendGrid, Mailchimp)

---

## 8. DATA MODEL & RELATIONSHIPS

### Database Schema (Prisma)

```prisma
model Category {
  id        String @id @default(cuid())
  name      String @unique
  slug      String @unique
  image     String?
  products  Product[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Product {
  id            String
  name          String
  slug          String @unique
  category      Category @relation(fields: [categoryId], references: [id])
  categoryId    String
  subCategory   String
  price         Float
  originalPrice Float
  discount      Int @default(0)
  sizes         String[]          # PostgreSQL array type
  colors        String[]
  image         String
  images        String[]
  description   String
  features      String[]
  isNew         Boolean
  isBestSeller  Boolean
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Banner {
  id        String @id @default(cuid())
  type      String                # HERO, PROMO, NEWSLETTER, etc.
  title     String
  subtitle  String?
  image     String
  buttonText String? @default("Shop Now")
  link      String? @default("/")
  order     Int @default(1)       # For ordering display
  isActive  Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Address {
  id        String @id @default(cuid())
  userId    String                # Supabase auth user ID
  name      String
  phone     String
  street    String
  city      String
  state     String
  zipCode   String
  isDefault Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([userId])
}

# Not yet implemented:
# model Order
# model OrderItem
# model Review
# model Wishlist
# model Inventory
```

### Entity Relationships

```
Category (1) ──── (N) Product
                      │
                      ├─ sizes: String[]
                      ├─ colors: String[]
                      └─ images: String[]

User (Supabase) (1) ──── (N) Address
                  (1) ──── (N) Order [NOT YET]

Banner (Standalone)
  - No relationships
  - Stored as type + order for display
```

---

## 9. DEPLOYMENT & ENVIRONMENT SETUP

### Environment Variables Required
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Admin
ADMIN_PASSCODE=7014

# Database (optional if using Supabase CLI)
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### Build & Deployment Steps
```bash
# Local development
npm install
npm run dev                  # Starts on http://localhost:3000

# Production build
npm run build               # Prisma code generation + Next build
npm start

# Database setup
npx prisma db push         # Apply schema to database
npx prisma db seed         # Run seed script (optional)

# Seed via API
curl http://localhost:3000/api/seed
```

---

## 10. RECOMMENDED ENHANCEMENTS (Priority Order)

### P0 - Critical for MVP
1. [ ] **Implement Order Management**: Add Order/OrderItem models and checkout flow
2. [ ] **Payment Integration**: Stripe or Razorpy checkout
3. [ ] **Product Inventory**: Track stock; prevent overselling
4. [ ] **Email Service**: Newsletter signup + transactional emails (order confirmation)

### P1 - High Value
5. [ ] **Search & Filters**: Improve discoverability (full-text search)
6. [ ] **User Reviews**: Social proof for products
7. [ ] **Wishlist Persistence**: Save to database
8. [ ] **Error Boundaries**: Graceful error handling in UI

### P2 - Medium Value
9. [ ] **Analytics**: Track page views, conversions (Vercel Analytics)
10. [ ] **Admin Dashboard**: Enhanced stats (revenue, top products)
11. [ ] **SEO Optimization**: Metadata, Open Graph tags
12. [ ] **Mobile App**: React Native + Expo

### P3 - Nice-to-Have
13. [ ] **Advanced Filtering**: Size charts, color preview
14. [ ] **Recommendations**: "You may also like" suggestions
15. [ ] **Live Chat**: Customer support
16. [ ] **Multi-Vendor**: Marketplace capability

---

## 11. KEY FILES REFERENCE

| File | Purpose |
|------|---------|
| [app/layout.tsx](app/layout.tsx) | Root layout, CartProvider, Navbar, Footer setup |
| [app/page.tsx](app/page.tsx) | Home page with banners, categories, products |
| [context/CartContext.tsx](context/CartContext.tsx) | Cart state management |
| [lib/prisma.ts](lib/prisma.ts) | Prisma client singleton |
| [lib/actions/auth-actions.ts](lib/actions/auth-actions.ts) | Auth server actions |
| [lib/actions/product-actions.ts](lib/actions/product-actions.ts) | Product CRUD |
| [lib/actions/banner-actions.ts](lib/actions/banner-actions.ts) | Banner management |
| [middleware.ts](middleware.ts) | Supabase session refresh |
| [next.config.ts](next.config.ts) | Image domain configuration |
| [prisma/schema.prisma](prisma/schema.prisma) | Database schema |

---

## 12. CONCLUSION

**SOULED** is a well-structured, modern e-commerce application that demonstrates solid Next.js patterns:
- ✅ Type-safe with TypeScript + Prisma
- ✅ Server-first architecture with Server Actions
- ✅ Proper separation of concerns (components, hooks, actions)
- ✅ Authentication integrated with Supabase
- ✅ Responsive design with Tailwind CSS

**Maturity Level**: Early-stage MVP with core features. Payment, orders, and inventory tracking are critical gaps for production readiness.

**Recommendation**: Address P0 items before taking payment to avoid compliance and operational issues. Consider load testing at scale once order management is implemented.

---

**Generated**: April 7, 2026
