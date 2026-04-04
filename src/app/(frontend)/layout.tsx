import type { Metadata } from 'next'
import '@/app/globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CartDrawer from '@/components/CartDrawer'
import RevealWrapper from '@/components/RevealWrapper'
import { CartProvider } from '@/lib/cart'

export const metadata: Metadata = {
  title: {
    default: 'Habitat — Shop the Room',
    template: '%s | Habitat',
  },
  description: 'Discover beautifully styled rooms, then shop every piece that makes them extraordinary.',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <RevealWrapper>
            <main>{children}</main>
          </RevealWrapper>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
