# Habitat — Shop the Room

An editorial shopping experience built with **PayloadCMS v3** and **Next.js 16**. Browse beautifully styled rooms, tap hotspots to discover products, and add them to your cart — all powered by a headless CMS.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![PayloadCMS](https://img.shields.io/badge/PayloadCMS-3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)

## Features

### Frontend
- **Shoppable room scenes** — interactive hotspots with product popups, quick view modals, and add-to-cart
- **Editorial articles** — 9 content block types (rich text, shoppable scenes, product cards, styling tips, pull quotes, image pairs, budget breakdowns, and more)
- **Cart drawer** — slide-out cart with quantity controls and counter animations
- **Scroll reveal animations** — elements fade in as you scroll via IntersectionObserver
- **Responsive design** — mobile-first layout with Tailwind CSS

### CMS (Payload Admin)
- **Visual hotspot editor** — click on an image to place hotspots, pick products from a grid
- **Live preview** — real-time preview for articles and homepage with device breakpoints
- **9 article block types** — RichText, ShoppableScene, SectionHeading, ProductCard, StylingTip, MaterialCallout, PullQuote, ImagePair, BudgetBreakdown
- **Homepage global** — manage hero, featured articles, shoppable scene, and trending products
- **6 collections** — Users, Media, Categories, Authors, Products, Articles

### Deployment
- **Local**: SQLite + filesystem media (zero config)
- **Vercel**: Vercel Postgres + Vercel Blob storage (auto-detected via env vars)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| CMS | PayloadCMS v3 (co-located) |
| Database | SQLite (local) / Vercel Postgres (production) |
| Media Storage | Filesystem (local) / Vercel Blob (production) |
| Styling | Tailwind CSS 3 |
| Rich Text | Lexical Editor |
| Language | TypeScript 5 |

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/kvy-technology/editorial-shopping.git
cd editorial-shopping
npm install --legacy-peer-deps
```

### Environment Setup

```bash
cp .env.example .env
```

The defaults work out of the box for local development:

```env
DATABASE_URI=file:./habitat.db
PAYLOAD_SECRET=your-secret-here-change-in-prod
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the frontend and [http://localhost:3000/admin](http://localhost:3000/admin) for the CMS.

### Seed Demo Data

After creating your admin user at `/admin`, seed the database with realistic demo content:

```
GET http://localhost:3000/api/seed
```

This downloads images from Unsplash and creates 4 categories, 2 authors, 11 products, 4 articles with full content blocks, and a configured homepage.

## Project Structure

```
src/
├── app/
│   ├── (frontend)/          # Public-facing pages
│   │   ├── page.tsx         # Homepage
│   │   ├── articles/        # Article listing + detail
│   │   └── preview/         # Live preview routes
│   ├── (payload)/           # Payload admin panel
│   └── api/seed/            # Seed API route
├── blocks/                  # 9 Payload block definitions
├── collections/             # 6 Payload collection configs
├── globals/                 # Homepage global config
├── components/
│   ├── admin/               # Custom admin components (HotspotEditor, TagRowLabel)
│   ├── blocks/              # Article block renderers
│   ├── preview/             # Live preview client components
│   ├── HotspotScene.tsx     # Interactive shoppable image
│   ├── CartDrawer.tsx       # Slide-out cart
│   ├── ProductModal.tsx     # Product quick view
│   └── ...                  # Navbar, Footer, etc.
└── lib/
    ├── cart.tsx              # Cart context + reducer
    └── media.ts              # Media URL helpers
```

## Deploy to Vercel

1. Import the repo at [vercel.com/new](https://vercel.com/new)
2. Add a **Vercel Postgres** store (auto-sets `POSTGRES_URL`)
3. Add a **Vercel Blob** store (auto-sets `BLOB_READ_WRITE_TOKEN`)
4. Set environment variables:
   - `PAYLOAD_SECRET` — a strong random string
   - `NEXT_PUBLIC_SERVER_URL` — your Vercel domain (e.g. `https://your-app.vercel.app`)
5. Deploy

The app auto-detects the environment — no code changes needed between local and production.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (webpack mode) |
| `npm run dev:turbo` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run generate:types` | Regenerate Payload types |
| `npm run generate:importmap` | Regenerate admin import map |

## License

Private project by [KVY Technology](https://github.com/kvy-technology).
