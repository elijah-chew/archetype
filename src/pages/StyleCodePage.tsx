import { ArrowRight } from 'lucide-react'
import { FIND_HASH } from '../components/Navbar'
import StyleCodeView from '../components/StyleCodeView'
import { ButtonLink, Container, Eyebrow, Pill } from '../components/ui/primitives'
import { getArchetype } from '../data/archetypes'
import { useSession } from '../lib/session'

export default function StyleCodePage() {
  const { result, plan } = useSession()
  const styleCode = plan?.styleCode ?? result?.styleCode

  if (!styleCode) {
    return (
      <section className="min-h-screen pt-28 md:pt-40 pb-24 bg-brand-cream">
        <Container className="flex flex-col items-start max-w-3xl">
          <Eyebrow className="mb-5">Style code</Eyebrow>
          <h1 className="text-4xl md:text-5xl text-brand-dark tracking-tight leading-[1.05]">Your style code starts with your archetype.</h1>
          <p className="mt-4 text-base md:text-lg text-brand-dark/70 max-w-xl">Three words, a palette, an outfit formula, photo direction, and do/don’t rules, all derived from who you are becoming.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to={{ pathname: '/', hash: FIND_HASH }}>
              Find my archetype
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </ButtonLink>
            <ButtonLink to="/archetypes" variant="secondary">
              Browse archetypes
            </ButtonLink>
          </div>
        </Container>
      </section>
    )
  }

  const archetype = getArchetype(styleCode.archetype)

  return (
    <>
      <section className="pt-28 md:pt-40 pb-12 bg-brand-cream">
        <Container className="flex flex-col items-start">
          <Eyebrow className="mb-5 animate-fade-up stagger-1">Style code</Eyebrow>
          <h1 className="text-4xl sm:text-5xl md:text-6xl text-brand-dark leading-[1.05] tracking-tight max-w-3xl animate-fade-up stagger-2">How your version looks.</h1>
          <div className="mt-6 animate-fade-up stagger-3">
            <Pill size="md">{archetype.name}</Pill>
          </div>
        </Container>
      </section>
      <section className="py-12 md:py-20 bg-brand-light">
        <Container>
          <StyleCodeView styleCode={styleCode} />
        </Container>
      </section>
    </>
  )
}
