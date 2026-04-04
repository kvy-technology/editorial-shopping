'use client'

export default function NewsletterForm() {
  return (
    <form className="flex gap-2 max-w-sm mx-auto" onSubmit={(e) => e.preventDefault()}>
      <input
        type="email"
        placeholder="Your email"
        className="flex-1 px-4 py-2.5 rounded-full border border-black/10 bg-white text-sm focus:outline-none focus:border-terracotta"
      />
      <button
        type="submit"
        className="px-5 py-2.5 rounded-full bg-terracotta text-white text-sm font-medium hover:bg-terracotta-dark transition-colors"
      >
        Subscribe
      </button>
    </form>
  )
}
