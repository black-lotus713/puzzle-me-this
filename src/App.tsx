import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import Products from './pages/Products'
import Admin from './pages/Admin'

function Nav() {
  const base = 'text-sm font-medium text-charcoal hover:text-olive transition-colors'
  const active = 'text-olive'
  return (
    <header className="bg-white border-b border-tan sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <NavLink to="/" className="text-xl font-bold text-charcoal tracking-tight">
          Puzzle Me This
        </NavLink>
        <nav className="flex gap-6">
          <NavLink to="/products" className={({ isActive }) => `${base} ${isActive ? active : ''}`}>
            Products
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => `${base} ${isActive ? active : ''}`}>
            Admin
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cream">
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
