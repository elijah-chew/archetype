import { ArrowRight, RotateCcw } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import FutureSelfSelector from '../components/FutureSelfSelector'
import PresenceCoach from '../components/PresenceCoach'
import StyleCodeView from '../components/StyleCodeView'
import { Button, ButtonLink, CharacterImage, Container, Eyebrow, Facet, Pill, Reveal, ThinkingDots, cx } from '../components/ui/primitives'
import { getArchetype } from '../data/archetypes'
import { getPerson } from '../data/people'
import type { FutureSelf, PlanInput } from '../data/types'
import { analyzeDescription, generatePlan } from '../lib/archetypeEngine'
import { useSession } from '../lib/session'

const emptyInput: PlanInput = {
  now: '',
  oneYear: '',
  threeYears: '',
  fiveYears: '',
  hoursPerWeek: 8,
  existingSkills: '',
  constraints: '',
  appealingParts: [],
}

export default function Plan() {
  const { result, futureSelf, plan, modeledOn, setResult, setFutureSelf, setPlan } = useSession()
  const person = modeledOn ? getPerson(modeledOn) : undefined

  if (!result) return <NeedArchetype onResult={(text) => analyzeDescription(text).then(setResult)} personName={person?.name} />

  const primary = getArchetype(result.primary)

  return (
    <>
      <section className="pt-28 md:pt-40 pb-12 md:pb-16 bg-brand-cream">
        <Container className="flex flex-col items-start">
          <Eyebrow className="mb-5 animate-fade-up stagger-1">Plan my version</Eyebrow>
          <h1 className="text-4xl sm:text-5xl md:text-6xl text-brand-dark leading-[1.05] tracking-tight max-w-4xl animate-fade-up stagger-2">
            {plan ? plan.headline : person ? `${person.name.split(' ')[0]}’s pattern. Your life.` : 'Your path, built around your life.'}
          </h1>
          <p className="mt-5 text-base md:text-lg text-brand-dark/70 leading-relaxed max-w-2xl animate-fade-up stagger-3">
            {plan
              ? plan.summary
              : 'Six questions. Then a 30, 90, and 365-day direction with the skills, projects, weekly actions, style code, and presence to match.'}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2 animate-fade-up stagger-4">
            <Link to={`/archetypes/${primary.id}`}>
              <Pill size="md">{primary.name}</Pill>
            </Link>
            {futureSelf && <Pill tone="outline" size="md">{futureSelf.name}</Pill>}
            {person && (
              <Link to={`/people/${person.slug}`}>
                <Pill tone="outline" size="md">
                  Modeled on {person.name}
                </Pill>
              </Link>
            )}
          </div>
        </Container>
      </section>

      {!futureSelf && (
        <section className="py-12 md:py-16 bg-brand-light">
          <Container>
            <Reveal stagger={1}>
              <Eyebrow className="mb-3">Step 1</Eyebrow>
              <h2 className="text-2xl md:text-3xl text-brand-dark tracking-tight">Choose the future self this plan is for.</h2>
            </Reveal>
            <div className="mt-8">
              <FutureSelfSelector selves={result.futureSelves} selectedId={null} onSelect={(s) => setFutureSelf(s)} />
            </div>
          </Container>
        </section>
      )}

      {futureSelf && !plan && <PlannerForm futureSelf={futureSelf} personAdopt={person?.adopt ?? primary.strengths} onGenerate={(input) => generatePlan(input, result, futureSelf, person?.slug).then(setPlan)} />}

      {plan && (
        <>
          <section className="py-16 md:py-24 bg-brand-light" aria-labelledby="roadmap-heading">
            <Container>
              <Reveal stagger={1}>
                <Eyebrow className="mb-3">Roadmap</Eyebrow>
                <h2 id="roadmap-heading" className="text-3xl md:text-4xl text-brand-dark tracking-tight">
                  30, 90, 365.
                </h2>
              </Reveal>
              <ol className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-5">
                {plan.phases.map((phase, i) => (
                  <Reveal key={phase.label} as="li" stagger={(i + 1) as 1 | 2 | 3}>
                    <article className="h-full rounded-3xl border border-brand-dark/10 bg-white/60 p-6">
                      <p className="text-xs tracking-[0.2em] uppercase text-brand-dark/45">{phase.horizon}</p>
                      <h3 className="mt-1 text-3xl text-brand-dark tracking-tight">{phase.label}</h3>
                      <p className="mt-3 text-sm text-brand-dark/75 leading-relaxed">{phase.focus}</p>
                      <ul className="mt-5 space-y-2">
                        {phase.items.map((item) => (
                          <li key={item} className="text-sm text-brand-dark/85 leading-relaxed flex gap-3">
                            <span aria-hidden className="mt-[0.6em] h-1 w-1 rounded-full bg-brand-green/60 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </article>
                  </Reveal>
                ))}
              </ol>
            </Container>
          </section>

          <section className="py-16 md:py-24 bg-brand-cream">
            <Container className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <Reveal stagger={1}>
                <Facet label="Skills to learn" items={plan.skills} />
              </Reveal>
              <Reveal stagger={2}>
                <Facet label="Projects to build" items={plan.projects} />
              </Reveal>
              <Reveal stagger={3}>
                <Facet label="Weekly actions" items={plan.weeklyActions} />
              </Reveal>
            </Container>
          </section>

          <section id="style-code" className="py-16 md:py-24 bg-brand-light" aria-labelledby="style-heading">
            <Container>
              <Reveal stagger={1}>
                <Eyebrow className="mb-3">Style code</Eyebrow>
                <h2 id="style-heading" className="text-3xl md:text-4xl text-brand-dark tracking-tight">
                  How your version looks.
                </h2>
              </Reveal>
              <div className="mt-10">
                <StyleCodeView styleCode={plan.styleCode} />
              </div>
            </Container>
          </section>

          <section id="presence" className="py-16 md:py-24 bg-brand-cream" aria-labelledby="presence-heading">
            <Container>
              <Reveal stagger={1}>
                <Eyebrow className="mb-3">Presence</Eyebrow>
                <h2 id="presence-heading" className="text-3xl md:text-4xl text-brand-dark tracking-tight">
                  Show up where you already exist.
                </h2>
                <p className="mt-3 text-base text-brand-dark/70 max-w-xl">We don’t publish pages for you. We give you the words and direction for the profiles you already have.</p>
              </Reveal>
              <div className="mt-10">
                <PresenceCoach items={plan.presence} />
              </div>
            </Container>
          </section>

          <section className="py-16 md:py-20 bg-brand-light">
            <Container className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={() => setPlan(null)}>
                <RotateCcw className="w-3.5 h-3.5" aria-hidden />
                Adjust my answers
              </Button>
              <Button variant="ghost" onClick={() => setFutureSelf(null)}>
                Choose a different future self
              </Button>
            </Container>
          </section>
        </>
      )}
    </>
  )
}

function PlannerForm({
  futureSelf,
  personAdopt,
  onGenerate,
}: {
  futureSelf: FutureSelf
  personAdopt: string[]
  onGenerate: (input: PlanInput) => Promise<void>
}) {
  const [input, setInput] = useState<PlanInput>(emptyInput)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = <K extends keyof PlanInput>(key: K, value: PlanInput[K]) => setInput((i) => ({ ...i, [key]: value }))

  const toggleAppeal = (part: string) =>
    update('appealingParts', input.appealingParts.includes(part) ? input.appealingParts.filter((p) => p !== part) : [...input.appealingParts, part])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.now.trim()) {
      setError('Tell us where you are now, even roughly.')
      return
    }
    setError(null)
    setBusy(true)
    try {
      await onGenerate(input)
    } catch {
      setError('We couldn’t build the plan. Try again.')
      setBusy(false)
    }
  }

  const fieldClass =
    'w-full rounded-2xl border border-brand-green/35 bg-white/70 backdrop-blur-sm px-4 py-3 text-base text-brand-dark placeholder:text-brand-dark/40 focus:outline-none focus:border-brand-green'

  return (
    <section className="py-12 md:py-16 bg-brand-light">
      <Container className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-12 items-start">
        <div className="lg:sticky lg:top-28">
          <Reveal stagger={1}>
            <Eyebrow className="mb-3">Planning for</Eyebrow>
            <div className="rounded-3xl border border-brand-dark/10 bg-white/60 p-6 flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-brand-light overflow-hidden shrink-0">
                <CharacterImage src={getArchetype(futureSelf.archetype).character} alt="" className="w-full h-full" />
              </div>
              <div>
                <p className="text-2xl text-brand-dark tracking-tight">{futureSelf.name}</p>
                <p className="mt-1 text-sm text-brand-dark/70">{futureSelf.identity}</p>
              </div>
            </div>
          </Reveal>
        </div>

        <form onSubmit={submit} className="space-y-8" aria-label="Plan questions">
          <Reveal stagger={1}>
            <Field label="Where are you now?" hint="Role, stage, situation. One or two sentences.">
              <textarea value={input.now} onChange={(e) => update('now', e.target.value)} rows={2} className={cx(fieldClass, 'resize-none')} placeholder="Second-year student, building side projects, no shipped product yet." />
            </Field>
          </Reveal>

          <Reveal stagger={2}>
            <fieldset>
              <legend className="text-base text-brand-dark mb-1">What do you want in 1, 3, and 5 years?</legend>
              <p className="text-xs text-brand-dark/55 mb-3">Rough is fine. We shape the plan around the one-year answer.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input value={input.oneYear} onChange={(e) => update('oneYear', e.target.value)} className={fieldClass} placeholder="1 year" aria-label="In one year" />
                <input value={input.threeYears} onChange={(e) => update('threeYears', e.target.value)} className={fieldClass} placeholder="3 years" aria-label="In three years" />
                <input value={input.fiveYears} onChange={(e) => update('fiveYears', e.target.value)} className={fieldClass} placeholder="5 years" aria-label="In five years" />
              </div>
            </fieldset>
          </Reveal>

          <Reveal stagger={3}>
            <Field label={`How much time can you commit each week? ${input.hoursPerWeek} hours`} hint="This sets the pace of the weekly actions.">
              <input
                type="range"
                min={2}
                max={30}
                step={1}
                value={input.hoursPerWeek}
                onChange={(e) => update('hoursPerWeek', Number(e.target.value))}
                className="w-full accent-brand-green"
                aria-valuetext={`${input.hoursPerWeek} hours per week`}
              />
              <div className="flex justify-between text-xs text-brand-dark/50 mt-1">
                <span>2 hours</span>
                <span>30 hours</span>
              </div>
            </Field>
          </Reveal>

          <Reveal stagger={4}>
            <Field label="What skills do you already have?" hint="Comma-separated. We skip what you already know.">
              <input value={input.existingSkills} onChange={(e) => update('existingSkills', e.target.value)} className={fieldClass} placeholder="Python, writing, basic design" />
            </Field>
          </Reveal>

          <Reveal stagger={5}>
            <Field label="What constraints do you have?" hint="Time, money, location, obligations.">
              <input value={input.constraints} onChange={(e) => update('constraints', e.target.value)} className={fieldClass} placeholder="Full course load, part-time job on weekends" />
            </Field>
          </Reveal>

          <Reveal stagger={6}>
            <fieldset>
              <legend className="text-base text-brand-dark mb-1">Which parts of their path appeal to you?</legend>
              <p className="text-xs text-brand-dark/55 mb-3">Pick any. These become the patterns we fold into your plan.</p>
              <div className="flex flex-wrap gap-2">
                {personAdopt.map((part) => {
                  const on = input.appealingParts.includes(part)
                  return (
                    <button
                      key={part}
                      type="button"
                      onClick={() => toggleAppeal(part)}
                      aria-pressed={on}
                      className={cx(
                        'rounded-full border px-4 py-2 text-sm transition-colors',
                        on ? 'bg-brand-dark text-brand-cream border-brand-dark' : 'border-brand-dark/15 text-brand-dark hover:bg-white/80',
                      )}
                    >
                      {part}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          </Reveal>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            {busy ? (
              <ThinkingDots label="Building your version" />
            ) : (
              <Button type="submit" size="lg">
                Generate my plan
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Button>
            )}
            {error && (
              <p role="alert" className="text-sm text-brand-dark/70">
                {error}
              </p>
            )}
          </div>
        </form>
      </Container>
    </section>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-base text-brand-dark mb-1">{label}</span>
      {hint && <span className="block text-xs text-brand-dark/55 mb-3">{hint}</span>}
      {children}
    </label>
  )
}

function NeedArchetype({ onResult, personName }: { onResult: (text: string) => Promise<void>; personName?: string }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (text.trim().length < 8) return
    setBusy(true)
    await onResult(text.trim())
  }

  return (
    <section className="min-h-screen pt-28 md:pt-40 pb-24 bg-brand-cream">
      <Container className="max-w-3xl flex flex-col items-start">
        <Eyebrow className="mb-5 animate-fade-up stagger-1">Plan my version</Eyebrow>
        <h1 className="text-4xl md:text-5xl text-brand-dark tracking-tight leading-[1.05] animate-fade-up stagger-2">
          {personName ? `Before we adapt ${personName.split(' ')[0]}’s path, tell us about you.` : 'First, one sentence about you.'}
        </h1>
        <p className="mt-4 text-base md:text-lg text-brand-dark/70 max-w-xl animate-fade-up stagger-3">We read your archetype first so the plan fits who you already are.</p>
        <form onSubmit={submit} className="mt-8 w-full animate-fade-up stagger-4">
          <label htmlFor="plan-description" className="sr-only">
            Describe yourself
          </label>
          <div className="rounded-[1.75rem] border border-brand-green/35 bg-white/75 backdrop-blur-md focus-within:border-brand-green p-2">
            <textarea
              id="plan-description"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              disabled={busy}
              placeholder="I’m a student founder who likes AI, design, and building things people use."
              className="w-full resize-none bg-transparent px-4 pt-3 pb-2 text-base md:text-lg text-brand-dark placeholder:text-brand-dark/40 focus:outline-none"
            />
            <div className="flex items-center justify-between gap-3 px-2 pb-1">
              {busy ? <ThinkingDots label="Reading your signals" /> : <span className="text-xs text-brand-dark/45">A sentence or two is enough.</span>}
              <Button type="submit" disabled={busy || text.trim().length < 8}>
                Reveal my archetype
                <ArrowRight className="w-3.5 h-3.5" aria-hidden />
              </Button>
            </div>
          </div>
        </form>
        <div className="mt-6 animate-fade-up stagger-5">
          <ButtonLink to="/test" variant="ghost">
            Or take the 60-second test
            <ArrowRight className="w-3.5 h-3.5" aria-hidden />
          </ButtonLink>
        </div>
      </Container>
    </section>
  )
}
