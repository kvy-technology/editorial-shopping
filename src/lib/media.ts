const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** Convert a Payload media object (or null) to an absolute URL string */
export function mediaUrl(
  media: { url?: string | null; filename?: string | null } | string | null | undefined,
): string | undefined {
  if (!media) return undefined
  if (typeof media === 'string') {
    // already a URL or an ID — return as-is
    return media.startsWith('http') ? media : undefined
  }
  if (media.url) {
    return media.url.startsWith('http') ? media.url : `${SERVER_URL}${media.url}`
  }
  if (media.filename) {
    return `${SERVER_URL}/media/${media.filename}`
  }
  return undefined
}

/** Format price as USD string */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}
