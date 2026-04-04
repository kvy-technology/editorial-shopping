// Root layout is a pass-through. Each route group (frontend) / (payload) provides its own
// <html> and <body> so they don't nest — Payload's RootLayout renders its own <html><body>.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
