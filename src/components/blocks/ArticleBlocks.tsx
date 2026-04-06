'use client'

import { useState } from 'react'
import RichTextRenderer from './RichTextRenderer'
import HotspotScene from '@/components/HotspotScene'
import ProductModal from '@/components/ProductModal'
import AddToCartButton from '@/components/AddToCartButton'
import { mediaUrl } from '@/lib/media'
import type { CartProduct } from '@/lib/cart'

// ─── Block renderers ──────────────────────────────────────────────────────────

function RichTextBlock({ block }: { block: any }) {
  return <RichTextRenderer content={block.content} className="rv" />
}

function SectionHeadingBlock({ block }: { block: any }) {
  return (
    <div className="rv flex items-baseline gap-4 mt-10 mb-4 border-b border-black/8 pb-4">
      {block.number && (
        <span className="font-serif text-4xl font-bold text-terracotta/30 leading-none select-none">
          {block.number}
        </span>
      )}
      <h2 className="font-serif text-2xl md:text-3xl font-semibold">{block.heading}</h2>
    </div>
  )
}

function PullQuoteBlock({ block }: { block: any }) {
  return (
    <blockquote className="rv my-10 pl-6 border-l-4 border-terracotta">
      <p className="font-serif text-xl md:text-2xl italic leading-relaxed text-habitat-dark/80">
        &ldquo;{block.quote}&rdquo;
      </p>
      {block.attribution && (
        <cite className="block mt-3 text-sm text-habitat-muted not-italic">
          — {block.attribution}
        </cite>
      )}
    </blockquote>
  )
}

function StylingTipBlock({ block }: { block: any }) {
  return (
    <div className="rv my-8 bg-sage/10 rounded-xl p-5 border border-sage/20">
      <div className="flex items-start gap-3">
        {block.icon && <span className="text-2xl flex-shrink-0 mt-0.5">{block.icon}</span>}
        <div>
          <p className="font-semibold text-sage-dark text-sm mb-1">{block.label}</p>
          <p className="text-sm leading-relaxed text-habitat-dark/80">{block.content}</p>
        </div>
      </div>
    </div>
  )
}

function MaterialCalloutBlock({ block }: { block: any }) {
  return (
    <div className="rv my-8 bg-sand/15 rounded-xl p-5 border border-sand/30">
      <div className="flex items-start gap-3">
        {block.icon && <span className="text-2xl flex-shrink-0 mt-0.5">{block.icon}</span>}
        <div>
          <p className="font-semibold text-sand-dark text-sm mb-1">{block.name}</p>
          <p className="text-sm leading-relaxed text-habitat-dark/80">{block.description}</p>
        </div>
      </div>
    </div>
  )
}

function ImagePairBlock({ block }: { block: any }) {
  const img1 = mediaUrl(block.imageOne)
  const img2 = mediaUrl(block.imageTwo)
  return (
    <div className="rv my-8">
      <div className="grid grid-cols-2 gap-3">
        {img1 && (
          <img src={img1} alt={block.imageOne?.alt || ''} className="w-full h-52 object-cover rounded-xl" />
        )}
        {img2 && (
          <img src={img2} alt={block.imageTwo?.alt || ''} className="w-full h-52 object-cover rounded-xl" />
        )}
      </div>
      {block.caption && (
        <p className="text-center text-sm text-habitat-muted mt-3 italic">{block.caption}</p>
      )}
    </div>
  )
}

function ProductCardBlock({ block }: { block: any }) {
  const [modalOpen, setModalOpen] = useState(false)
  const p = block.product
  if (!p) return null

  const imgUrl = mediaUrl(p.image)
  const cartProduct: CartProduct = {
    id: p.id,
    name: p.name,
    price: p.price,
    image: imgUrl,
    material: p.material,
  }

  if (block.displayStyle === 'compact') {
    return (
      <div className="rv my-6 flex items-center gap-4 p-4 bg-habitat-offwhite rounded-xl border border-black/5">
        {imgUrl && (
          <img src={imgUrl} alt={p.name} className="w-16 h-16 object-contain rounded-lg flex-shrink-0 bg-white" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium">{p.name}</p>
          {p.material && <p className="text-xs text-habitat-muted">{p.material}</p>}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-serif font-semibold text-terracotta">${p.price.toLocaleString()}</span>
          <AddToCartButton product={cartProduct} size="sm" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rv my-10 grid md:grid-cols-[240px_1fr] gap-6 p-5 bg-habitat-warm rounded-2xl">
        {imgUrl && (
          <button onClick={() => setModalOpen(true)} className="block overflow-hidden rounded-xl group bg-white">
            <img
              src={imgUrl}
              alt={p.name}
              className="w-full h-52 md:h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        )}
        <div className="flex flex-col justify-between">
          <div>
            <p className="font-serif text-2xl font-semibold">{p.name}</p>
            {p.material && <p className="text-sm text-habitat-muted mt-1">{p.material}</p>}
            {p.description && (
              <p className="text-sm leading-relaxed mt-3 text-habitat-dark/80">{p.description}</p>
            )}
          </div>
          <div className="mt-4">
            <p className="text-2xl font-serif font-semibold text-terracotta mb-3">
              ${p.price.toLocaleString()}
            </p>
            <div className="flex gap-3">
              <AddToCartButton product={cartProduct} />
              <button
                onClick={() => setModalOpen(true)}
                className="text-sm px-5 py-2.5 rounded-full border border-black/15 hover:border-black/30 transition-colors"
              >
                Quick view
              </button>
            </div>
            {block.editorsNote && (
              <p className="mt-4 text-sm italic text-habitat-muted border-l-2 border-terracotta/30 pl-3">
                &ldquo;{block.editorsNote}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <ProductModal
          product={{
            ...cartProduct,
            description: p.description,
            dimensions: p.dimensions,
            weight: p.weight,
            colors: p.colors,
            inStock: p.inStock,
          }}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}

function ShoppableSceneBlock({ block }: { block: any }) {
  const imgUrl = mediaUrl(block.image)
  if (!imgUrl) return null

  const hotspots = (block.hotspots || [])
    .filter((h: any) => h?.product)
    .map((h: any) => ({
      x: h.x,
      y: h.y,
      product: {
        id: h.product.id,
        name: h.product.name,
        price: h.product.price,
        image: mediaUrl(h.product.image),
        material: h.product.material,
        description: h.product.description,
        dimensions: h.product.dimensions,
        weight: h.product.weight,
        colors: h.product.colors,
        inStock: h.product.inStock,
      },
    }))

  return (
    <div className="rv my-10 -mx-6 md:mx-0">
      <HotspotScene
        imageUrl={imgUrl}
        imageAlt={block.image?.alt || 'Shoppable room scene'}
        hotspots={hotspots}
        caption={block.caption}
      />
    </div>
  )
}

function BudgetBreakdownBlock({ block }: { block: any }) {
  const items: Array<{ label: string; price: number; color: string }> = (block.items || []).map(
    (item: any) => ({
      label: item.label || item.product?.name || 'Item',
      price: item.price ?? item.product?.price ?? 0,
      color: item.color || '#C4673A',
    }),
  )

  const total = items.reduce((sum, i) => sum + i.price, 0)

  return (
    <div className="rv my-10 p-6 bg-habitat-warm rounded-2xl">
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="font-serif text-xl font-semibold">{block.title || 'Room breakdown'}</h3>
        <span className="font-serif text-xl font-semibold text-terracotta">
          ${total.toLocaleString()}
        </span>
      </div>

      {/* Bar chart */}
      <div className="flex h-2 rounded-full overflow-hidden mb-5">
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              width: `${total > 0 ? (item.price / total) * 100 : 0}%`,
              backgroundColor: item.color,
            }}
            title={item.label}
          />
        ))}
      </div>

      {/* List */}
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
            </div>
            <span className="font-medium">${item.price.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────

type Props = {
  blocks: any[]
}

export default function ArticleBlocks({ blocks }: Props) {
  if (!blocks?.length) return null

  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        switch (block.blockType) {
          case 'richText':
            return <RichTextBlock key={i} block={block} />
          case 'sectionHeading':
            return <SectionHeadingBlock key={i} block={block} />
          case 'pullQuote':
            return <PullQuoteBlock key={i} block={block} />
          case 'stylingTip':
            return <StylingTipBlock key={i} block={block} />
          case 'materialCallout':
            return <MaterialCalloutBlock key={i} block={block} />
          case 'imagePair':
            return <ImagePairBlock key={i} block={block} />
          case 'productCard':
            return <ProductCardBlock key={i} block={block} />
          case 'shoppableScene':
            return <ShoppableSceneBlock key={i} block={block} />
          case 'budgetBreakdown':
            return <BudgetBreakdownBlock key={i} block={block} />
          default:
            return null
        }
      })}
    </div>
  )
}
