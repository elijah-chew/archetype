import { ArrowRight } from 'lucide-react'
import { ButtonLink, Container, Eyebrow } from '../components/ui/primitives'

export default function NotFound() {
  return (
    <section className="min-h-screen pt-28 md:pt-40 pb-24 bg-brand-cream">
      <Container className="flex flex-col items-start max-w-3xl">
        <Eyebrow className="mb-5">404</Eyebrow>
        <h1 className="text-4xl md:text-5xl text-brand-dark tracking-tight leading-[1.05]">This page isn’t part of anyone’s path.</h1>
        <p className="mt-4 text-base md:text-lg text-brand-dark/70 max-w-xl">The link may be old or mistyped. Start from the archetypes, the people, or the paths.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to="/">
            Back home
            <ArrowRight className="w-3.5 h-3.5" aria-hidden />
          </ButtonLink>
          <ButtonLink to="/archetypes" variant="secondary">
            Archetypes
          </ButtonLink>
        </div>
      </Container>
    </section>
  )
}
