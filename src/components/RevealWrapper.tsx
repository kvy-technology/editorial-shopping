'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function RevealWrapper({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    )

    // Observe all .rv elements that haven't been revealed yet
    const targets = el.querySelectorAll<HTMLElement>('.rv:not(.visible)')
    targets.forEach((t) => observer.observe(t))

    // Also watch for dynamically added .rv elements
    const mutation = new MutationObserver(() => {
      const newTargets = el.querySelectorAll<HTMLElement>('.rv:not(.visible)')
      newTargets.forEach((t) => observer.observe(t))
    })
    mutation.observe(el, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutation.disconnect()
    }
  }, [pathname])

  return <div ref={ref}>{children}</div>
}
