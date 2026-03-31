import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollToTop() {
    if (!isHome) {
      navigate('/')
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    setMenuOpen(false)
  }

  function scrollToAbout() {
    if (!isHome) {
      navigate('/')
      setTimeout(() => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
    }
    setMenuOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-sky-100' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <button onClick={scrollToTop} className="flex items-center gap-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden shadow-sm ring-2 ring-sky-200 group-hover:ring-sky-400 transition-all duration-200">
              <img
                src="/logo.jpg"
                alt="Braun Clean Logo"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            <span className="font-bold text-xl md:text-2xl text-sky-800 tracking-tight">
              Braun<span className="text-sky-500">Clean</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={scrollToTop}
              className="text-sky-700 hover:text-sky-500 font-medium transition-colors duration-200"
            >
              Home
            </button>
            <button
              onClick={scrollToAbout}
              className="text-sky-700 hover:text-sky-500 font-medium transition-colors duration-200"
            >
              About Us
            </button>
            <Link
              to="/booking"
              className="btn-primary text-sm px-6 py-2.5"
            >
              Book Now
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-sky-700 hover:bg-sky-50 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-sky-100 py-4 px-2 space-y-1 animate-fade-in">
            <button
              onClick={scrollToTop}
              className="block w-full text-left px-4 py-3 rounded-xl text-sky-700 hover:bg-sky-50 font-medium transition-colors"
            >
              Home
            </button>
            <button
              onClick={scrollToAbout}
              className="block w-full text-left px-4 py-3 rounded-xl text-sky-700 hover:bg-sky-50 font-medium transition-colors"
            >
              About Us
            </button>
            <Link
              to="/booking"
              onClick={() => setMenuOpen(false)}
              className="block w-full text-center mt-2 btn-primary"
            >
              Book Now
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
