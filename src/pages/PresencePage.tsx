import { ArrowRight } from 'lucide-react'
import PresenceCoach from '../components/PresenceCoach'
import { ButtonLink, Container, Eyebrow, Pill } from '../components/ui/primitives'
import { useSession } from '../lib/session'

export default function PresencePage() {
  const { plan, result } = useSession()

  if (!plan) {
    return (
      <section className="min-h-screen pt-28 md:pt-40 pb-24 bg-brand-cream">
        <Container className="flex flex-col items-start max-w-3xl">
          <Eyebrow className="mb-5">Presence</Eyebrow>
          <h1 className="text-4xl md:text-5xl text-brand-dark tracking-tight leading-[1.05]">Show up where you already exist.</h1>
          <p className="mt-4 text-base md:text-lg text-brand-dark/70 max-w-xl">
            Bios, headlines, profile copy, content ideas, and photo direction, written for the future self you choose. Build your plan first and they appear here.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to={result ? '/plan' : '/'}>
              {result ? 'Build my plan' : 'Find my archetype'}
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </ButtonLink>
          </div>
        </Container>
      </section>
    )
  }

  return (
    <>
      <section className="pt-28 md:pt-40 pb-12 bg-brand-cream">
        <Container className="flex flex-col items-start">
          <Eyebrow className="mb-5 animate-fade-up stagger-1">Presence</Eyebrow>
          <h1 className="text-4xl sm:text-5xl md:text-6xl text-brand-dark leading-[1.05] tracking-tight max-w-3xl animate-fade-up stagger-2">Show up where you already exist.</h1>
          <p className="mt-4 text-base md:text-lg text-brand-dark/70 max-w-xl animate-fade-up stagger-3">Copy each item into the profile it belongs to, then mark it complete.</p>
          <div className="mt-6 animate-fade-up stagger-4">
            <Pill size="md">{plan.futureSelf.name}</Pill>
          </div>
        </Container>
      </section>
      <section className="py-12 md:py-20 bg-brand-light">
        <Container>
          <PresenceCoach items={plan.presence} />
        </Container>
      </section>
    </>
  )
}
