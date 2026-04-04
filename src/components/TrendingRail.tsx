'use client'

import { useState } from 'react'
import { type CartProduct } from '@/lib/cart'
import { mediaUrl } from '@/lib/media'
import ProductModal from './ProductModal'
import AddToCartButton from './AddToCartButton'
import type { Product, Media as MediaType } from '@/payload-types'

type Props = { products: Product[] }

export default function TrendingRail({ products }: Props) {
  const [modalProduct, setModalProduct] = useState<CartProduct & {
    description?: string; dimensions?: string; weight?: string;
    colors?: { label: string; hex: string }[]; inStock?: boolean
  } | null>(null)

  return (
    <>
      <div className="flex gap-5 overflow-x-auto no-scrollbar pb-2">
        {products.map((p, i) => {
          const imgUrl = mediaUrl(p.image as MediaType)
          const cartProduct: CartProduct = {
            id: p.id,
            name: p.name,
            price: p.price,
            image: imgUrl,
            material: p.material || undefined,
          }

          return (
            <div
              key={p.id}
              className="flex-shrink-0 w-60 bg-habitat-dark-2 rounded-2xl overflow-hidden group cursor-pointer rv transition-all duration-300 hover:-translate-y-1"
              style={{ transitionDelay: `${i * 0.05}s` }}
            >
              {/* Image */}
              <div className="h-52 overflow-hidden bg-habitat-dark relative">
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-habitat-dark to-habitat-dark-2" />
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="font-serif text-white font-medium leading-snug line-clamp-1">{p.name}</p>
                {p.material && (
                  <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{p.material}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-terracotta font-semibold">${p.price.toLocaleString()}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setModalProduct({
                        ...cartProduct,
                        description: p.description || undefined,
                        dimensions: p.dimensions || undefined,
                        weight: p.weight || undefined,
                        colors: p.colors?.map((c: { label: string; hex: string }) => ({ label: c.label, hex: c.hex })) || undefined,
                        inStock: p.inStock ?? true,
                      })}
                      className="text-xs text-white/50 hover:text-white px-2.5 py-1.5 rounded-full border border-white/10 hover:border-white/30 transition-colors"
                    >
                      View
                    </button>
                    <AddToCartButton product={cartProduct} size="sm" />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {modalProduct && (
        <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />
      )}
    </>
  )
}
