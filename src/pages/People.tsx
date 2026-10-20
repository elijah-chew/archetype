import { ArrowRight, Search } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { Container, Pill, Reveal, cx } from '../components/ui/primitives'
import { archetypes, getArchetype } from '../data/archetypes'
import { people } from '../data/people'
import type { ArchetypeId } from '../data/types'

export default function People() {
  const [query, setQuery] = useState('')
  const [archetype, setArchetype] = useState<ArchetypeId | 'all'>('all')

  const usedArchetypes = archetypes.filter((a) => people.some((p) => p.archetype === a.id))

  const q = query.trim().toLowerCase()
  const results = people.filter((p) => {
    if (archetype !== 'all' && p.archetype !== archetype) return false
    if (!q) return true
    return [p.name, p.association, p.signatureOutfit, ...p.coreValues, getArchetype(p.archetype).name]
      .join(' ')
      .toLowerCase()
      .includes(q)
  })

  return (
    <>
      <PageHeader
        eyebrow="People archive"
        title="Study how they built it. Then plan your version."
        subtitle="Signature outfits, core values, timelines, key decisions, and what to adopt or leave behind. Structured as a database so every profile reads the same way."
      >
        <div className="flex flex-col gap-4">
          <label className="relative max-w-xl">
            <span className="sr-only">Search people</span>
            <Search className="w-4 h-4 text-brand-dark/45 absolute left-4 top-1/2 -translate-y-1/2" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, company, value, or archetype"
              className="w-full rounded-full border border-brand-green/35 bg-white/70 backdrop-blur-sm pl-11 pr-5 py-3 text-sm text-brand-dark placeholder:text-brand-dark/40 focus:outline-none focus:border-brand-green"
            />
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by archetype">
            <FilterChip active={archetype === 'all'} onClick={() => setArchetype('all')}>
              All
            </FilterChip>
            {usedArchetypes.map((a) => (
              <FilterChip key={a.id} active={archetype === a.id} onClick={() => setArchetype(a.id)}>
                {a.name.replace('The ', '')}
              </FilterChip>
            ))}
          </div>
        </div>
      </PageHeader>

      <section className="pb-24 md:pb-32 bg-brand-cream">
        <Container>
          <p className="text-xs text-brand-dark/50 tracking-wide mb-6" aria-live="polite">
            {results.length} {results.length === 1 ? 'profile' : 'profiles'}
          </p>
          {results.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-brand-dark/20 p-12 text-center">
              <p className="text-lg text-brand-dark">No one matches “{query}”.</p>
              <p className="mt-2 text-sm text-brand-dark/60">Try a name, a company, or an archetype.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((p, i) => {
                const a = getArchetype(p.archetype)
                return (
                  <Reveal key={p.slug} as="li" stagger={((i % 3) + 1) as 1 | 2 | 3}>
                    <Link
                      to={`/people/${p.slug}`}
                      className="group block h-full rounded-3xl border border-brand-dark/10 bg-white/60 backdrop-blur-sm p-6 hover:bg-white/90 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span
                          aria-hidden
                          className="w-20 h-24 rounded-2xl flex items-end justify-start p-3 text-brand-cream text-lg tracking-wide shrink-0"
                          style={{ backgroundColor: p.tone }}
                        >
                          {p.initials}
                        </span>
                        <Pill tone="outline">{a.name}</Pill>
                      </div>
                      <h2 className="mt-5 text-2xl text-brand-dark tracking-tight">{p.name}</h2>
                      <p className="mt-1 text-sm text-brand-dark/65">{p.association}</p>
                      <p className="mt-4 text-[11px] tracking-[0.2em] uppercase text-brand-dark/45">Signature outfit</p>
                      <p className="mt-1 text-sm text-brand-dark/80 leading-relaxed">{p.signatureOutfit}</p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-brand-dark group-hover:opacity-70 transition-opacity">
                        Open profile
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                      </span>
                    </Link>
                  </Reveal>
                )
              })}
            </ul>
          )}
        </Container>
      </section>
    </>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'rounded-full px-4 py-2 text-sm transition-colors border',
        active ? 'bg-brand-dark text-brand-cream border-brand-dark' : 'border-brand-dark/15 text-brand-dark hover:bg-white/70',
      )}
    >
      {children}
    </button>
  )
}
