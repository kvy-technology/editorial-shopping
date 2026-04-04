'use client'

import { useState } from 'react'
import { useCart, type CartProduct } from '@/lib/cart'

type Props = {
  product: CartProduct
  className?: string
  size?: 'sm' | 'md'
}

export default function AddToCartButton({ product, className = '', size = 'md' }: Props) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const base =
    size === 'sm'
      ? 'text-xs px-4 py-2 rounded-full font-medium'
      : 'text-sm px-5 py-2.5 rounded-full font-medium'

  return (
    <button
      onClick={handleAdd}
      className={`${base} transition-all duration-200 active:scale-95 ${
        added ? 'bg-sage text-white' : 'bg-terracotta text-white hover:bg-terracotta-dark'
      } ${className}`}
    >
      {added ? '✓ Added' : 'Add to cart'}
    </button>
  )
}
