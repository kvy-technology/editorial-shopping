'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const CATEGORIES = [
  { label: 'All rooms', value: '' },
  { label: 'Living room', value: 'living-room' },
  { label: 'Bedroom', value: 'bedroom' },
  { label: 'Dining', value: 'dining' },
  { label: 'Home office', value: 'home-office' },
  { label: 'Outdoor', value: 'outdoor' },
]

export default function CategoryFilter() {
  const [active, setActive] = useState('')

  return (
    <div className="sticky top-[60px] z-20 bg-habitat-offwhite/95 backdrop-blur-sm border-b border-black/5 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-3 flex gap-2 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActive(cat.value)}
            className={`flex-shrink-0 text-xs font-medium px-4 py-2 rounded-full transition-all duration-200 ${
              active === cat.value
                ? 'bg-terracotta text-white'
                : 'bg-white text-habitat-dark/70 hover:bg-habitat-warm border border-black/5 hover:border-transparent'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  )
}
