# ZFR Fashion E-Commerce

> Inspired by [LEFTIES](https://www.lefties.com/ae/) — a clean, editorial fashion e-commerce experience.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand (client) + TanStack Query (server)
- **Auth**: NextAuth.js (credentials)

## Features

### Pages
- **Homepage** — Full-screen hero sections, Trending Now grid, #INZFR community
- **Gender Landing** — Woman, Man, Kids category overview
- **Product Listing** — Filter chips, product grid with pagination
- **Product Detail** — Image gallery, color/size selectors, Add to Cart
- **Cart** — Full cart management with quantities
- **Checkout** — Multi-step checkout flow
- **Search** — Live search with trending suggestions
- **Auth** — Login, Register, Forgot Password
- **Account** — Profile, Orders, Addresses, Wishlist
- **Admin** — Basic dashboard

### Backend APIs
- `GET /api/v1/products` — List with filters, pagination
- `GET /api/v1/products/:slug` — Single product
- `GET /api/v1/categories` — Category tree
- `GET /api/v1/categories/:slug` — Category with subcategories
- `GET /api/v1/hero-sections` — Active hero sections
- `GET /api/v1/looks` — Community looks
- `GET /api/v1/search` — Product search

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Development (with in-memory MongoDB)

```bash
npm run dev:start
```

This will:
1. Start MongoDB Memory Server
2. Seed the database with sample data
3. Start Next.js dev server on http://localhost:3000

### Seed Database Only

```bash
npm run seed
```

Requires `MONGODB_URI` environment variable.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # shadcn/ui primitives
│   ├── layout/      # Header, Footer, Sidebar
│   ├── home/        # Hero, Trending, Community
│   ├── product/     # ProductCard, AddToCart, WishlistButton
│   ├── cart/        # Cart components
│   └── shared/      # SearchModal, etc.
├── lib/             # Utilities, DB connection
├── models/          # Mongoose schemas
├── modules/         # Backend modules (layered architecture)
├── hooks/           # Custom React hooks
├── store/           # Zustand stores (cart, wishlist)
└── types/           # Shared TypeScript types
```

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/zfr-ecommerce
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## Demo Data

The seed script creates:
- 50+ products across Woman, Man, and Kids
- Full category tree with subcategories
- 6 hero sections (2 per gender)
- 12 community looks for #INZFR
- 1 admin user (admin@zfr.com / admin123)
