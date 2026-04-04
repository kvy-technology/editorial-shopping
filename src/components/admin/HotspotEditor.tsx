'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAllFormFields, useForm, useWatchForm } from '@payloadcms/ui'

interface HotspotItem {
  id?: string
  product: string
  x: number
  y: number
}

interface Product {
  id: string
  name: string
  price?: number
  image?: { url?: string; filename?: string }
}

const SERVER_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

function resolveUrl(img: any): string | undefined {
  if (!img) return undefined
  if (typeof img === 'string') return img.startsWith('http') ? img : undefined
  if (img.url) return img.url.startsWith('http') ? img.url : `${SERVER_URL}${img.url}`
  if (img.filename) return `${SERVER_URL}/media/${img.filename}`
  return undefined
}

export function HotspotEditor({ path }: { path: string }) {
  // ── Read hotspot rows from flat form state ──────────────────────────────
  const [allFields, dispatchFields] = useAllFormFields()

  // Array field value = row count (number)
  const rowCount = (allFields[path]?.value as number) || 0

  const hotspots: HotspotItem[] = useMemo(
    () =>
      Array.from({ length: rowCount }, (_, i) => ({
        id: allFields[`${path}.${i}.id`]?.value as string,
        product: allFields[`${path}.${i}.product`]?.value as string,
        x: (allFields[`${path}.${i}.x`]?.value as number) ?? 0,
        y: (allFields[`${path}.${i}.y`]?.value as number) ?? 0,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allFields, path, rowCount],
  )

  // ── Read image ID from sibling form data ────────────────────────────────
  const { getSiblingData } = useWatchForm()
  const blockData = getSiblingData(path) as any
  const imageId = blockData?.image

  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)
  useEffect(() => {
    if (!imageId) { setImageUrl(undefined); return }
    fetch(`/api/media/${imageId}?depth=0`)
      .then((r) => r.json())
      .then((doc) => setImageUrl(resolveUrl(doc)))
      .catch(() => setImageUrl(undefined))
  }, [imageId])

  // ── Products ────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([])
  useEffect(() => {
    fetch('/api/products?limit=200&depth=1')
      .then((r) => r.json())
      .then((d) => setProducts(d.docs || []))
      .catch(() => {})
  }, [])

  // ── Hotspot placement state ─────────────────────────────────────────────
  const [pending, setPending] = useState<{ x: number; y: number } | null>(null)
  const [tooltip, setTooltip] = useState<number | null>(null)

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (pending) return
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10
      setPending({ x, y })
    },
    [pending],
  )

  const { setModified } = useForm()

  const addHotspot = useCallback(
    (product: Product) => {
      if (!pending) return
      const idx = rowCount
      dispatchFields({ type: 'ADD_ROW', path, rowIndex: idx })
      dispatchFields({ type: 'UPDATE', path: `${path}.${idx}.product`, value: product.id, valid: true })
      dispatchFields({ type: 'UPDATE', path: `${path}.${idx}.x`, value: pending.x, valid: true })
      dispatchFields({ type: 'UPDATE', path: `${path}.${idx}.y`, value: pending.y, valid: true })
      setModified(true)
      setPending(null)
    },
    [pending, rowCount, path, dispatchFields, setModified],
  )

  const removeHotspot = useCallback(
    (rowIndex: number) => {
      dispatchFields({ type: 'REMOVE_ROW', path, rowIndex })
      setModified(true)
    },
    [path, dispatchFields, setModified],
  )

  const getProductName = (id: string): string =>
    products.find((p) => p.id === id)?.name || id || 'Unknown'

  // ── Styles ──────────────────────────────────────────────────────────────
  const s = {
    emptyBox: {
      border: '2px dashed var(--theme-elevation-200)',
      borderRadius: 8,
      padding: '32px 16px',
      textAlign: 'center' as const,
      color: 'var(--theme-elevation-400)',
      fontSize: 13,
    },
    canvasWrap: {
      position: 'relative' as const,
      width: '100%',
      aspectRatio: '2 / 1',
      borderRadius: 8,
      overflow: 'hidden',
      cursor: 'crosshair',
      userSelect: 'none' as const,
      boxShadow: '0 0 0 1px var(--theme-elevation-150)',
    },
    img: {
      position: 'absolute' as const,
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
      pointerEvents: 'none' as const,
    },
    overlay: { position: 'absolute' as const, inset: 0 },
    dotWrap: (x: number, y: number) =>
      ({
        position: 'absolute' as const,
        left: `${x}%`,
        top: `${y}%`,
        zIndex: 10,
      }) as React.CSSProperties,
    dot: (active: boolean) =>
      ({
        transform: 'translate(-50%, -50%)',
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: active ? '#e05a3a' : 'rgba(255,255,255,0.95)',
        border: `2px solid ${active ? '#e05a3a' : 'rgba(0,0,0,0.3)'}`,
        color: active ? '#fff' : '#333',
        fontSize: 16,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        transition: 'all 0.15s',
      }) as React.CSSProperties,
    tooltip: {
      position: 'absolute' as const,
      bottom: 'calc(100% + 6px)',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.85)',
      color: '#fff',
      fontSize: 11,
      whiteSpace: 'nowrap' as const,
      padding: '4px 8px',
      borderRadius: 4,
      pointerEvents: 'none' as const,
    },
    pendingDot: {
      position: 'absolute' as const,
      left: `${pending?.x}%`,
      top: `${pending?.y}%`,
      transform: 'translate(-50%, -50%)',
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: '#3b82f6',
      border: '2px solid white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      zIndex: 10,
    } as React.CSSProperties,
    hint: {
      fontSize: 12,
      color: 'var(--theme-elevation-400)',
      marginTop: 8,
      textAlign: 'center' as const,
    },
    pickerWrap: {
      marginTop: 12,
      border: '1px solid var(--theme-elevation-200)',
      borderRadius: 8,
      overflow: 'hidden',
    },
    pickerHeader: {
      padding: '10px 14px',
      background: 'var(--theme-elevation-50)',
      borderBottom: '1px solid var(--theme-elevation-150)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    productGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: 1,
      background: 'var(--theme-elevation-100)',
      maxHeight: 280,
      overflowY: 'auto' as const,
    },
    productCard: {
      background: 'var(--theme-bg)',
      padding: 10,
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 6,
    },
    productThumb: {
      width: '100%',
      aspectRatio: '4/3',
      objectFit: 'cover' as const,
      borderRadius: 4,
      background: 'var(--theme-elevation-100)',
    },
    hotspotList: {
      marginTop: 12,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 6,
    },
    hotspotRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 10px',
      background: 'var(--theme-elevation-50)',
      borderRadius: 6,
      border: '1px solid var(--theme-elevation-150)',
      fontSize: 12,
    },
  }

  return (
    <div>
      {/* ── Image canvas ─────────────────────────────────────────── */}
      {!imageUrl ? (
        <div style={s.emptyBox}>Select an image above to start placing hotspots</div>
      ) : (
        <>
          <div style={s.canvasWrap} onClick={handleImageClick}>
            <img src={imageUrl} alt="Scene" style={s.img} draggable={false} />
            <div style={s.overlay}>
              {hotspots.map((h, i) => (
                <div key={h.id || i} style={s.dotWrap(h.x, h.y)}>
                  <button
                    style={s.dot(tooltip === i)}
                    onClick={(e) => { e.stopPropagation(); removeHotspot(i) }}
                    onMouseEnter={() => setTooltip(i)}
                    onMouseLeave={() => setTooltip(null)}
                    title={`${getProductName(h.product)} — click to remove`}
                  >
                    {tooltip === i ? '×' : '+'}
                    {tooltip === i && (
                      <div style={s.tooltip}>
                        {getProductName(h.product)} · ({h.x}%, {h.y}%)
                      </div>
                    )}
                  </button>
                </div>
              ))}
              {pending && <div style={s.pendingDot} />}
            </div>
          </div>
          <p style={s.hint}>
            {pending
              ? 'Pick a product below to place the hotspot'
              : 'Click anywhere on the image to add a hotspot'}
          </p>
        </>
      )}

      {/* ── Product picker ────────────────────────────────────────── */}
      {pending && (
        <div style={s.pickerWrap}>
          <div style={s.pickerHeader}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--theme-elevation-600)' }}>
              Pick a product for ({pending.x}%, {pending.y}%)
            </span>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--theme-elevation-400)', padding: '2px 6px' }}
              onClick={() => setPending(null)}
            >
              Cancel
            </button>
          </div>
          <div style={s.productGrid}>
            {products.length === 0 ? (
              <div style={{ padding: 16, color: 'var(--theme-elevation-400)', fontSize: 12 }}>Loading…</div>
            ) : (
              products.map((p) => (
                <div
                  key={p.id}
                  style={s.productCard}
                  onClick={() => addHotspot(p)}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'var(--theme-elevation-50)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'var(--theme-bg)')}
                >
                  {p.image && (
                    <img src={resolveUrl(p.image) || ''} alt={p.name} style={s.productThumb} />
                  )}
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--theme-elevation-800)', lineHeight: 1.3 }}>{p.name}</div>
                  {p.price && <div style={{ fontSize: 11, color: 'var(--theme-elevation-400)' }}>${p.price.toLocaleString()}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Hotspot summary list ─────────────────────────────────── */}
      {hotspots.length > 0 && !pending && (
        <div style={s.hotspotList}>
          {hotspots.map((h, i) => (
            <div key={h.id || i} style={s.hotspotRow}>
              <span>📍</span>
              <span style={{ flex: 1, color: 'var(--theme-elevation-600)' }}>
                <strong>{getProductName(h.product)}</strong>
                <span style={{ fontSize: 10, color: 'var(--theme-elevation-400)', marginLeft: 6 }}>
                  x: {h.x}%, y: {h.y}%
                </span>
              </span>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--theme-elevation-400)', fontSize: 14 }}
                onClick={() => removeHotspot(i)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
