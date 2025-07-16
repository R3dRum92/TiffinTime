// components/Navigation.tsx
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  // Define allowed pages where navigation should be shown
  const allowedPages = ['/', '/my-plan/', '/vendors/', '/food/', '/subscription/']
  
  // Check if current page should show navigation
  const shouldShowNavigation = allowedPages.includes(pathname)

  const isActive = (path: string) => pathname === path

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50) // Add blur effect after scrolling 50px
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Don't render navigation if current page is not in allowed pages
  if (!shouldShowNavigation) {
    return null
  }

  return (
    <nav
      className={`fixed left-0 right-0 z-50 px-1 py-4 pointer-events-none transition-all duration-300 ${isScrolled
          ? 'backdrop-blur-md border border-white/20 '
          : 'bg-transparent'
        }`}
      style={{
        backgroundColor: isScrolled ? 'rgba(249, 245, 230)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
      }}

    >
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Logo */}
        <Link href="/" className="text-3xl font-bold">
          <span className="theme">Tiffin</span>
          <span className="darktext">Time</span>
        </Link>

        {/* Phone Number */}
        {/* <div className="hidden md:flex items-center darktext">
          <span className="mr-2">📞</span>
          <span>(+88) 0174 6174 857</span>
        </div> */}

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
            Vendors
          </Link>
          <Link
            href="/food"
            className={`font-bold text-xl darktext transition-colors relative ${isActive('/food/') ? 'theme after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-current after:content-[""]' : ''
              }`}
          >
            Find Food
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
            <button className="w-full bgtheme text-white font-bold px-6 py-2 rounded-full hover:bg-orange-500 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out transform cursor-pointer">
              Sign up/ Login
            </button>
          </Link>
          
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

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className={`md:hidden mt-4 mx-4 rounded-lg transition-all duration-300 ${isScrolled
            ? 'bg-white/90 backdrop-blur-md border border-white/20 shadow-lg'
            : 'bg-white/95 backdrop-blur-sm border border-white/30'
          }`}>
          <div className="px-6 py-4 space-y-4">
            <Link
              href="/"
              className={`block font-bold text-lg darktext transition-colors ${isActive('/') ? 'theme' : ''
                }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/my-plan"
              className={`block font-bold text-lg darktext transition-colors ${
                isActive('/my-plan') ? 'theme' : ''
              }`}              
              onClick={() => setIsMenuOpen(false)}
            >
              My Plan
            </Link>
            <Link
              href="/vendors"
              className={`block font-bold text-lg darktext transition-colors ${
                isActive('/vendors') ? 'theme' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Vendors
            </Link>
            <Link
              href="/food"
              className={`block font-bold text-lg darktext transition-colors ${
                isActive('/food') ? 'theme' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Find Food
            </Link>
            <Link
              href="/subscription"
              className={`block font-bold text-lg darktext transition-colors ${
                isActive('/subscription') ? 'theme' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Subscription Plan
            </Link>
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full bgtheme text-white font-bold px-6 py-2 rounded-full hover:bg-orange-500 transition-colors">
                  Sign up/ Login
                </button>
              </Link>
             
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navigation