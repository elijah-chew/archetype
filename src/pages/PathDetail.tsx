import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button, ButtonLink, CharacterImage, Container, Eyebrow, Facet, Pill, Reveal } from '../components/ui/primitives'
import { getArchetype } from '../data/archetypes'
import { getPath } from '../data/paths'
import { getPerson } from '../data/people'
import { useSession } from '../lib/session'

export default function PathDetail() {
  const { id } = useParams()
  const path = id ? getPath(id) : undefined
  const navigate = useNavigate()
  const { setModeledOn } = useSession()
  if (!path) return <Navigate to="/paths" replace />

  const archetype = getArchetype(path.archetype)
  const people = path.people.map(getPerson).filter((p): p is NonNullable<typeof p> => Boolean(p))

  const planMyVersion = () => {
    setModeledOn(people[0]?.slug ?? null)
    navigate('/plan')
  }

  return (
    <>
      <section className="pt-28 md:pt-40 pb-16 md:pb-24 bg-brand-cream">
        <Container>
          <Link to="/paths" className="inline-flex items-center gap-1.5 text-sm text-brand-dark/70 hover:text-brand-dark animate-fade-up stagger-1">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
            All paths
          </Link>
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-12 items-start">
            <div className="flex flex-col items-start">
              <Link to={`/archetypes/${archetype.id}`} className="animate-fade-up stagger-2">
                <Pill size="md">{archetype.name}</Pill>
              </Link>
              <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl text-brand-dark leading-[1.02] tracking-tight animate-fade-up stagger-3">{path.name}</h1>
              <p className="mt-5 text-xl md:text-2xl text-brand-dark/85 leading-snug max-w-xl animate-fade-up stagger-4">“{path.identityStatement}”</p>
              <p className="mt-5 text-base md:text-lg text-brand-dark/65 leading-relaxed max-w-xl animate-fade-up stagger-5">{path.whoFor}</p>
              <div className="mt-8 flex flex-wrap gap-3 animate-fade-up stagger-6">
                <Button onClick={planMyVersion}>
                  Plan my version
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </Button>
                <ButtonLink to="/test" variant="secondary">
                  Check my archetype first
                </ButtonLink>
              </div>
            </div>
            <div className="animate-fade-up stagger-4">
              <div className="relative aspect-square rounded-[2rem] border border-brand-dark/10 bg-white/70 overflow-hidden max-w-md mx-auto lg:ml-auto">
                <CharacterImage src={archetype.character} alt={`${archetype.name} character`} className="absolute inset-[6%] w-[88%] h-[88%]" loading="eager" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-brand-light">
        <Container className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <Reveal stagger={1}>
            <Facet label="Skills needed" items={path.skills} />
          </Reveal>
          <Reveal stagger={2}>
            <Facet label="First projects" items={path.firstProjects} />
          </Reveal>
          <Reveal stagger={3}>
            <Facet label="Style direction" items={path.styleDirection} />
          </Reveal>
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-brand-cream">
        <Container>
          <Reveal stagger={1}>
            <Eyebrow className="mb-6">People who followed a similar path</Eyebrow>
          </Reveal>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {people.map((p, i) => (
              <Reveal key={p.slug} as="li" stagger={((i % 3) + 1) as 1 | 2 | 3}>
                <Link to={`/people/${p.slug}`} className="group flex items-center gap-4 rounded-3xl border border-brand-dark/10 bg-white/60 p-4 hover:bg-white/90 transition-colors">
                  <span aria-hidden className="w-14 h-14 rounded-2xl flex items-center justify-center text-brand-cream text-base tracking-wide shrink-0" style={{ backgroundColor: p.tone }}>
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
        </Container>
      </section>
    </>
  )
}
