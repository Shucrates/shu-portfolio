import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SHUISBORED* — Shubham Patil | Freelance Developer',
  description:
    'Shubham Patil aka SHUISBORED is a freelance developer skilled in frontend development, graphic design and brand identity.',
  keywords: ['frontend developer', 'graphic design', 'brand identity', 'portfolio', 'shuisbored'],
  openGraph: {
    title: 'SHUISBORED* — Shubham Patil',
    description: 'Freelance developer skilled in frontend, graphic design & brand identity.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
