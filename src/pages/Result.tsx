import { ArrowRight, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FutureSelfSelector from '../components/FutureSelfSelector'
import { FIND_HASH } from '../components/Navbar'
import { Button, ButtonLink, CharacterImage, CharacterStage, Container, Eyebrow, Pill, Reveal, cx } from '../components/ui/primitives'
import { getArchetype } from '../data/archetypes'
import { getPerson } from '../data/people'
import { usePrefersReducedMotion } from '../lib/hooks'
import { useSession } from '../lib/session'

export default function Result() {
  const { result, futureSelf, setFutureSelf, reset, onboarding } = useSession()
  const firstName = onboarding.name.trim()
  const navigate = useNavigate()
  const reducedMotion = usePrefersReducedMotion()
  const [revealed, setRevealed] = useState(reducedMotion)

  useEffect(() => {
    if (revealed) return
    const t = window.setTimeout(() => setRevealed(true), reducedMotion ? 0 : 900)
    return () => window.clearTimeout(t)
  }, [revealed, reducedMotion])

  if (!result) {
    return (
      <section className="min-h-screen pt-28 md:pt-40 pb-24 bg-brand-cream">
        <Container className="flex flex-col items-start max-w-3xl">
          <Eyebrow className="mb-5">Your result</Eyebrow>
          <h1 className="text-4xl md:text-5xl text-brand-dark tracking-tight leading-[1.05]">Nothing to reveal yet.</h1>
          <p className="mt-4 text-base md:text-lg text-brand-dark/70 max-w-xl">Describe yourself in one sentence or take the sixty-second test, and we’ll read your archetype.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to={{ pathname: '/', hash: FIND_HASH }}>
              Describe myself
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </ButtonLink>
            <ButtonLink to="/test" variant="secondary">
              Take the test
            </ButtonLink>
          </div>
        </Container>
      </section>
    )
  }

  const primary = getArchetype(result.primary)
  const secondary = getArchetype(result.secondary)
  const people = result.peopleToStudy.map(getPerson).filter((p): p is NonNullable<typeof p> => Boolean(p))

  return (
    <>
      <section className="relative pt-28 md:pt-40 pb-16 md:pb-24 bg-brand-cream overflow-hidden">
        <Container>
          {!revealed ? (
            <div className="min-h-[50vh] flex flex-col items-start justify-center" role="status" aria-live="polite">
              <Eyebrow className="animate-fade-up stagger-1">Reading your signals</Eyebrow>
              <p className="mt-4 text-3xl md:text-5xl text-brand-dark tracking-tight leading-[1.05] animate-fade-up stagger-2">Finding the pattern…</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-12 items-start">
              <div className="flex flex-col items-start">
                <Eyebrow className="mb-5 animate-fade-up stagger-1">{firstName ? `${firstName}, your archetype` : 'Your archetype'}</Eyebrow>
                <h1 className="text-5xl md:text-6xl lg:text-7xl text-brand-dark leading-[1.02] tracking-tight animate-fade-up stagger-2">{primary.name}</h1>
                <p className="mt-5 text-xl md:text-2xl text-brand-dark/85 leading-snug max-w-xl animate-fade-up stagger-3">{result.identityStatement}</p>
                <div className="mt-6 flex flex-wrap items-center gap-2 animate-fade-up stagger-4">
                  <span className="text-xs tracking-[0.2em] uppercase text-brand-dark/45 mr-1">Brand words</span>
                  {result.brandWords.map((w) => (
                    <Pill key={w} size="md">
                      {w}
                    </Pill>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-3 animate-fade-up stagger-5">
                  <span className="text-xs tracking-[0.2em] uppercase text-brand-dark/45">Secondary</span>
                  <Link to={`/archetypes/${secondary.id}`} className="inline-flex items-center gap-2 text-brand-dark hover:opacity-70 transition-opacity">
                    <span className="w-8 h-8 rounded-lg bg-brand-light overflow-hidden">
                      <CharacterImage src={secondary.character} alt="" className="w-full h-full" />
                    </span>
                    {secondary.name}
                  </Link>
                </div>

                <ul className="mt-10 w-full max-w-xl grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fade-up stagger-6" aria-label="Traits">
                  {result.traits.map((t, i) => (
                    <li key={t.name} className="rounded-2xl border border-brand-dark/10 bg-white/60 p-4">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm text-brand-dark">{t.name}</span>
                        <span className="text-sm text-brand-dark/70 tabular-nums">{t.percent}%</span>
                      </div>
                      <div className="mt-3 h-1 w-full bg-brand-dark/10 rounded-full overflow-hidden">
                        <div
                          className={cx('h-full bg-brand-green rounded-full', !reducedMotion && 'animate-fill-bar')}
                          style={{ width: `${t.percent}%`, animationDelay: `${600 + i * 120}ms` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex flex-wrap gap-3 animate-fade-up stagger-6">
                  <Button onClick={() => navigate('/plan')}>
                    Unlock my full path
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      reset()
                      navigate({ pathname: '/', hash: FIND_HASH })
                    }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden />
                    Start over
                  </Button>
                </div>
              </div>

              <div className="animate-fade-up stagger-3">
                <CharacterStage
                  src={primary.character}
                  alt={`${primary.name} character`}
                  loading="eager"
                  className="max-w-md mx-auto lg:ml-auto"
                  caption={
                    <div>
                      <p className="text-[11px] tracking-[0.25em] uppercase text-brand-dark/45">Your character</p>
                      <p className="text-base sm:text-lg text-brand-dark tracking-tight">{primary.name}</p>
                    </div>
                  }
                />
              </div>
            </div>
          )}
        </Container>
      </section>

      {revealed && (
        <>
          <section className="py-16 md:py-24 bg-brand-light" aria-labelledby="future-heading">
            <Container>
              <Reveal stagger={1}>
                <Eyebrow className="mb-4">Future self</Eyebrow>
                <h2 id="future-heading" className="text-3xl sm:text-4xl md:text-5xl text-brand-dark tracking-tight leading-[1.08] max-w-2xl">
                  Three versions of where this goes.
                </h2>
                <p className="mt-4 text-base md:text-lg text-brand-dark/70 max-w-xl">Pick the one that fits your life. Your plan, style code, and presence are built around it.</p>
              </Reveal>
              <div className="mt-10">
                <FutureSelfSelector selves={result.futureSelves} selectedId={futureSelf?.id ?? null} onSelect={(s) => setFutureSelf(s)} />
              </div>
              {futureSelf && (
                <div className="mt-8 animate-fade-up">
                  <Button onClick={() => navigate('/plan')}>
                    Plan my version as {futureSelf.name.toLowerCase()}
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                  </Button>
                </div>
              )}
            </Container>
          </section>

          <section className="py-16 md:py-24 bg-brand-cream">
            <Container className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <Reveal stagger={1}>
                <Eyebrow className="mb-4">Style direction</Eyebrow>
                <p className="text-2xl md:text-3xl text-brand-dark tracking-tight">{result.styleCode.words.join(' · ')}</p>
                <p className="mt-3 text-base text-brand-dark/70 leading-relaxed">{result.styleCode.outfitFormula}</p>
                <div className="mt-5 flex gap-2">
                  {result.styleCode.palette.map((s) => (
                    <span key={s.hex} title={s.name} className="w-10 h-10 rounded-full border border-brand-dark/10" style={{ backgroundColor: s.hex }} />
                  ))}
                </div>
                <Link to="/style-code" className="mt-5 inline-flex items-center gap-1.5 text-sm text-brand-dark hover:opacity-70">
                  Full style code
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </Link>
              </Reveal>
              <Reveal stagger={2}>
                <Eyebrow className="mb-4">People to study</Eyebrow>
                <ul className="divide-y divide-brand-dark/10 border-y border-brand-dark/10">
                  {people.map((p) => (
                    <li key={p.slug}>
                      <Link to={`/people/${p.slug}`} className="group flex items-center gap-4 py-4 hover:opacity-80 transition-opacity">
                        <span aria-hidden className="w-10 h-10 rounded-xl flex items-center justify-center text-brand-cream text-sm shrink-0" style={{ backgroundColor: p.tone }}>
                          {p.initials}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-base text-brand-dark">{p.name}</span>
                          <span className="block text-xs text-brand-dark/60 truncate">{getArchetype(p.archetype).name} · {p.association}</span>
                        </span>
                        <ArrowRight className="w-4 h-4 text-brand-dark/40 ml-auto group-hover:translate-x-0.5 transition-transform" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </Container>
          </section>
        </>
      )}
    </>
  )
}
