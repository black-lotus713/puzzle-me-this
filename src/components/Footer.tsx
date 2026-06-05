import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-primary">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <span className="font-display text-lg font-semibold text-inverse">
              Puzzle Me This
            </span>
            <p className="mt-2 text-sm text-tertiary">
              Handcrafted home goods for everyday living.
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="text-sm text-inverse opacity-80 hover:opacity-100 transition-opacity duration-[200ms]">
              Home
            </Link>
            <Link to="/products" className="text-sm text-inverse opacity-80 hover:opacity-100 transition-opacity duration-[200ms]">
              Products
            </Link>
          </div>

          {/* Contact placeholder */}
          <div>
            <p className="text-sm text-tertiary">Questions? Reach out at</p>
            <p className="text-sm text-inverse opacity-80 mt-1">hello@puzzlemethis.com</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#2C2C2C]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16 py-6">
          <p className="text-xs text-tertiary">
            © {new Date().getFullYear()} Puzzle Me This. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
