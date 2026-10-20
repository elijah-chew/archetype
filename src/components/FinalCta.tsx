import { ArrowRight } from 'lucide-react'
import { FIND_HASH } from './Navbar'
import { ButtonLink, Container, Reveal } from './ui/primitives'

export default function FinalCta() {
  return (
    <section className="py-24 md:py-36 bg-brand-cream" aria-labelledby="final-cta-heading">
      <Container className="flex flex-col items-start">
        <Reveal stagger={1}>
          <h2 id="final-cta-heading" className="text-4xl sm:text-5xl md:text-6xl text-brand-dark leading-[1.05] tracking-tight max-w-3xl">
            Your archetype is waiting.
          </h2>
        </Reveal>
        <Reveal stagger={2}>
          <p className="mt-5 text-base md:text-lg text-brand-dark/70">Start with one sentence about yourself.</p>
        </Reveal>
        <Reveal stagger={3} className="mt-8">
          <ButtonLink to={{ pathname: '/', hash: FIND_HASH }} size="lg">
            Find your archetype
            <ArrowRight className="w-4 h-4" aria-hidden />
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  )
}
