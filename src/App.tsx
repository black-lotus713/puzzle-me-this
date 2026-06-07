import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Products from './pages/Products'
import Admin from './pages/Admin'
import BookingHome from './pages/BookingHome'
import BookingPage from './pages/BookingPage'
import BookingDashboard from './pages/BookingDashboard'
import TestimonialsPage from './pages/TestimonialsPage'
import TestimonialsDashboard from './pages/TestimonialsDashboard'
import Footer from './components/Footer'

function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const linkBase =
    'relative text-sm font-medium text-secondary hover:text-primary transition-colors duration-[200ms] ' +
    'after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:bg-accent ' +
    'after:w-full after:scale-x-0 after:origin-left after:transition-transform after:duration-[200ms] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent rounded-sm'
  const linkActive = 'text-primary after:scale-x-100'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 bg-base h-16 flex items-center transition-all duration-[200ms] ${
        scrolled ? 'border-b border-border' : ''
      }`}
    >
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 lg:px-16 flex items-center justify-between">
        <NavLink to="/" className="font-display text-lg font-semibold text-primary rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent">
          Puzzle Me This
        </NavLink>
        <nav className="flex gap-8">
          <NavLink
            to="/products"
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}
          >
            Products
          </NavLink>
          <NavLink
            to="/testimonials"
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}
          >
            Testimonials
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}
          >
            Admin
          </NavLink>
          <NavLink
            to="/testimonials/dashboard"
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}
          >
            Reviews Dashboard
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

function Layout() {
  const location = useLocation()
  const hideFooter = location.pathname === '/admin' || location.pathname === '/booking/dashboard' || location.pathname === '/testimonials/dashboard'

  return (
    <>
      <Nav />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/booking" element={<BookingHome />} />
          <Route path="/booking/book" element={<BookingPage />} />
          <Route path="/booking/dashboard" element={<BookingDashboard />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/testimonials/dashboard" element={<TestimonialsDashboard />} />
        </Routes>
        {!hideFooter && <Footer />}
      </div>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-base">
        <Layout />
      </div>
    </BrowserRouter>
  )
}
