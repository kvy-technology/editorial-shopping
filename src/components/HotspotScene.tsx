'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useCart, type CartProduct } from '@/lib/cart'
import ProductModal from './ProductModal'

type Hotspot = {
  x: number
  y: number
  product: CartProduct & {
    description?: string
    dimensions?: string
    weight?: string
    colors?: { label: string; hex: string }[]
    inStock?: boolean
  }
}

type Props = {
  imageUrl: string
  imageAlt: string
  hotspots: Hotspot[]
  caption?: string
}

function HotspotPopup({
  hotspot,
  onAdd,
  onView,
  added,
  containerRect,
  dotRect,
}: {
  hotspot: Hotspot
  onAdd: () => void
  onView: () => void
  added: boolean
  containerRect: DOMRect | null
  dotRect: DOMRect | null
}) {
  const popupRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number; arrowLeft: string; showBelow: boolean }>({
    top: 0,
    left: 0,
    arrowLeft: '50%',
    showBelow: false,
  })
  const [measured, setMeasured] = useState(false)

  useEffect(() => {
    // Wait one frame so the popup is in the DOM and has its full size
    const raf = requestAnimationFrame(() => {
      if (!popupRef.current || !containerRect || !dotRect) return

      const popupW = popupRef.current.offsetWidth
      const popupH = popupRef.current.offsetHeight
      const gap = 12

      // Dot center relative to container
      const dotCenterX = dotRect.left + dotRect.width / 2 - containerRect.left
      const dotCenterY = dotRect.top + dotRect.height / 2 - containerRect.top
      const containerW = containerRect.width
      const dotHalfH = dotRect.height / 2

      // Only show below if the dot is so near the top that the popup would overflow above
      const showBelow = dotCenterY - dotHalfH - gap - popupH < -20

      const top = showBelow
        ? dotCenterY + dotHalfH + gap
        : dotCenterY - dotHalfH - gap - popupH

      // Horizontal: center on dot, clamp to container edges
      let left = dotCenterX - popupW / 2
      const pad = 8
      if (left < pad) left = pad
      if (left + popupW > containerW - pad) left = containerW - pad - popupW

      const arrowLeft = `${Math.max(12, Math.min(popupW - 12, dotCenterX - left))}px`

      setPos({ top, left, arrowLeft, showBelow })
      setMeasured(true)
    })
    return () => cancelAnimationFrame(raf)
  }, [containerRect, dotRect])

  return (
    <div
      ref={popupRef}
      className="absolute w-52 bg-white rounded-xl shadow-xl p-3 z-30 animate-scale-in"
      style={{
        top: pos.top,
        left: pos.left,
        opacity: measured ? 1 : 0,
        pointerEvents: measured ? 'auto' : 'none',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Arrow */}
      {pos.showBelow ? (
        <div
          className="absolute -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white"
          style={{ left: pos.arrowLeft, transform: 'translateX(-50%)' }}
        />
      ) : (
        <div
          className="absolute -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"
          style={{ left: pos.arrowLeft, transform: 'translateX(-50%)' }}
        />
      )}

      {hotspot.product.image && (
        <img
          src={hotspot.product.image}
          alt={hotspot.product.name}
          className="w-full h-28 object-cover rounded-lg mb-2 bg-habitat-warm"
        />
      )}
      <p className="font-medium text-sm leading-snug">{hotspot.product.name}</p>
      {hotspot.product.material && (
        <p className="text-xs text-habitat-muted mt-0.5">{hotspot.product.material}</p>
      )}
      <div className="flex items-center justify-between mt-2">
        <span className="text-terracotta font-semibold text-sm">
          ${hotspot.product.price.toLocaleString()}
        </span>
        <div className="flex gap-1">
          <button
            onClick={onView}
            className="text-xs text-habitat-muted hover:text-habitat-dark px-2 py-1 rounded-full border border-gray-200 hover:border-gray-400 transition-colors"
          >
            View
          </button>
          <button
            onClick={onAdd}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs transition-all duration-200 ${
              added ? 'bg-sage scale-90' : 'bg-terracotta hover:bg-terracotta-dark active:scale-90'
            }`}
            aria-label="Add to cart"
          >
            {added ? '✓' : '+'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HotspotScene({ imageUrl, imageAlt, hotspots, caption }: Props) {
  const { addItem } = useCart()
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null)
  const [modalProduct, setModalProduct] = useState<Hotspot['product'] | null>(null)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null)
  const [activeDotRect, setActiveDotRect] = useState<DOMRect | null>(null)

  const toggleHotspot = useCallback(
    (index: number) => {
      setActiveHotspot((prev) => {
        const next = prev === index ? null : index
        if (next !== null && containerRef.current && dotRefs.current[next]) {
          setContainerRect(containerRef.current.getBoundingClientRect())
          setActiveDotRect(dotRefs.current[next]!.getBoundingClientRect())
        }
        return next
      })
    },
    [],
  )

  const handleAddFromPopup = useCallback(
    (product: CartProduct) => {
      addItem(product)
      setAddedIds((prev) => new Set(prev).add(product.id))
      setTimeout(() => {
        setAddedIds((prev) => {
          const next = new Set(prev)
          next.delete(product.id)
          return next
        })
      }, 2000)
    },
    [addItem],
  )

  return (
    <>
      <div className="relative w-full select-none">
        {/* Room image — NO overflow-hidden so popup can extend beyond */}
        <div
          ref={containerRef}
          className="relative w-full rounded-xl"
          style={{ aspectRatio: '2/1' }}
          onClick={() => setActiveHotspot(null)}
        >
          <img
            src={imageUrl}
            alt={imageAlt}
            className="absolute inset-0 w-full h-full object-cover rounded-xl"
          />

          {/* Hotspots */}
          {hotspots.map((hs, i) => (
            <div
              key={i}
              className="absolute"
              style={{ left: `${hs.x}%`, top: `${hs.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {/* Hotspot dot */}
              <button
                ref={(el) => { dotRefs.current[i] = el }}
                className={`relative w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 z-10 ${
                  activeHotspot === i
                    ? 'bg-terracotta border-terracotta scale-110'
                    : 'bg-white border-white hover:scale-110'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleHotspot(i)
                }}
                aria-label={`View ${hs.product.name}`}
              >
                {/* Pulse ring */}
                {activeHotspot !== i && (
                  <span className="absolute inset-0 rounded-full bg-white/60 hotspot-ring" />
                )}
                <span
                  className={`w-2 h-2 rounded-full transition-colors ${
                    activeHotspot === i ? 'bg-white' : 'bg-terracotta'
                  }`}
                />
              </button>
            </div>
          ))}

          {/* Popup — rendered at container level so it isn't clipped */}
          {activeHotspot !== null && hotspots[activeHotspot] && (
            <HotspotPopup
              hotspot={hotspots[activeHotspot]}
              onAdd={() => handleAddFromPopup(hotspots[activeHotspot].product)}
              onView={() => setModalProduct(hotspots[activeHotspot].product)}
              added={addedIds.has(hotspots[activeHotspot].product.id)}
              containerRect={containerRect}
              dotRect={activeDotRect}
            />
          )}
        </div>

        {caption && (
          <p className="text-center text-sm text-habitat-muted mt-3 italic">{caption}</p>
        )}
      </div>

      {/* Product modal */}
      {modalProduct && (
        <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />
      )}
    </>
  )
}
