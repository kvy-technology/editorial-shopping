import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-habitat-dark text-white/70 pt-16 pb-10 px-6 lg:px-10">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <p className="font-serif text-2xl font-bold text-white mb-3">Habitat</p>
          <p className="text-sm leading-relaxed">
            Editorial rooms, shoppable products. Discover spaces you&apos;ll love.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-white/40 mb-4 font-medium">Rooms</p>
          <ul className="space-y-2 text-sm">
            {['Living room', 'Bedroom', 'Dining', 'Home office', 'Outdoor'].map((r) => (
              <li key={r}>
                <Link href="/articles" className="hover:text-white transition-colors">
                  {r}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-white/40 mb-4 font-medium">Stories</p>
          <ul className="space-y-2 text-sm">
            {['Get the look', 'Design guides', 'Room tours', 'Trending now'].map((s) => (
              <li key={s}>
                <Link href="/articles" className="hover:text-white transition-colors">
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-white/40 mb-4 font-medium">Built with</p>
          <ul className="space-y-2 text-sm">
            {['PayloadCMS', 'Next.js', 'Tailwind CSS', 'SQLite / Neon'].map((t) => (
              <li key={t} className="text-white/40">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/10 text-xs text-white/30 text-center">
        © {new Date().getFullYear()} Habitat — Editorial shopping demo
      </div>
    </footer>
  )
}
