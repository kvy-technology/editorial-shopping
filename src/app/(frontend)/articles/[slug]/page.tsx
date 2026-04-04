export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import ArticleProgressBar from '@/components/ArticleProgressBar'
import ArticleBlocks from '@/components/blocks/ArticleBlocks'
import NewsletterForm from '@/components/NewsletterForm'
import { mediaUrl } from '@/lib/media'
import type { Article, Author, Media as MediaType, Category } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload
    .find({ collection: 'articles', where: { slug: { equals: slug } }, limit: 1, depth: 1 })
    .catch(() => ({ docs: [] }))
  const article = docs[0] as Article | undefined
  if (!article) return { title: 'Not found' }
  return {
    title: article.title,
    description: article.excerpt || undefined,
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload
    .find({ collection: 'articles', where: { slug: { equals: slug } }, limit: 1, depth: 3 })
    .catch(() => ({ docs: [] }))

  const article = docs[0] as Article | undefined
  if (!article) notFound()

  // Related articles
  const { docs: related } = await payload
    .find({
      collection: 'articles',
      where: {
        and: [
          { slug: { not_equals: slug } },
          ...(article.category
            ? [{ category: { equals: (article.category as any).id || article.category } }]
            : []),
        ],
      },
      limit: 3,
      depth: 2,
    })
    .catch(() => ({ docs: [] }))

  const hero = article.heroImage as MediaType | null
  const heroUrl = mediaUrl(hero)
  const author = article.author as Author | null
  const authorAvatarUrl = mediaUrl(author?.avatar as MediaType)
  const category = article.category as Category | null

  const categoryColors: Record<string, string> = {
    terracotta: 'bg-terracotta/20 text-terracotta',
    sage: 'bg-sage/20 text-sage',
    blue: 'bg-blue-100 text-blue-700',
    sand: 'bg-sand/20 text-sand-dark',
  }
  const catColor = categoryColors[category?.color || 'terracotta']

  return (
    <div className="pt-[60px]">
      <ArticleProgressBar />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <header className="relative min-h-[70vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          {heroUrl ? (
            <img src={heroUrl} alt={hero?.alt || article.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-habitat-warm via-sand/30 to-terracotta/10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        </div>

        <div className="relative w-full max-w-3xl mx-auto px-6 pb-14">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/50 text-xs mb-6">
            <Link href="/" className="hover:text-white transition-colors">Habitat</Link>
            <span>/</span>
            {category && (
              <>
                <Link href="/articles" className="hover:text-white transition-colors">{category.name}</Link>
                <span>/</span>
              </>
            )}
            <span className="text-white/80 line-clamp-1">{article.title}</span>
          </nav>

          {/* Badge */}
          {category && (
            <span className={`inline-block text-[10px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded-full mb-4 ${catColor}`}>
              Shoppable room · {article.content?.length || 0} blocks
            </span>
          )}

          {/* Title */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
            {article.title}
          </h1>

          {/* Author + meta */}
          <div className="flex items-center gap-4 flex-wrap">
            {author && (
              <div className="flex items-center gap-2.5">
                {authorAvatarUrl ? (
                  <img
                    src={authorAvatarUrl}
                    alt={author.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-terracotta/60 flex items-center justify-center text-white text-xs font-bold">
                    {author.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                )}
                <div>
                  <p className="text-white text-sm font-medium leading-none">{author.name}</p>
                  {author.title && (
                    <p className="text-white/50 text-xs mt-0.5">{author.title}</p>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 text-white/50 text-xs">
              {article.readTime && (
                <>
                  <span>{article.readTime} read</span>
                  <span className="text-white/30">·</span>
                </>
              )}
              <span>
                {new Date(article.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Article body ──────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-14">
        {/* Intro */}
        {article.excerpt && (
          <p className="font-serif text-xl md:text-2xl leading-relaxed text-habitat-dark/80 mb-10 drop-cap">
            {article.excerpt}
          </p>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {article.tags.map((t: { tag?: string | null; id?: string | null }, i: number) => (
              <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-habitat-offwhite border border-black/8 text-habitat-muted">
                {t.tag}
              </span>
            ))}
          </div>
        )}

        {/* Content blocks */}
        {article.content && <ArticleBlocks blocks={article.content as any[]} />}

        {/* Share bar */}
        <div className="mt-16 pt-8 border-t border-black/8 flex items-center justify-between flex-wrap gap-4">
          <span className="text-sm font-medium text-habitat-muted">Share this room</span>
          <div className="flex gap-2">
            {['Twitter', 'Pinterest', 'Copy link'].map((label) => (
              <button
                key={label}
                className="text-xs px-4 py-2 rounded-full border border-black/10 hover:border-black/20 hover:bg-habitat-offwhite transition-all"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 p-8 bg-habitat-warm rounded-2xl text-center">
          <h3 className="font-serif text-2xl font-semibold mb-2">Get rooms like this in your inbox</h3>
          <p className="text-habitat-muted text-sm mb-5">New shoppable rooms, every week.</p>
          <NewsletterForm />
        </div>
      </div>

      {/* ── Related articles ──────────────────────────────────── */}
      {related.length > 0 && (
        <section className="bg-habitat-warm py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-widest text-terracotta font-semibold mb-1">More rooms</p>
              <h2 className="font-serif text-3xl font-semibold">Continue exploring</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {(related as Article[]).map((rel) => {
                const relHero = rel.heroImage as MediaType | null
                const relImgUrl = mediaUrl(relHero)
                const relCat = rel.category as { name?: string; color?: string } | null

                return (
                  <Link key={rel.id} href={`/articles/${rel.slug}`} className="group block rv">
                    <article className="relative overflow-hidden rounded-2xl min-h-[240px] flex flex-col bg-habitat-offwhite">
                      <div className="absolute inset-0">
                        {relImgUrl ? (
                          <img
                            src={relImgUrl}
                            alt={relHero?.alt || rel.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-habitat-warm to-sand/30" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      </div>
                      <div className="relative mt-auto p-5">
                        {relCat && (
                          <span className={`inline-block text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full mb-2 ${categoryColors[relCat.color || 'terracotta']}`}>
                            {relCat.name}
                          </span>
                        )}
                        <h3 className="font-serif text-lg font-semibold text-white leading-snug">{rel.title}</h3>
                        {rel.readTime && (
                          <p className="text-white/50 text-xs mt-2">{rel.readTime} read</p>
                        )}
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
