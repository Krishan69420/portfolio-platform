import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/components/shared/QueryProvider'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Krishan Kumar | Software Engineer',
    template: '%s | Krishan Kumar',
  },
  description: 'Software Engineer specializing in Rust and Solana blockchain development. Building fast, secure, decentralized systems.',
  keywords: ['Rust', 'Solana', 'Blockchain', 'Software Engineer', 'Web3', 'Full Stack'],
  authors: [{ name: 'Krishan Kumar' }],
  creator: 'Krishan Kumar',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://krishankumar.dev',
    title: 'Krishan Kumar | Software Engineer',
    description: 'Software Engineer specializing in Rust and Solana blockchain development.',
    siteName: 'Krishan Kumar Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Krishan Kumar | Software Engineer',
    description: 'Software Engineer specializing in Rust and Solana blockchain development.',
    creator: '@krishankumar',
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <QueryProvider>
            {children}
            <Toaster
              richColors
              position="bottom-right"
              toastOptions={{
                style: { fontFamily: 'var(--font-geist-sans)' },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
