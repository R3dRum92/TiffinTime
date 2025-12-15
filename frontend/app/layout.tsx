// app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import Navigation from '../components/navigation'
import { Toaster } from "@/components/ui/sonner"
import { Providers } from './providers'
import { CartProvider } from './context/CartContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TiffinTime - Order Your Favourite Food Easily',
  description: 'We deliver 100% organic and fresh food. You can order right now!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {/* Wrap everything inside CartProvider here */}
          <CartProvider>
            <Navigation />
            <main suppressHydrationWarning={true}>
              {children}
            </main>
            <Toaster
              position="top-center"
              richColors
              closeButton
              toastOptions={{
                style: {
                  background: 'rgb(240, 231, 208)',
                  color: 'rgb(46, 36, 26)',
                  border: '1.5px solid #D98324',
                  fontSize: 14
                },
                actionButtonStyle: {
                  backgroundColor: '#D98324',
                  color: 'white',
                },
              }}
            />
          </CartProvider>
        </Providers>
      </body>
    </html>
  )
}