export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import HotspotScene from '@/components/HotspotScene'
import TrendingRail from '@/components/TrendingRail'
import CategoryFilter from '@/components/CategoryFilter'
import { mediaUrl, formatPrice } from '@/lib/media'
import type { Article, Product, Media as MediaType } from '@/payload-types'

const categoryColors: Record<string, string> = {
  terracotta: 'bg-terracotta/10 text-terracotta',
  sage: 'bg-sage/10 text-sage',
  blue: 'bg-blue-100 text-blue-700',
  sand: 'bg-sand/10 text-sand-dark',
}

function ArticleCard({ article, size = 'md' }: { article: Article; size?: 'sm' | 'md' | 'lg' }) {
  const hero = article.heroImage as MediaType | null
  const imgUrl = mediaUrl(hero)
  const cat = article.category as { name?: string; color?: string } | null

  return (
    <Link href={`/articles/${article.slug}`} className="group block h-full">
      <article
        className={`relative overflow-hidden rounded-2xl bg-habitat-warm h-full flex flex-col cursor-pointer ${
          size === 'lg' ? 'min-h-[420px]' : size === 'md' ? 'min-h-[280px]' : 'min-h-[200px]'
        }`}
      >
        {/* Image */}
        <div className="absolute inset-0">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={hero?.alt || article.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-habitat-warm to-sand/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative mt-auto p-5">
          {cat && (
            <span
              className={`inline-block text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full mb-2 ${categoryColors[cat.color || 'terracotta'] || categoryColors.terracotta}`}
            >
              {cat.name}
            </span>
          )}
          <h3
            className={`font-serif font-semibold text-white leading-snug ${
              size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-base'
            }`}
          >
            {article.title}
          </h3>
          {article.excerpt && size !== 'sm' && (
            <p className="text-white/70 text-sm mt-1.5 line-clamp-2">{article.excerpt}</p>
          )}
          <div className="flex items-center gap-3 mt-3 text-white/50 text-xs">
            {article.readTime && <span>{article.readTime} read</span>}
            <span className="text-white/30">·</span>
            <span className="text-white/60">Shoppable scene</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default async function HomePage() {
  const payload = await getPayload({ config })

  const [homepageData, articlesData, productsData] = await Promise.all([
    payload.findGlobal({ slug: 'homepage', depth: 3 }).catch(() => null),
    payload.find({ collection: 'articles', limit: 6, depth: 2 }).catch(() => ({ docs: [] })),
    payload.find({ collection: 'products', limit: 12, depth: 2 }).catch(() => ({ docs: [] })),
  ])

  const hp = homepageData as any
  const articles = (articlesData.docs as Article[])
  const products = (productsData.docs as Product[])

  // Build featured articles — prefer ones set in homepage global, fall back to latest
  const featured: Article[] =
    hp?.featuredArticles?.length > 0
      ? hp.featuredArticles.filter(Boolean)
      : articles

  // Shoppable scene
  const sceneImage = hp?.shoppableScene?.image
  const sceneHotspots: Array<{ x: number; y: number; product: any }> =
    (hp?.shoppableScene?.hotspots || []).filter((h: any) => h?.product).map((h: any) => ({
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

  // Trending products
  const trendingProducts = (hp?.trendingProducts?.filter(Boolean) || products).slice(0, 10)

  return (
    <div className="pt-[60px]">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-60px)] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          {hp?.hero?.backgroundImage ? (
            <img
              src={mediaUrl(hp.hero.backgroundImage as MediaType)}
              alt="Hero room"
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80"
              alt="Scandinavian living room"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
        </div>

        {/* Content */}
        <div className="relative text-center text-white px-6 max-w-2xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-5 rv">
            {hp?.hero?.heading || 'Shop the room.\nLove the story.'}
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 rv" style={{ transitionDelay: '0.1s' }}>
            {hp?.hero?.subheading ||
              'Discover beautifully styled rooms, then shop every piece that makes them extraordinary.'}
          </p>
          <div className="rv" style={{ transitionDelay: '0.2s' }}>
            {hp?.hero?.ctaArticle ? (
              <Link
                href={`/articles/${(hp.hero.ctaArticle as Article).slug}`}
                className="inline-block bg-white text-habitat-dark font-semibold px-8 py-4 rounded-full hover:bg-terracotta hover:text-white transition-all duration-200 text-sm"
              >
                {hp?.hero?.ctaText || 'Explore rooms'} →
              </Link>
            ) : (
              <Link
                href="/articles"
                className="inline-block bg-white text-habitat-dark font-semibold px-8 py-4 rounded-full hover:bg-terracotta hover:text-white transition-all duration-200 text-sm"
              >
                {hp?.hero?.ctaText || 'Explore rooms'} →
              </Link>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 text-xs animate-bounce">
          <span>scroll</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* ── Category filter ───────────────────────────────────── */}
      <CategoryFilter />

      {/* ── Latest Stories ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="font-serif text-3xl font-semibold rv">Latest stories</h2>
          <Link href="/articles" className="text-sm text-habitat-muted hover:text-terracotta transition-colors rv" style={{ transitionDelay: '0.1s' }}>
            View all →
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="text-habitat-muted text-center py-16">
            No articles yet.{' '}
            <Link href="/admin" className="text-terracotta underline">
              Add some in the CMS →
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Large card */}
            {featured[0] && (
              <div className="md:col-span-1 md:row-span-2 rv">
                <ArticleCard article={featured[0]} size="lg" />
              </div>
            )}
            {/* Medium cards */}
            {featured.slice(1, 3).map((a, i) => (
              <div key={a.id} className="rv" style={{ transitionDelay: `${(i + 1) * 0.1}s` }}>
                <ArticleCard article={a} size="md" />
              </div>
            ))}
            {/* Small cards */}
            {featured.slice(3, 6).map((a, i) => (
              <div key={a.id} className="rv" style={{ transitionDelay: `${(i + 3) * 0.1}s` }}>
                <ArticleCard article={a} size="sm" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Shoppable Scene ───────────────────────────────────── */}
      {(sceneImage || sceneHotspots.length > 0) && (
        <section className="bg-habitat-warm py-16 px-6 lg:px-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10 rv">
              <p className="text-xs uppercase tracking-widest text-terracotta font-semibold mb-2">
                Shoppable scene
              </p>
              <h2 className="font-serif text-3xl font-semibold">Tap to shop the room</h2>
            </div>
            <div className="rv" style={{ transitionDelay: '0.1s' }}>
              <HotspotScene
                imageUrl={
                  mediaUrl(sceneImage as MediaType) ||
                  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80'
                }
                imageAlt="Shoppable room scene"
                hotspots={sceneHotspots}
                caption={hp?.shoppableScene?.caption || 'Tap the + markers to shop each item'}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Trending Products ─────────────────────────────────── */}
      {trendingProducts.length > 0 && (
        <section className="bg-habitat-dark py-16">
          <div className="max-w-6xl mx-auto px-6 lg:px-10">
            <div className="flex items-baseline justify-between mb-10">
              <div className="rv">
                <p className="text-xs uppercase tracking-widest text-terracotta font-semibold mb-1">
                  Trending now
                </p>
                <h2 className="font-serif text-3xl font-semibold text-white">Popular pieces</h2>
              </div>
            </div>
            <TrendingRail products={trendingProducts as Product[]} />
          </div>
        </section>
      )}
    </div>
  )
}
