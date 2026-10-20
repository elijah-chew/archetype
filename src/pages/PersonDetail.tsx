import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button, ButtonLink, CharacterImage, Container, Eyebrow, Facet, Pill, Reveal } from '../components/ui/primitives'
import { getArchetype } from '../data/archetypes'
import { getPerson } from '../data/people'
import { useSession } from '../lib/session'

export default function PersonDetail() {
  const { slug } = useParams()
  const person = slug ? getPerson(slug) : undefined
  const navigate = useNavigate()
  const { setModeledOn } = useSession()
  if (!person) return <Navigate to="/people" replace />

  const archetype = getArchetype(person.archetype)

  const planMyVersion = () => {
    setModeledOn(person.slug)
    navigate('/plan')
  }

  return (
    <>
      <section className="pt-28 md:pt-40 pb-16 md:pb-24 bg-brand-cream">
        <Container>
          <Link to="/people" className="inline-flex items-center gap-1.5 text-sm text-brand-dark/70 hover:text-brand-dark animate-fade-up stagger-1">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
            People archive
          </Link>
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-12 items-start">
            <div className="animate-fade-up stagger-3">
              <div
                className="relative aspect-[4/5] rounded-[2rem] overflow-hidden flex items-end p-8 max-w-sm"
                style={{ backgroundColor: person.tone }}
                role="img"
                aria-label={`${person.name} portrait placeholder`}
              >
                <span className="text-brand-cream/90 text-6xl md:text-7xl tracking-tight">{person.initials}</span>
                <div className="absolute right-5 top-5 w-20 h-20 rounded-2xl bg-brand-cream/95 overflow-hidden">
                  <CharacterImage src={archetype.character} alt="" className="w-full h-full" loading="eager" />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start">
              <div className="flex flex-wrap items-center gap-2 animate-fade-up stagger-2">
                <Link to={`/archetypes/${archetype.id}`}>
                  <Pill size="md">{archetype.name}</Pill>
                </Link>
                <Pill tone="outline" size="md">
                  {person.association}
                </Pill>
              </div>
              <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl text-brand-dark leading-[1.02] tracking-tight animate-fade-up stagger-3">
                {person.name}
              </h1>
              <div className="mt-8 animate-fade-up stagger-4">
                <Eyebrow className="mb-3">Signature outfit</Eyebrow>
                <p className="text-xl md:text-2xl text-brand-dark/85 leading-snug max-w-xl">{person.signatureOutfit}</p>
              </div>
              <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 max-w-xl animate-fade-up stagger-5">
                {person.outfitBreakdown.map((item) => (
                  <li key={item} className="text-sm text-brand-dark/75 leading-relaxed flex gap-3">
                    <span aria-hidden className="mt-[0.6em] h-1 w-1 rounded-full bg-brand-green/60 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3 animate-fade-up stagger-6">
                <Button onClick={planMyVersion}>
                  Plan my version
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </Button>
                <ButtonLink to={`/archetypes/${archetype.id}`} variant="secondary">
                  About {archetype.name.toLowerCase()}s
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-brand-light">
        <Container className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Reveal stagger={1}>
            <Facet label="Core values" items={person.coreValues} />
          </Reveal>
          <Reveal stagger={2}>
            <Facet label="Strengths" items={person.strengths} />
          </Reveal>
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-brand-cream">
        <Container>
          <Reveal stagger={1}>
            <Eyebrow className="mb-8">How they built it</Eyebrow>
          </Reveal>
          <ol className="relative border-l border-brand-dark/15 ml-2 md:ml-0 space-y-10">
            {person.timeline.map((t, i) => (
              <Reveal key={t.year} as="li" stagger={(Math.min(i, 5) + 1) as 1 | 2 | 3 | 4 | 5 | 6} className="relative pl-8 md:pl-12">
                <span aria-hidden className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-brand-green" />
                <p className="text-xs tracking-[0.2em] text-brand-dark/50 tabular-nums">{t.year}</p>
                <p className="mt-1 text-base md:text-lg text-brand-dark/85 leading-relaxed max-w-2xl">{t.event}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-brand-light">
        <Container className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Reveal stagger={1}>
            <Facet label="Key decisions" items={person.keyDecisions} />
          </Reveal>
          <Reveal stagger={2}>
            <Facet label="Lessons" items={person.lessons} />
          </Reveal>
          <Reveal stagger={3}>
            <Facet label="What to adopt" items={person.adopt} />
          </Reveal>
          <Reveal stagger={4}>
            <Facet label="What not to copy" items={person.dontCopy} />
          </Reveal>
        </Container>
      </section>

      <section className="py-20 md:py-28 bg-brand-cream">
        <Container className="flex flex-col items-start">
          <Reveal stagger={1}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-brand-dark leading-[1.08] tracking-tight max-w-2xl">
              Not {person.name.split(' ')[0]}’s life. Yours, with the pattern.
            </h2>
          </Reveal>
          <Reveal stagger={2}>
            <p className="mt-4 text-base md:text-lg text-brand-dark/70 max-w-xl">
              Tell us where you are and what you want. We’ll translate the path into a plan that fits your constraints.
            </p>
          </Reveal>
          <Reveal stagger={3} className="mt-8">
            <Button size="lg" onClick={planMyVersion}>
              Plan my version
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Button>
          </Reveal>
        </Container>
      </section>
    </>
  )
}
