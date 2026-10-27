
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Menu,
  X,
  ShoppingBag,
  Instagram,
  Facebook,
  Mail,
} from 'lucide-react'

const categories = [
  {
    name: 'Accessories',
    description: 'Details that complete your look',
    number: '01',
  },
  {
    name: 'Beauty & Care',
    description: 'Everyday essentials, thoughtfully chosen',
    number: '02',
  },
  {
    name: 'Lifestyle',
    description: 'Little things for everyday living',
    number: '03',
  },
]

const featured = [
  {
    name: 'The Everyday Essential',
    category: 'Accessories',
    price: 'Coming Soon',
  },
  {
    name: 'The Signature Collection',
    category: 'Lifestyle',
    price: 'Coming Soon',
  },
  {
    name: 'The Simple Edit',
    category: 'Beauty & Care',
    price: 'Coming Soon',
  },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8F6F1] text-[#292725]">

      {/* Announcement Bar */}
      <div className="bg-[#292725] px-4 py-2 text-center text-[10px] tracking-[0.18em] text-[#F8F6F1] sm:text-xs">
        A COLLECTION OF EVERYDAY ESSENTIALS
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-30 border-b border-[#DED8CD] bg-[#F8F6F1]/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">

          <Link
            to="/"
            onClick={closeMenu}
            className="text-base font-semibold tracking-[0.08em] sm:text-xl sm:tracking-[0.12em]"
          >
            ATHALIAH <span className="font-light">COLLECTIONS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-9 text-sm md:flex">
            <a href="#home" className="transition hover:text-[#A58F70]">Home</a>
            <a href="#shop" className="transition hover:text-[#A58F70]">Shop</a>
            <a href="#about" className="transition hover:text-[#A58F70]">About</a>
            <a href="#contact" className="transition hover:text-[#A58F70]">Contact</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">

            {/* Sign In */}
            <Link
              to="/login"
              className="flex items-center gap-2 border border-[#292725] px-3 py-2 text-[10px] tracking-wider transition hover:bg-[#292725] hover:text-white sm:px-4 sm:text-xs"
            >
              <ShoppingBag size={15} />
              SIGN IN
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded border border-[#DED8CD] p-2 transition hover:bg-[#EAE2D5] md:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="border-t border-[#DED8CD] bg-[#F8F6F1] px-6 py-5 md:hidden">
            <div className="flex flex-col gap-5 text-sm">
              <a href="#home" onClick={closeMenu} className="hover:text-[#A58F70]">
                Home
              </a>
              <a href="#shop" onClick={closeMenu} className="hover:text-[#A58F70]">
                Shop
              </a>
              <a href="#about" onClick={closeMenu} className="hover:text-[#A58F70]">
                About
              </a>
              <a href="#contact" onClick={closeMenu} className="hover:text-[#A58F70]">
                Contact
              </a>
            </div>
          </div>
        )}
      </header>

      <main>

        {/* Hero Section */}
        <section
          id="home"
          className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-6 sm:py-16 md:grid-cols-2 md:py-24"
        >
          <div className="max-w-xl">
            <p className="mb-5 text-xs tracking-[0.3em] text-[#9B8568]">
              SIMPLE THINGS. TIMELESS STYLE.
            </p>

            <h1 className="text-4xl font-light leading-tight sm:text-5xl md:text-7xl">
              Discover your
              <span className="block font-normal italic">everyday</span>
              essentials.
            </h1>

            <p className="mt-6 max-w-md text-sm leading-7 text-[#777067]">
              Welcome to Athaliah Collections — a thoughtfully curated space
              for simple, timeless, and meaningful finds.
            </p>

            <a
              href="#shop"
              className="mt-8 inline-flex items-center gap-3 bg-[#292725] px-6 py-4 text-xs tracking-[0.16em] text-white transition hover:bg-[#8B7663] sm:px-7"
            >
              EXPLORE COLLECTION <ArrowRight size={16} />
            </a>
          </div>

          <div className="relative flex min-h-[320px] items-center justify-center bg-[#EAE2D5] p-5 sm:min-h-[420px] sm:p-8 md:min-h-[520px]">
            <div className="absolute inset-4 border border-[#C8B49D] sm:inset-5" />

            <div className="relative max-w-full text-center">
              <p className="text-xs tracking-[0.35em] text-[#8B7663]">
                ATHALIAH
              </p>

              <h2 className="mt-4 break-words text-3xl font-light tracking-[0.08em] sm:text-5xl md:text-6xl">
                A T H A L I A H
              </h2>

              <div className="mx-auto my-6 h-px w-20 bg-[#A58F70]" />

              <p className="text-xs tracking-[0.25em] text-[#6F5C4B]">
                COLLECTIONS
              </p>
            </div>
          </div>
        </section>

        {/* Collections Section */}
        <section id="shop" className="bg-white px-5 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-7xl">

            <div className="mb-10 text-center">
              <p className="text-xs tracking-[0.25em] text-[#A58F70]">
                EXPLORE
              </p>

              <h2 className="mt-3 text-3xl font-light sm:text-4xl">
                Our Collections
              </h2>

              <p className="mt-3 text-sm text-[#777067]">
                Find something that feels just right.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.number}
                  className="border border-[#E5DED3] bg-[#F8F6F1] p-6 transition hover:border-[#A58F70] sm:p-8"
                >
                  <p className="text-xs tracking-widest text-[#A58F70]">
                    {category.number}
                  </p>

                  <h3 className="mt-10 text-2xl font-light sm:mt-12">
                    {category.name}
                  </h3>

                  <p className="mt-3 text-sm text-[#777067]">
                    {category.description}
                  </p>

                  <a
                    href="#featured"
                    className="mt-8 inline-flex items-center gap-2 text-xs tracking-widest"
                  >
                    DISCOVER <ArrowRight size={14} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section
          id="featured"
          className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20"
        >
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.25em] text-[#A58F70]">
                HANDPICKED FOR YOU
              </p>

              <h2 className="mt-3 text-3xl font-light sm:text-4xl">
                Featured Finds
              </h2>
            </div>

            <p className="text-sm text-[#777067]">
              Our collection is coming soon.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {featured.map((item) => (
              <div key={item.name}>
                <div className="flex aspect-[4/5] items-center justify-center bg-[#EAE2D5]">
                  <span className="px-3 text-center text-xs tracking-[0.25em] text-[#8B7663]">
                    ATHALIAH COLLECTIONS
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 py-4">
                  <div>
                    <h3 className="text-sm font-medium">{item.name}</h3>
                    <p className="mt-1 text-xs text-[#777067]">
                      {item.category}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs text-[#8B7663]">
                    {item.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section
          id="about"
          className="bg-[#EAE2D5] px-5 py-16 text-center sm:px-6 sm:py-20"
        >
          <p className="text-xs tracking-[0.3em] text-[#8B7663]">
            OUR STORY
          </p>

          <h2 className="mt-4 text-3xl font-light sm:text-4xl">
            Thoughtful finds, timeless appeal.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#6F5C4B]">
            Athaliah Collections celebrates simplicity, individuality, and
            everyday essentials. We believe that great style is not about
            following every trend, but finding pieces that feel right for you.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-[#292725] px-5 py-12 text-[#F8F6F1] sm:px-6"
      >
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row">
          <div>
            <h2 className="text-lg tracking-[0.15em]">
              ATHALIAH COLLECTIONS
            </h2>

            <p className="mt-3 text-xs text-[#C8BFB2]">
              Simple things. Timeless style.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs tracking-widest">
              CONNECT WITH US
            </p>

            <div className="flex gap-5 text-[#C8BFB2]">
              <a href="#contact" aria-label="Instagram">
                <Instagram size={19} />
              </a>

              <a href="#contact" aria-label="Facebook">
                <Facebook size={19} />
              </a>

              <a href="mailto:hello@athaliahcollections.com" aria-label="Email">
                <Mail size={19} />
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-white/20 pt-5 text-xs text-[#C8BFB2]">
          © {new Date().getFullYear()} Athaliah Collections. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
