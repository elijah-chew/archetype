import { ArrowRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { CharacterImage, Container, Pill, Reveal, cx } from '../components/ui/primitives'
import { archetypes } from '../data/archetypes'
import { getPath } from '../data/paths'
import { getPerson } from '../data/people'

const filters = [
  { id: 'all', label: 'All' },
  { id: 'make', label: 'Makers', ids: ['builder', 'creator', 'aesthete', 'visionary'] },
  { id: 'lead', label: 'Leaders', ids: ['operator', 'icon', 'connector', 'caregiver'] },
  { id: 'seek', label: 'Seekers', ids: ['sage', 'explorer', 'maverick', 'athlete'] },
]

export default function Archetypes() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const group = filters.find((f) => f.id === filter)
    return archetypes.filter((a) => {
      if (group?.ids && !group.ids.includes(a.id)) return false
      if (!q) return true
      const haystack = [
        a.name,
        a.identity,
        a.description,
        ...a.coreValues,
        ...a.strengths,
        ...a.visualLanguage,
        ...a.examplePeople.map((s) => getPerson(s)?.name ?? ''),
        ...a.paths.map((p) => getPath(p)?.name ?? ''),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [query, filter])

  return (
    <>
      <PageHeader
        eyebrow="Archetype library"
        title="Twelve ways to become unmistakable."
        subtitle="Each archetype is a pattern: values, strengths, a visual language, and the people who embody it. Search by trait, value, person, or path."
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <label className="relative flex-1 max-w-xl">
            <span className="sr-only">Search archetypes</span>
            <Search className="w-4 h-4 text-brand-dark/45 absolute left-4 top-1/2 -translate-y-1/2" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by value, strength, person, or path"
              className="w-full rounded-full border border-brand-green/35 bg-white/70 backdrop-blur-sm pl-11 pr-5 py-3 text-sm text-brand-dark placeholder:text-brand-dark/40 focus:outline-none focus:border-brand-green"
            />
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter archetypes">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={cx(
                  'rounded-full px-4 py-2 text-sm transition-colors border',
                  filter === f.id
                    ? 'bg-brand-dark text-brand-cream border-brand-dark'
                    : 'border-brand-dark/15 text-brand-dark hover:bg-white/70',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </PageHeader>

      <section className="pb-24 md:pb-32 bg-brand-cream">
        <Container>
          <p className="text-xs text-brand-dark/50 tracking-wide mb-6" aria-live="polite">
            {results.length} {results.length === 1 ? 'archetype' : 'archetypes'}
          </p>
          {results.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-brand-dark/20 p-12 text-center">
              <p className="text-lg text-brand-dark">Nothing matches “{query}”.</p>
              <p className="mt-2 text-sm text-brand-dark/60">Try a value like “discipline”, a person like “Rihanna”, or a path like “founder”.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map((a, i) => {
                const people = a.examplePeople.map((s) => getPerson(s)?.name).filter(Boolean).slice(0, 3)
                const pathNames = a.paths.map((p) => getPath(p)?.name).filter(Boolean)
                return (
                  <Reveal key={a.id} as="li" stagger={(Math.min(i % 3, 2) + 1) as 1 | 2 | 3}>
                    <article className="h-full rounded-3xl border border-brand-dark/10 bg-white/60 backdrop-blur-sm p-6 flex flex-col">
                      <div className="flex items-start gap-5">
                        <div className="w-24 h-24 shrink-0 rounded-2xl bg-brand-light overflow-hidden">
                          <CharacterImage src={a.character} alt="" className="w-full h-full" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-2xl text-brand-dark tracking-tight">{a.name}</h2>
                          <p className="mt-1 text-sm text-brand-dark/70">{a.identity}</p>
                        </div>
                      </div>

                      <dl className="mt-6 grid grid-cols-1 gap-4 text-sm">
                        <div>
                          <dt className="text-[11px] tracking-[0.2em] uppercase text-brand-dark/45 mb-2">Core values</dt>
                          <dd className="flex flex-wrap gap-1.5">
                            {a.coreValues.map((v) => (
                              <Pill key={v} tone="outline">
                                {v}
                              </Pill>
                            ))}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[11px] tracking-[0.2em] uppercase text-brand-dark/45 mb-2">Strengths</dt>
                          <dd className="text-brand-dark/80 leading-relaxed">{a.strengths.slice(0, 2).join('. ')}.</dd>
                        </div>
                        <div>
                          <dt className="text-[11px] tracking-[0.2em] uppercase text-brand-dark/45 mb-2">Visual language</dt>
                          <dd className="text-brand-dark/80">{a.visualLanguage.join(' · ')}</dd>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <dt className="text-[11px] tracking-[0.2em] uppercase text-brand-dark/45 mb-2">People</dt>
                            <dd className="text-brand-dark/80 leading-relaxed">{people.join(', ')}</dd>
                          </div>
                          <div>
                            <dt className="text-[11px] tracking-[0.2em] uppercase text-brand-dark/45 mb-2">Paths</dt>
                            <dd className="text-brand-dark/80 leading-relaxed">{pathNames.join(', ')}</dd>
                          </div>
                        </div>
                      </dl>

                      <div className="mt-auto pt-6">
                        <Link
                          to={`/archetypes/${a.id}`}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-dark/20 px-5 py-2.5 text-sm text-brand-dark hover:bg-brand-dark hover:text-brand-cream transition-colors"
                        >
                          Explore archetype
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                        </Link>
                      </div>
                    </article>
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
