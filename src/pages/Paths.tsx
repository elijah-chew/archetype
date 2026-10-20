import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { CharacterImage, Container, Pill, Reveal } from '../components/ui/primitives'
import { getArchetype } from '../data/archetypes'
import { paths } from '../data/paths'
import { getPerson } from '../data/people'

export default function Paths() {
  return (
    <>
      <PageHeader
        eyebrow="Paths"
        title="Eight directions a future can take."
        subtitle="Each path connects an archetype to a real way of working: who it suits, the skills it demands, the first projects to make, and the people who walked something similar."
      />
      <section className="pb-24 md:pb-32 bg-brand-cream">
        <Container>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paths.map((p, i) => {
              const a = getArchetype(p.archetype)
              const names = p.people.map((s) => getPerson(s)?.name).filter(Boolean)
              return (
                <Reveal key={p.id} as="li" stagger={((i % 2) + 1) as 1 | 2}>
                  <article className="h-full rounded-3xl border border-brand-dark/10 bg-white/60 backdrop-blur-sm p-6 md:p-8 flex flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl md:text-3xl text-brand-dark tracking-tight">{p.name}</h2>
                        <p className="mt-2 text-sm text-brand-dark/65 leading-relaxed">{p.whoFor}</p>
                      </div>
                      <Link to={`/archetypes/${a.id}`} className="shrink-0" aria-label={`${a.name} archetype`}>
                        <span className="block w-16 h-16 rounded-2xl bg-brand-light overflow-hidden">
                          <CharacterImage src={a.character} alt="" className="w-full h-full" />
                        </span>
                      </Link>
                    </div>
                    <p className="mt-6 text-lg md:text-xl text-brand-dark/90 leading-snug">“{p.identityStatement}”</p>
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                      <div>
                        <p className="text-[11px] tracking-[0.2em] uppercase text-brand-dark/45 mb-2">Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {p.skills.slice(0, 4).map((s) => (
                            <Pill key={s} tone="outline">
                              {s}
                            </Pill>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] tracking-[0.2em] uppercase text-brand-dark/45 mb-2">Similar paths</p>
                        <p className="text-brand-dark/80 leading-relaxed">{names.join(', ')}</p>
                      </div>
                    </div>
                    <div className="mt-auto pt-6 flex items-center justify-between gap-4">
                      <Pill>{a.name}</Pill>
                      <Link to={`/paths/${p.id}`} className="inline-flex items-center gap-1.5 text-sm text-brand-dark hover:opacity-70 transition-opacity">
                        Open path
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </ul>
        </Container>
      </section>
    </>
  )
}
