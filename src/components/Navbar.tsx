import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useBodyScrollLock } from '../lib/hooks'
import { LogoMark, cx } from './ui/primitives'

const links = [
  { to: '/archetypes', label: 'Archetypes' },
  { to: '/people', label: 'People' },
  { to: '/paths', label: 'Paths' },
]

/** Home hash the CTA targets; the hero focuses its input when it sees it. */
export const FIND_HASH = '#find'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cx('text-sm text-brand-dark tracking-wide hover:opacity-70 transition-opacity', isActive && 'underline underline-offset-8 decoration-brand-green/60')

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* The blur lives on this inner bar, not the header: backdrop-filter would otherwise
          become the containing block for the fixed full-screen overlay below. */}
      <div
        className={cx(
          'relative z-50 transition duration-300',
          scrolled || open ? 'bg-brand-cream/90 backdrop-blur-md shadow-sm' : 'bg-transparent',
        )}
      >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <nav className="relative flex items-center h-16 md:h-20" aria-label="Primary">
          <div className="hidden md:flex items-center gap-8 animate-fade-down stagger-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </div>

          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 animate-fade-down stagger-2"
            aria-label="Archetype AI home"
          >
            <LogoMark className="w-5 h-5" />
            <span className="text-xl text-brand-dark tracking-tight font-helvetica-neue">Archetype AI</span>
          </Link>

          <Link
            to={{ pathname: '/', hash: FIND_HASH }}
            className="hidden md:inline-flex items-center ml-auto px-5 py-2.5 bg-brand-dark text-brand-cream text-sm tracking-wide rounded-full hover:bg-brand-green transition-colors animate-fade-down stagger-3"
          >
            Find your archetype
          </Link>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="md:hidden ml-auto relative z-50 w-10 h-10 flex items-center justify-center"
          >
            <span className="relative block w-6 h-5">
              <span
                className={cx(
                  'absolute left-0 w-6 h-[2px] bg-brand-dark rounded transition-all duration-300 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)]',
                  open ? 'top-[6px] rotate-45 translate-y-[5px]' : 'top-[6px]',
                )}
              />
              <span
                className={cx(
                  'absolute left-0 w-6 h-[2px] bg-brand-dark rounded transition-all duration-300 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)]',
                  open ? 'top-[13px] -rotate-45 -translate-y-[2px]' : 'top-[13px]',
                )}
              />
            </span>
          </button>
        </nav>
      </div>
      </div>

      <div
        id="mobile-menu"
        aria-hidden={!open}
        className={cx(
          'md:hidden fixed inset-0 bg-brand-cream z-40 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      >
        <div
          className={cx(
            'flex flex-col items-center justify-center h-full gap-8 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] delay-100',
            open ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0',
          )}
        >
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className="text-3xl text-brand-dark tracking-tight"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to={{ pathname: '/', hash: FIND_HASH }}
            onClick={() => setOpen(false)}
            tabIndex={open ? 0 : -1}
            className="mt-4 inline-flex items-center px-8 py-3.5 bg-brand-dark text-brand-cream text-lg tracking-wide rounded-full hover:bg-brand-green transition-colors"
          >
            Find your archetype
          </Link>
        </div>
      </div>
    </header>
  )
}
