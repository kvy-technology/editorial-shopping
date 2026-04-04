'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'
import Link from 'next/link'
import ArticleBlocks from '@/components/blocks/ArticleBlocks'
import { mediaUrl } from '@/lib/media'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const categoryColors: Record<string, string> = {
  terracotta: 'bg-terracotta/20 text-terracotta',
  sage: 'bg-sage/20 text-sage',
  blue: 'bg-blue-100 text-blue-700',
  sand: 'bg-sand/20 text-sand-dark',
}

/** When live preview sends form state, relationship fields come back as raw IDs.
 *  Merge the live data with initialData so populated objects are preserved
 *  for any relationship that hasn't been explicitly swapped to a new ID. */
function mergeWithInitial(live: any, initial: any): any {
  const populate = (liveVal: any, initVal: any) =>
    typeof liveVal === 'object' && liveVal !== null ? liveVal : initVal

  const content = (live.content || []).map((liveBlock: any) => {
    const initBlock = (initial.content || []).find((b: any) => b.id === liveBlock.id) ?? {}

    switch (liveBlock.blockType) {
      case 'productCard':
        return { ...liveBlock, product: populate(liveBlock.product, initBlock.product) }
      case 'shoppableScene':
        return {
          ...liveBlock,
          image: populate(liveBlock.image, initBlock.image),
          hotspots: (liveBlock.hotspots || []).map((h: any, i: number) => ({
            ...h,
            product: populate(h.product, initBlock.hotspots?.[i]?.product),
          })),
        }
      case 'imagePair':
        return {
          ...liveBlock,
          imageOne: populate(liveBlock.imageOne, initBlock.imageOne),
          imageTwo: populate(liveBlock.imageTwo, initBlock.imageTwo),
        }
      default:
        return liveBlock
    }
  })

  return {
    ...live,
    heroImage: populate(live.heroImage, initial.heroImage),
    author: populate(live.author, initial.author),
    category: populate(live.category, initial.category),
    content,
  }
}

export default function ArticlePreviewClient({ initialData }: { initialData: any }) {
  const { data: liveData, isLoading } = useLivePreview({
    initialData,
    serverURL: SERVER_URL,
    depth: 3,
  })

  // Always merge so unpopulated relationship IDs fall back to initialData values.
  // This means content is visible immediately (initialData is always populated).
  const article = mergeWithInitial(liveData, initialData)

  const hero = article.heroImage as any
  const heroUrl = mediaUrl(hero)
  const author = article.author as any
  const authorAvatarUrl = mediaUrl(author?.avatar)
  const category = article.category as any
  const catColor = categoryColors[category?.color || 'terracotta']

  return (
    <div className="pt-[60px]">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <header className="relative min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          {heroUrl ? (
            <img src={heroUrl} alt={hero?.alt || article.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-habitat-warm via-sand/30 to-terracotta/10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        </div>

        <div className="relative w-full max-w-3xl mx-auto px-6 pb-14">
          {/* Live preview badge */}
          <div className="inline-flex items-center gap-1.5 bg-terracotta text-white text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            <span className={`w-1.5 h-1.5 rounded-full bg-white ${isLoading ? 'opacity-50' : 'animate-pulse'}`} />
            {isLoading ? 'Waiting for admin…' : 'Live Preview'}
          </div>

          {category && (
            <span className={`block text-[10px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded-full mb-4 w-fit ${catColor}`}>
              {category.name}
            </span>
          )}

          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
            {article.title || 'Untitled article'}
          </h1>

          <div className="flex items-center gap-4 flex-wrap">
            {author && (
              <div className="flex items-center gap-2.5">
                {authorAvatarUrl ? (
                  <img src={authorAvatarUrl} alt={author.name} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-terracotta/60 flex items-center justify-center text-white text-xs font-bold">
                    {author.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                  </div>
                )}
                <div>
                  <p className="text-white text-sm font-medium leading-none">{author.name}</p>
                  {author.title && <p className="text-white/50 text-xs mt-0.5">{author.title}</p>}
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 text-white/50 text-xs">
              {article.readTime && <span>{article.readTime} read</span>}
            </div>
          </div>
        </div>
      </header>

      {/* ── Article body ──────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-14">
        {article.excerpt && (
          <p className="font-serif text-xl md:text-2xl leading-relaxed text-habitat-dark/80 mb-10">
            {article.excerpt}
          </p>
        )}

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {article.tags.map((t: { tag?: string | null; id?: string | null }, i: number) => (
              <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-habitat-offwhite border border-black/8 text-habitat-muted">
                {t.tag}
              </span>
            ))}
          </div>
        )}

        {article.content && <ArticleBlocks blocks={article.content as any[]} />}
      </div>
    </div>
  )
}
