import {
  ClerkProvider,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/providers/query-provider'
import GlobalContextProvider from '@/context/GlobalContextProvider'
import { Toaster } from 'sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata = {
  title: 'Vill Fields Dashboard',
  description: 'Vill Fields is a platform for managing your business.',
}

export default function RootLayout({
  children,
}) {
  return (
    <ClerkProvider>
      <GlobalContextProvider>
        <html lang="en">
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <QueryProvider>
              {children}
            </QueryProvider>

            <Toaster position="bottom-right" richColors />
          </body>
        </html>
      </GlobalContextProvider>
    </ClerkProvider>
  )
}





