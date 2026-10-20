import { Link } from 'react-router-dom'
import { Container, LogoMark } from './ui/primitives'

const links = [
  { to: '/people', label: 'People' },
  { to: '/archetypes', label: 'Archetypes' },
  { to: '/paths', label: 'Paths' },
  { to: { pathname: '/', hash: '#how-it-works' }, label: 'How it works' },
]

export default function Footer() {
  return (
    <footer className="border-t border-brand-dark/10 bg-brand-cream">
      <Container className="py-10 md:py-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="flex flex-col gap-3">
            <Link to="/" className="inline-flex items-center gap-2 text-brand-dark" aria-label="Archetype AI home">
              <LogoMark className="w-4 h-4" />
              <span className="text-base tracking-tight">Archetype AI</span>
            </Link>
            <p className="text-sm text-brand-dark/60">Know who you want to be. Become it.</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
            {links.map((l) => (
              <Link key={l.label} to={l.to} className="text-sm text-brand-dark tracking-wide hover:opacity-70 transition-opacity">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-10 text-xs text-brand-dark/50">© 2026 Archetype AI</p>
      </Container>
    </footer>
  )
}
