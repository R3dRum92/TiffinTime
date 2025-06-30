// components/Navigation.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed top-3 left-0 right-0 z-50 bg-transparent px-4 py-4 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Logo */}
        <Link href="/" className="text-3xl font-bold">
          <span className="theme">Tiffin</span>
          <span className="darktext">Time</span>
        </Link>

        {/* Phone Number */}
        <div className="hidden md:flex items-center darktext">
          <span className="mr-2">📞</span>
          <span>(+88) 0174 6174 857</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className={`font-bold text-xl darktext transition-colors relative ${isActive('/') ? 'theme after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-current after:content-[""]' : ''
              }`}
          >
            Home
          </Link>
          <Link
            href="/my-plan"
            className={`font-bold text-xl darktext transition-colors relative ${isActive('/my-plan/') ? 'theme after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-current after:content-[""]' : ''
              }`}
          >
            My Plan
          </Link>
          <Link
            href="/vendors"
            className={`font-bold text-xl darktext hover:theme transition-colors relative ${isActive('/vendors/') ? 'theme after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-current after:content-[""]' : ''
              }`}
          >
            Menu
          </Link>
          <Link
            href="/subscription"
            className={`font-bold text-xl darktext hover:theme transition-colors relative ${isActive('/subscription/') ? 'theme after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-current after:content-[""]' : ''
              }`}
          >
            Subscription Plan
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/auth">
            <button className="bgtheme text-white font-bold px-6 py-2 rounded-full hover:bg-orange-500 transition-colors">
              Sign up
            </button>
          </Link>
          <button className="bg-white darktext font-bold border border-gray-300 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-50 transition-colors">
            Login
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="sr-only">Open main menu</span>
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
            <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
          </div>
        </button>
      </div>


    </nav>
  )
}

export default Navigation