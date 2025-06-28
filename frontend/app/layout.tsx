// app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import Navigation from '../components/navigation'

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
       <Navigation />
        <main>
          {children}
        </main>
         
      </body>
    </html>
  )
}