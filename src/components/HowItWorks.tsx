import { Container, Reveal, SectionHeading } from './ui/primitives'

const steps = [
  {
    number: '01',
    title: 'Find your archetype',
    body: 'Describe yourself or take a short test. AI identifies the identity pattern that fits you.',
  },
  {
    number: '02',
    title: 'Choose your future self',
    body: 'Explore realistic versions of your future: founder, creator, athlete, designer, researcher, and more.',
  },
  {
    number: '03',
    title: 'Get your path',
    body: 'Turn inspiration into a 30, 90, and 365-day roadmap with skills, projects, and milestones.',
  },
  {
    number: '04',
    title: 'Build your style code',
    body: 'Translate your archetype into a visual identity: palette, outfit formula, photo direction, and presence.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-brand-light" aria-labelledby="how-heading">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title={<span id="how-heading">Not a copy. Your version.</span>}
          subtitle="We don’t turn you into someone else. We extract the patterns behind their identity, then help you build the version that fits your life."
        />
        <ol className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 md:gap-y-16">
          {steps.map((step, i) => (
            <Reveal key={step.number} as="li" stagger={(i + 1) as 1 | 2 | 3 | 4} className="flex gap-6 border-t border-brand-dark/15 pt-6">
              <span className="text-sm text-brand-dark/45 tabular-nums pt-1 shrink-0">{step.number}</span>
              <div>
                <h3 className="text-xl md:text-2xl text-brand-dark tracking-tight">{step.title}</h3>
                <p className="mt-3 text-sm md:text-base text-brand-dark/70 leading-relaxed max-w-md">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  )
}
