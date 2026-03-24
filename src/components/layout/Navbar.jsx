import { useEffect, useMemo, useState } from 'react'

const navItems = [
  { label: 'About', id: 'about' },
  { label: 'Services', id: 'services' },
  { label: 'Missions', id: 'projects' },
  { label: 'Experience', id: 'experience' },
  { label: 'Contact', id: 'contact' },
]

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('about')
  const [menuOpen, setMenuOpen] = useState(false)

  const sectionsToObserve = useMemo(() => navItems.map((item) => item.id), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        root: null,
        rootMargin: '-40% 0px -45% 0px',
        threshold: 0.1,
      },
    )

    sectionsToObserve.forEach((id) => {
      const target = document.getElementById(id)
      if (target) {
        observer.observe(target)
      }
    })

    return () => observer.disconnect()
  }, [sectionsToObserve])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const navigateTo = (id) => {
    const section = document.getElementById(id)
    if (!section) {
      return
    }

    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMenuOpen(false)
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-accent-blue/40 bg-space-black/55 backdrop-blur-md shadow-[0_0_20px_rgba(0,163,255,0.22)]'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 md:px-8">
          <button
            type="button"
            className="flex items-center gap-3 text-left"
            onClick={() => navigateTo('hero')}
            aria-label="Go to hero section"
          >
            <span className="reactor-core" aria-hidden="true" />
            <span className="font-heading text-xl tracking-[0.22em] text-white md:text-2xl">NK</span>
          </button>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => {
              const isActive = activeSection === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`hud-nav-link ${isActive ? 'is-active' : ''}`}
                  onClick={() => navigateTo(item.id)}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className="hidden md:block">
            <span className="font-mono text-sm tracking-[0.25em] text-portal-green">[C-137]</span>
          </div>

          <button
            type="button"
            className="hud-hamburger md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        className={`mobile-nav-overlay md:hidden ${menuOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mobile-nav-panel">
          <div className="mb-8 flex items-center justify-between">
            <span className="font-heading text-2xl tracking-[0.24em] text-white">NK</span>
            <button
              type="button"
              className="font-mono text-xs tracking-[0.24em] text-accent-blue"
              onClick={() => setMenuOpen(false)}
            >
              [ CLOSE ]
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {navItems.map((item) => {
              const isActive = activeSection === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`hud-nav-link text-left text-base ${isActive ? 'is-active' : ''}`}
                  onClick={() => navigateTo(item.id)}
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          <div className="mt-10 border-t border-accent-blue/30 pt-6">
            <span className="font-mono text-xs tracking-[0.25em] text-portal-green">[C-137]</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar