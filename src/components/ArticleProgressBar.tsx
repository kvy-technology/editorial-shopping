'use client'

import { useEffect, useState } from 'react'

export default function ArticleProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0)
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div className="fixed top-[60px] left-0 right-0 z-20 h-0.5 bg-black/5">
      <div
        className="h-full bg-terracotta transition-[width] duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
