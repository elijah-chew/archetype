import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { FIND_HASH } from '../components/Navbar'
import { ButtonLink, CharacterStage, Container, Eyebrow, Facet, Pill, Reveal } from '../components/ui/primitives'
import { archetypeMap } from '../data/archetypes'
import { getPath } from '../data/paths'
import { getPerson } from '../data/people'
import { getStyleCode } from '../data/styleCodes'
import type { ArchetypeId } from '../data/types'

export default function ArchetypeDetail() {
  const { id } = useParams()
  const archetype = id ? archetypeMap[id as ArchetypeId] : undefined
  if (!archetype) return <Navigate to="/archetypes" replace />

  const styleCode = getStyleCode(archetype.id)
  const people = archetype.examplePeople.map(getPerson).filter((p): p is NonNullable<typeof p> => Boolean(p))
  const paths = archetype.paths.map(getPath).filter((p): p is NonNullable<typeof p> => Boolean(p))

  return (
    <>
      <section className="pt-28 md:pt-40 pb-16 md:pb-24 bg-brand-cream">
        <Container>
          <Link to="/archetypes" className="inline-flex items-center gap-1.5 text-sm text-brand-dark/70 hover:text-brand-dark animate-fade-up stagger-1">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
            All archetypes
          </Link>
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-12 items-start">
            <div className="flex flex-col items-start">
              <Eyebrow className="mb-5 animate-fade-up stagger-2">Archetype</Eyebrow>
              <h1 className="text-5xl md:text-6xl lg:text-7xl text-brand-dark leading-[1.02] tracking-tight animate-fade-up stagger-3">
                {archetype.name}
              </h1>
              <p className="mt-5 text-xl md:text-2xl text-brand-dark/80 leading-snug max-w-xl animate-fade-up stagger-4">{archetype.identity}</p>
              <p className="mt-5 text-base md:text-lg text-brand-dark/65 leading-relaxed max-w-xl animate-fade-up stagger-5">
                {archetype.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-2 animate-fade-up stagger-6">
                {archetype.pills.map((p) => (
                  <Pill key={p} size="md">
                    {p}
                  </Pill>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3 animate-fade-up stagger-6">
                <ButtonLink to={{ pathname: '/', hash: FIND_HASH }}>
                  Is this me?
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </ButtonLink>
                <ButtonLink to="/test" variant="secondary">
                  Take the test
                </ButtonLink>
              </div>
            </div>
            <div className="animate-fade-up stagger-4">
              <CharacterStage
                src={archetype.character}
                alt={`${archetype.name} character`}
                loading="eager"
                className="max-w-md mx-auto lg:ml-auto"
                caption={
                  <div>
                    <p className="text-[11px] tracking-[0.25em] uppercase text-brand-dark/45">Visual language</p>
                    <p className="text-base sm:text-lg text-brand-dark tracking-tight">{archetype.visualLanguage.slice(0, 2).join(' · ')}</p>
                  </div>
                }
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-brand-light">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <Reveal stagger={1}>
              <Facet label="Core values" items={archetype.coreValues} />
            </Reveal>
            <Reveal stagger={2}>
              <Facet label="Strengths" items={archetype.strengths} />
            </Reveal>
            <Reveal stagger={3}>
              <Facet label="Visual language" items={archetype.visualLanguage} />
            </Reveal>
            <Reveal stagger={4}>
              <Facet label="Presence" items={archetype.presenceNote} />
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-brand-cream">
        <Container>
          <Reveal stagger={1}>
            <Eyebrow className="mb-6">People who embody it</Eyebrow>
          </Reveal>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {people.map((p, i) => (
              <Reveal key={p.slug} as="li" stagger={((i % 3) + 1) as 1 | 2 | 3}>
                <Link
                  to={`/people/${p.slug}`}
                  className="group flex items-center gap-4 rounded-3xl border border-brand-dark/10 bg-white/60 p-4 hover:bg-white/90 transition-colors"
                >
                  <span
                    aria-hidden
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-brand-cream text-base tracking-wide shrink-0"
                    style={{ backgroundColor: p.tone }}
                  >
                    {p.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base text-brand-dark">{p.name}</span>
                    <span className="block text-xs text-brand-dark/60 truncate">{p.association}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-brand-dark/40 ml-auto group-hover:translate-x-0.5 transition-transform" aria-hidden />
                </Link>
              </Reveal>
            ))}
          </ul>

          <Reveal stagger={1} className="mt-16">
            <Eyebrow className="mb-6">Possible paths</Eyebrow>
          </Reveal>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paths.map((p, i) => (
              <Reveal key={p.id} as="li" stagger={((i % 3) + 1) as 1 | 2 | 3}>
                <Link to={`/paths/${p.id}`} className="block h-full rounded-3xl border border-brand-dark/10 bg-white/60 p-6 hover:bg-white/90 transition-colors">
                  <span className="block text-xl text-brand-dark tracking-tight">{p.name}</span>
                  <span className="mt-2 block text-sm text-brand-dark/65 leading-relaxed">{p.whoFor}</span>
                </Link>
              </Reveal>
            ))}
          </ul>

          <Reveal stagger={1} className="mt-16">
            <div className="rounded-[2rem] border border-brand-dark/10 bg-white/60 p-8 md:p-10 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-8 items-center">
              <div>
                <Eyebrow className="mb-4">Style code</Eyebrow>
                <p className="text-xl md:text-2xl text-brand-dark tracking-tight">{styleCode.words.join(' · ')}</p>
                <p className="mt-3 text-sm md:text-base text-brand-dark/70 leading-relaxed max-w-2xl">{styleCode.summary}</p>
              </div>
              <div className="flex gap-2">
                {styleCode.palette.map((s) => (
                  <span key={s.hex} title={s.name} className="w-10 h-10 rounded-full border border-brand-dark/10" style={{ backgroundColor: s.hex }} />
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  )
}
