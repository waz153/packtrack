import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PackTrack — Pack 815',
  description: 'Self-serve event check-in for Pack 815',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
