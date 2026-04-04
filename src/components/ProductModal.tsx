'use client'

import { useEffect, useState } from 'react'
import { useCart, type CartProduct } from '@/lib/cart'

type Props = {
  product: CartProduct & {
    description?: string
    dimensions?: string
    weight?: string
    colors?: { label: string; hex: string }[]
    inStock?: boolean
  } | null
  onClose: () => void
}

export default function ProductModal({ product, onClose }: Props) {
  const { addItem } = useCart()
  const [selectedColor, setSelectedColor] = useState(0)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setAdded(false)
    setSelectedColor(0)
  }, [product])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!product) return null

  const handleAdd = () => {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors text-white"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        {/* Image */}
        <div className="relative h-64 bg-habitat-warm overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-habitat-muted text-sm">
              No image
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-serif text-2xl font-semibold leading-snug">{product.name}</h3>
          {product.material && (
            <p className="text-sm text-habitat-muted mt-1">{product.material}</p>
          )}

          {/* Specs */}
          {(product.dimensions || product.weight) && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {product.dimensions && (
                <div className="bg-habitat-offwhite rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-widest text-habitat-muted font-medium mb-1">Dimensions</p>
                  <p className="text-sm font-medium">{product.dimensions}</p>
                </div>
              )}
              {product.weight && (
                <div className="bg-habitat-offwhite rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-widest text-habitat-muted font-medium mb-1">Weight</p>
                  <p className="text-sm font-medium">{product.weight}</p>
                </div>
              )}
            </div>
          )}

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-widest text-habitat-muted font-medium mb-2">Colors</p>
              <div className="flex gap-2">
                {product.colors.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(i)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColor === i ? 'border-terracotta scale-110' : 'border-transparent hover:scale-110'}`}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Price + CTA */}
          <div className="flex items-center justify-between mt-5">
            <div>
              <p className="text-2xl font-serif font-semibold text-terracotta">
                ${product.price.toLocaleString()}
              </p>
              <p className={`text-xs mt-0.5 font-medium ${product.inStock !== false ? 'text-sage' : 'text-red-400'}`}>
                {product.inStock !== false ? '● In stock' : '● Out of stock'}
              </p>
            </div>
            <button
              onClick={handleAdd}
              disabled={product.inStock === false}
              className={`px-6 py-3 rounded-full font-medium text-sm transition-all duration-200 ${
                added
                  ? 'bg-sage text-white scale-95'
                  : product.inStock === false
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-terracotta text-white hover:bg-terracotta-dark active:scale-95'
              }`}
            >
              {added ? '✓ Added' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
