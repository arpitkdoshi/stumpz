import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

import { Providers } from '@/providers/providers'

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], // Or other weights as needed
  variable: '--font-poppins', // Define a CSS variable
})

export const metadata: Metadata = {
  title: 'Stumpz',
  description:
    'Manage cricket tournaments, track ball-by-ball scores, handle team auctions, and simplify admin tasks with Stumpz – your all-in-one cricket platform.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body
        className={`${poppins.variable} ${poppins.className} antialiased relative`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
