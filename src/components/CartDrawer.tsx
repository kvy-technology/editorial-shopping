'use client'

import { useCart } from '@/lib/cart'
import { useEffect } from 'react'

export default function CartDrawer() {
  const { items, open, count, total, removeItem, closeCart } = useCart()

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && closeCart()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeCart])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-serif text-xl font-semibold">
            Your cart{' '}
            {count > 0 && (
              <span className="text-sm font-sans font-normal text-habitat-muted ml-1">
                ({count} {count === 1 ? 'item' : 'items'})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-habitat-muted"
            aria-label="Close cart"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center pt-16 text-habitat-muted">
              <div className="text-4xl mb-3">🛒</div>
              <p className="font-serif text-lg">Your cart is empty</p>
              <p className="text-sm mt-1">Add products from any room to get started.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 items-start group">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0 bg-gray-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-habitat-warm flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm leading-snug">{item.name}</p>
                  {item.material && (
                    <p className="text-xs text-habitat-muted mt-0.5">{item.material}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-terracotta font-semibold text-sm">
                      ${(item.price * item.qty).toLocaleString()}
                    </span>
                    <span className="text-xs text-habitat-muted">
                      {item.qty > 1 && `${item.qty} × $${item.price.toLocaleString()}`}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-habitat-muted hover:text-red-500 transition-all mt-0.5"
                  aria-label="Remove item"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className="font-serif text-xl font-semibold text-terracotta">
                ${total.toLocaleString()}
              </span>
            </div>
            <button className="w-full bg-terracotta text-white font-medium py-3.5 rounded-full hover:bg-terracotta-dark transition-colors">
              Checkout — demo only
            </button>
            <p className="text-center text-xs text-habitat-muted">
              This is a demo showcase. No real checkout.
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
