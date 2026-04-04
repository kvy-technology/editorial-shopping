'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { useEffect, useRef, useState } from 'react'

export default function Navbar() {
  const { count, openCart } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const prevCount = useRef(count)
  const [bump, setBump] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (count > prevCount.current) {
      setBump(true)
      setTimeout(() => setBump(false), 400)
    }
    prevCount.current = count
  }, [count])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-30 h-[60px] flex items-center justify-between px-6 lg:px-10 transition-shadow duration-300 bg-habitat-offwhite/95 backdrop-blur-sm ${scrolled ? 'shadow-sm' : ''}`}
    >
      <Link href="/" className="font-serif text-2xl font-bold text-terracotta tracking-tight">
        Habitat
      </Link>

      <div className="flex items-center gap-7">
        <Link
          href="/"
          className="text-sm font-medium text-habitat-dark/80 hover:text-habitat-dark relative group hidden sm:block"
        >
          Home
          <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-terracotta group-hover:w-full transition-all duration-200" />
        </Link>
        <Link
          href="/articles"
          className="text-sm font-medium text-habitat-dark/80 hover:text-habitat-dark relative group hidden sm:block"
        >
          Rooms
          <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-terracotta group-hover:w-full transition-all duration-200" />
        </Link>

        {/* Cart button */}
        <button
          onClick={openCart}
          className="relative flex items-center gap-1.5 text-sm font-medium text-habitat-dark/80 hover:text-habitat-dark transition-colors"
          aria-label="Open cart"
        >
          <span className={`transition-transform duration-300 ${bump ? 'scale-125' : 'scale-100'}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </span>
          {count > 0 && (
            <span
              className={`absolute -top-2 -right-2 w-5 h-5 rounded-full bg-terracotta text-white text-[10px] font-bold flex items-center justify-center transition-transform duration-300 ${bump ? 'scale-125' : 'scale-100'}`}
            >
              {count}
            </span>
          )}
        </button>
      </div>
    </nav>
  )
}
