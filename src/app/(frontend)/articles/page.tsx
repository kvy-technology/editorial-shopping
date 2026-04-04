export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import type { Article, Media as MediaType } from '@/payload-types'
import { mediaUrl } from '@/lib/media'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'All Rooms' }

const categoryColors: Record<string, string> = {
  terracotta: 'bg-terracotta/10 text-terracotta',
  sage: 'bg-sage/10 text-sage',
  blue: 'bg-blue-100 text-blue-700',
  sand: 'bg-sand/10 text-sand-dark',
}

export default async function ArticlesPage() {
  const payload = await getPayload({ config })
  const { docs: articles } = await payload
    .find({ collection: 'articles', limit: 30, depth: 2 })
    .catch(() => ({ docs: [] as Article[] }))

  return (
    <div className="pt-[60px]">
      {/* Header */}
      <div className="bg-habitat-warm py-20 px-6 text-center">
        <p className="text-xs uppercase tracking-widest text-terracotta font-semibold mb-3">Rooms &amp; stories</p>
        <h1 className="font-serif text-5xl font-bold">All rooms</h1>
        <p className="text-habitat-muted mt-3 max-w-md mx-auto">
          Browse editorial rooms and shop every piece that makes them special.
        </p>
      </div>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
        {articles.length === 0 ? (
          <p className="text-center text-habitat-muted py-20">
            No articles yet.{' '}
            <Link href="/admin" className="text-terracotta underline">
              Add some in the CMS →
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(articles as Article[]).map((article) => {
              const hero = article.heroImage as MediaType | null
              const imgUrl = mediaUrl(hero)
              const cat = article.category as { name?: string; color?: string } | null

              return (
                <Link key={article.id} href={`/articles/${article.slug}`} className="group block rv">
                  <article className="relative overflow-hidden rounded-2xl bg-habitat-warm min-h-[300px] flex flex-col">
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
                    <div className="relative mt-auto p-5">
                      {cat && (
                        <span className={`inline-block text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full mb-2 ${categoryColors[cat.color || 'terracotta']}`}>
                          {cat.name}
                        </span>
                      )}
                      <h2 className="font-serif text-xl font-semibold text-white leading-snug">{article.title}</h2>
                      {article.excerpt && (
                        <p className="text-white/70 text-sm mt-1.5 line-clamp-2">{article.excerpt}</p>
                      )}
                      <div className="flex items-center gap-3 mt-3 text-white/50 text-xs">
                        {article.readTime && <span>{article.readTime} read</span>}
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
