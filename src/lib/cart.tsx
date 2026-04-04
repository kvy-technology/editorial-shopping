'use client'

import React, { createContext, useContext, useReducer, useCallback } from 'react'

export type CartProduct = {
  id: string
  name: string
  price: number
  image?: string
  material?: string
}

type CartItem = CartProduct & { qty: number }

type CartState = {
  items: CartItem[]
  open: boolean
}

type CartAction =
  | { type: 'ADD'; product: CartProduct }
  | { type: 'REMOVE'; id: string }
  | { type: 'OPEN' }
  | { type: 'CLOSE' }

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find((i) => i.id === action.product.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i,
          ),
        }
      }
      return { ...state, items: [...state.items, { ...action.product, qty: 1 }] }
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) }
    case 'OPEN':
      return { ...state, open: true }
    case 'CLOSE':
      return { ...state, open: false }
    default:
      return state
  }
}

type CartContextType = {
  items: CartItem[]
  open: boolean
  count: number
  total: number
  addItem: (product: CartProduct) => void
  removeItem: (id: string) => void
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], open: false })

  const addItem = useCallback((product: CartProduct) => {
    dispatch({ type: 'ADD', product })
  }, [])

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id })
  }, [])

  const openCart = useCallback(() => dispatch({ type: 'OPEN' }), [])
  const closeCart = useCallback(() => dispatch({ type: 'CLOSE' }), [])

  const count = state.items.reduce((n, i) => n + i.qty, 0)
  const total = state.items.reduce((n, i) => n + i.price * i.qty, 0)

  return (
    <CartContext.Provider value={{ items: state.items, open: state.open, count, total, addItem, removeItem, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
