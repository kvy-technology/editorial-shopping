'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'
import Link from 'next/link'
import HotspotScene from '@/components/HotspotScene'
import TrendingRail from '@/components/TrendingRail'
import { mediaUrl } from '@/lib/media'
import type { Article, Product, Media as MediaType } from '@/payload-types'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const categoryColors: Record<string, string> = {
  terracotta: 'bg-terracotta/10 text-terracotta',
  sage: 'bg-sage/10 text-sage',
  blue: 'bg-blue-100 text-blue-700',
  sand: 'bg-sand/10 text-sand-dark',
}

function ArticleCard({ article }: { article: any }) {
  const hero = article.heroImage as any
  const imgUrl = mediaUrl(hero)
  const cat = article.category as any

  return (
    <Link href={`/articles/${article.slug}`} className="group block h-full">
      <article className="relative overflow-hidden rounded-2xl bg-habitat-warm min-h-[220px] flex flex-col cursor-pointer">
        <div className="absolute inset-0">
          {imgUrl ? (
            <img src={imgUrl} alt={hero?.alt || article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-habitat-warm to-sand/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
        <div className="relative mt-auto p-5">
          {cat && (
            <span className={`inline-block text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full mb-2 ${categoryColors[cat.color || 'terracotta'] || categoryColors.terracotta}`}>
              {cat.name}
            </span>
          )}
          <h3 className="font-serif text-lg font-semibold text-white leading-snug">{article.title}</h3>
          {article.readTime && <p className="text-white/50 text-xs mt-2">{article.readTime} read</p>}
        </div>
      </article>
    </Link>
  )
}

export default function HomepagePreviewClient({ initialData }: { initialData: any }) {
  const { data: hp, isLoading } = useLivePreview({
    initialData,
    serverURL: SERVER_URL,
    depth: 3,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const bgImage = hp?.hero?.backgroundImage
  const featured: any[] = hp?.featuredArticles?.filter(Boolean) || []

  const sceneImage = hp?.shoppableScene?.image
  const sceneHotspots = (hp?.shoppableScene?.hotspots || [])
    .filter((h: any) => h?.product)
    .map((h: any) => ({
      x: h.x,
      y: h.y,
      product: {
        id: h.product.id,
        name: h.product.name,
        price: h.product.price,
        image: mediaUrl(h.product.image as MediaType),
        material: h.product.material,
        description: h.product.description,
        dimensions: h.product.dimensions,
        weight: h.product.weight,
        colors: h.product.colors,
        inStock: h.product.inStock,
      },
    }))

  const trendingProducts = (hp?.trendingProducts?.filter(Boolean) || []).slice(0, 10)

  return (
    <div className="pt-[60px]">
      {/* Live preview badge */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-1.5 bg-terracotta text-white text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        Live Preview
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {bgImage ? (
            <img src={mediaUrl(bgImage as MediaType)} alt="Hero room" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-habitat-warm via-sand/30 to-terracotta/10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
        </div>
        <div className="relative text-center text-white px-6 max-w-2xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl font-bold leading-tight mb-5">
            {hp?.hero?.heading || 'Shop the room. Love the story.'}
          </h1>
          <p className="text-lg text-white/80 leading-relaxed mb-8">
            {hp?.hero?.subheading || 'Discover beautifully styled rooms.'}
          </p>
          <span className="inline-block bg-white text-habitat-dark font-semibold px-8 py-4 rounded-full text-sm">
            {hp?.hero?.ctaText || 'Explore rooms'} →
          </span>
        </div>
      </section>

      {/* ── Latest Stories ────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="font-serif text-3xl font-semibold mb-10">Latest stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featured.slice(0, 6).map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      {/* ── Shoppable Scene ───────────────────────────────────── */}
      {(sceneImage || sceneHotspots.length > 0) && (
        <section className="bg-habitat-warm py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-widest text-terracotta font-semibold mb-2">Shoppable scene</p>
              <h2 className="font-serif text-3xl font-semibold">Tap to shop the room</h2>
            </div>
            <HotspotScene
              imageUrl={mediaUrl(sceneImage as MediaType) || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80'}
              imageAlt="Shoppable room scene"
              hotspots={sceneHotspots}
              caption={hp?.shoppableScene?.caption || 'Tap the + markers to shop each item'}
            />
          </div>
        </section>
      )}

      {/* ── Trending Products ─────────────────────────────────── */}
      {trendingProducts.length > 0 && (
        <section className="bg-habitat-dark py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-10">
              <p className="text-xs uppercase tracking-widest text-terracotta font-semibold mb-1">Trending now</p>
              <h2 className="font-serif text-3xl font-semibold text-white">Popular pieces</h2>
            </div>
            <TrendingRail products={trendingProducts as Product[]} />
          </div>
        </section>
      )}
    </div>
  )
}
