import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Container, Eyebrow, ThinkingDots, cx } from '../components/ui/primitives'
import { onboardingSteps, type OnboardingStep } from '../data/onboarding'
import { testQuestions } from '../data/testQuestions'
import type { ArchetypeId, OnboardingAnswers } from '../data/types'
import { scoreTest } from '../lib/archetypeEngine'
import { usePrefersReducedMotion } from '../lib/hooks'
import { useSession } from '../lib/session'

type Direction = 'forward' | 'back'

const ABOUT_TOTAL = onboardingSteps.length
const TEST_TOTAL = testQuestions.length
const GRAND_TOTAL = ABOUT_TOTAL + TEST_TOTAL

function fillName(prompt: string, name: string) {
  return prompt.replace('{name}', name.trim() || 'there')
}

function valueFor(step: OnboardingStep, answers: OnboardingAnswers): string {
  switch (step.id) {
    case 'name':
      return answers.name
    case 'stage':
      return answers.stage ?? ''
    case 'age':
      return answers.age ?? ''
    case 'goal':
      return answers.goal ?? ''
    case 'description':
      return answers.description
  }
}

export default function Test() {
  const { onboarding, updateOnboarding, setResult } = useSession()
  const reducedMotion = usePrefersReducedMotion()
  const navigate = useNavigate()

  // Global position 0..GRAND_TOTAL-1: the first ABOUT_TOTAL positions are the "about you" steps.
  const [pos, setPos] = useState(() => {
    if (onboarding.completedAt) return ABOUT_TOTAL
    const firstEmpty = onboardingSteps.findIndex((s) => !s.optional && !valueFor(s, onboarding).trim())
    return firstEmpty === -1 ? ABOUT_TOTAL - 1 : firstEmpty
  })
  const [direction, setDirection] = useState<Direction>('forward')
  const [answers, setAnswers] = useState<(ArchetypeId | null)[]>(() => testQuestions.map(() => null))
  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inAbout = pos < ABOUT_TOTAL
  const aboutStep = inAbout ? onboardingSteps[pos] : null
  const testIndex = pos - ABOUT_TOTAL
  const question = inAbout ? null : testQuestions[testIndex]
  const firstName = onboarding.name.trim()

  const go = (next: number, dir: Direction) => {
    setDirection(dir)
    setPos(Math.max(0, Math.min(GRAND_TOTAL - 1, next)))
    setError(null)
  }

  const finish = async () => {
    setThinking(true)
    const result = await scoreTest(
      answers.filter((a): a is ArchetypeId => a !== null),
      onboarding.description,
    )
    setResult(result)
    navigate('/result')
  }

  const stepMotion = reducedMotion ? '' : direction === 'forward' ? 'animate-step-forward' : 'animate-step-back'

  return (
    <section className="min-h-screen pt-28 md:pt-40 pb-24 bg-brand-cream">
      <Container className="max-w-3xl">
        <div className="flex items-center justify-between gap-6 animate-fade-up stagger-1">
          <Eyebrow>
            {inAbout
              ? 'Part 1 · About you'
              : firstName
                ? `Part 2 · ${firstName}’s archetype test`
                : 'Part 2 · Archetype test'}
          </Eyebrow>
          <p className="text-xs text-brand-dark/50 tabular-nums" aria-live="polite">
            {inAbout ? `Question ${pos + 1} of ${ABOUT_TOTAL}` : `Question ${testIndex + 1} of ${TEST_TOTAL}`}
          </p>
        </div>
        <div className="mt-4 h-px w-full bg-brand-dark/10 overflow-hidden animate-fade-up stagger-2" aria-hidden>
          <div
            className="h-full bg-brand-green transition-[width] duration-500 ease-out"
            style={{ width: `${((pos + 1) / GRAND_TOTAL) * 100}%` }}
          />
        </div>

        {pos === 0 && (
          <p className="mt-8 text-sm text-brand-dark/60 animate-fade-up stagger-2">
            Five quick questions about you, then twelve about how you think. About 90 seconds total.
          </p>
        )}
        {pos === ABOUT_TOTAL && (
          <p className="mt-8 text-sm text-brand-dark/60 animate-fade-up stagger-2">
            {firstName ? `Twelve quick questions, ${firstName}. ` : 'Twelve quick questions. '}
            Go with your first instinct; there are no wrong answers.
          </p>
        )}

        {aboutStep ? (
          <AboutStep
            key={aboutStep.id}
            step={aboutStep}
            value={valueFor(aboutStep, onboarding)}
            name={onboarding.name}
            isFirst={pos === 0}
            error={error}
            motion={stepMotion}
            reducedMotion={reducedMotion}
            onChange={(next) => {
              setError(null)
              updateOnboarding({ [aboutStep.id]: next } as Partial<OnboardingAnswers>)
            }}
            onBack={() => go(pos - 1, 'back')}
            onSkip={() => {
              updateOnboarding({ description: '', completedAt: Date.now() })
              go(pos + 1, 'forward')
            }}
            onContinue={() => {
              const value = valueFor(aboutStep, onboarding)
              if (!aboutStep.optional && !value.trim()) {
                setError(aboutStep.kind === 'text' ? 'A first name is enough.' : 'Pick the one that fits best.')
                return
              }
              if (pos === ABOUT_TOTAL - 1) updateOnboarding({ completedAt: Date.now() })
              go(pos + 1, 'forward')
            }}
          />
        ) : question ? (
          <>
            <div key={question.id} className={cx('mt-8', stepMotion)}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl text-brand-dark leading-[1.08] tracking-tight">
                {question.prompt}
              </h1>
              <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label={question.prompt}>
                {question.options.map((opt, i) => {
                  const selected = answers[testIndex] === opt.archetype
                  return (
                    <li key={opt.label} className={reducedMotion ? '' : `animate-fade-up stagger-${Math.min(6, i + 1)}`}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setAnswers((prev) => prev.map((a, i) => (i === testIndex ? opt.archetype : a)))}
                        className={cx(
                          'w-full text-left rounded-2xl border px-5 py-4 text-base transition-colors',
                          selected
                            ? 'border-brand-dark bg-brand-dark text-brand-cream'
                            : 'border-brand-dark/15 bg-white/60 text-brand-dark hover:bg-white/90',
                        )}
                      >
                        {opt.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="mt-10 flex items-center justify-between gap-4">
              <Button variant="ghost" onClick={() => go(pos - 1, 'back')} disabled={thinking}>
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
                Back
              </Button>
              {thinking ? (
                <ThinkingDots label="Reading your answers" />
              ) : (
                <Button
                  onClick={() => (testIndex === TEST_TOTAL - 1 ? void finish() : go(pos + 1, 'forward'))}
                  disabled={!answers[testIndex]}
                >
                  {testIndex === TEST_TOTAL - 1 ? 'Reveal my archetype' : 'Next'}
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </Button>
              )}
            </div>
          </>
        ) : null}
      </Container>
    </section>
  )
}

interface AboutStepProps {
  step: OnboardingStep
  value: string
  name: string
  isFirst: boolean
  error: string | null
  motion: string
  reducedMotion: boolean
  onChange: (next: string) => void
  onBack: () => void
  onSkip: () => void
  onContinue: () => void
}

function AboutStep({
  step,
  value,
  name,
  isFirst,
  error,
  motion,
  reducedMotion,
  onChange,
  onBack,
  onSkip,
  onContinue,
}: AboutStepProps) {
  // One ref serves both the text input and the textarea; only one is mounted per step.
  const fieldRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)
  const headingId = `about-${step.id}`
  const canContinue = step.optional || value.trim().length > 0

  useEffect(() => {
    if (step.kind === 'choice') return
    const t = window.setTimeout(() => fieldRef.current?.focus({ preventScroll: true }), 60)
    return () => window.clearTimeout(t)
  }, [step.kind])

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    onContinue()
  }

  const onChoiceKey = (e: KeyboardEvent<HTMLButtonElement>, index: number, choices: string[]) => {
    const buttons = e.currentTarget.closest('[role="radiogroup"]')?.querySelectorAll<HTMLButtonElement>('button[role="radio"]')
    if (!buttons) return
    let nextIndex: number | null = null
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') nextIndex = (index + 1) % choices.length
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') nextIndex = (index - 1 + choices.length) % choices.length
    if (nextIndex !== null) {
      e.preventDefault()
      buttons[nextIndex]?.focus()
      onChange(choices[nextIndex])
    }
  }

  return (
    <form onSubmit={submit} aria-labelledby={headingId}>
      <div className={cx('mt-8', motion)}>
        <div className="flex items-baseline gap-3">
          <h1 id={headingId} className="text-3xl sm:text-4xl md:text-5xl text-brand-dark leading-[1.08] tracking-tight">
            {fillName(step.prompt, name)}
          </h1>
          {step.optional && <span className="text-xs tracking-wide text-brand-dark/45 shrink-0">Optional</span>}
        </div>

        <div className="mt-10">
          {step.kind === 'text' && (
            <input
              ref={fieldRef}
              type="text"
              value={value}
              maxLength={step.maxLength}
              autoComplete="given-name"
              enterKeyHint="next"
              aria-labelledby={headingId}
              aria-invalid={error ? true : undefined}
              onChange={(e) => onChange(e.target.value)}
              placeholder={step.placeholder}
              className="w-full max-w-xl rounded-2xl border border-brand-green/35 bg-white/70 px-5 py-4 text-lg text-brand-dark placeholder:text-brand-dark/40 focus:outline-none focus:border-brand-green transition-colors"
            />
          )}

          {step.kind === 'longtext' && (
            <textarea
              ref={fieldRef}
              value={value}
              maxLength={step.maxLength}
              rows={3}
              enterKeyHint="done"
              aria-labelledby={headingId}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  onContinue()
                }
              }}
              placeholder={step.placeholder}
              className="w-full resize-none rounded-2xl border border-brand-green/35 bg-white/70 px-5 py-4 text-base sm:text-lg text-brand-dark placeholder:text-brand-dark/40 focus:outline-none focus:border-brand-green transition-colors leading-relaxed"
            />
          )}

          {step.kind === 'choice' && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-labelledby={headingId}>
              {step.choices.map((choice, i) => {
                const selected = value === choice
                return (
                  <li key={choice} className={reducedMotion ? '' : `animate-fade-up stagger-${Math.min(6, i + 1)}`}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      tabIndex={selected || (!value && i === 0) ? 0 : -1}
                      onClick={() => onChange(choice)}
                      onDoubleClick={() => {
                        onChange(choice)
                        onContinue()
                      }}
                      onKeyDown={(e) => onChoiceKey(e, i, step.choices)}
                      className={cx(
                        'w-full text-left rounded-2xl border px-5 py-4 text-base transition-colors',
                        selected
                          ? 'border-brand-dark bg-brand-dark text-brand-cream'
                          : 'border-brand-dark/15 bg-white/60 text-brand-dark hover:bg-white/90',
                      )}
                    >
                      {choice}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" onClick={onBack} disabled={isFirst} className={cx(isFirst && 'invisible')}>
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
            Back
          </Button>
          {error && (
            <p role="alert" className="text-xs text-brand-dark/70">
              {error}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {step.optional && (
            <Button type="button" variant="ghost" onClick={onSkip}>
              Skip
            </Button>
          )}
          <Button type="submit" disabled={!canContinue}>
            {step.optional ? 'Start the test' : 'Continue'}
            <ArrowRight className="w-3.5 h-3.5" aria-hidden />
          </Button>
        </div>
      </div>
    </form>
  )
}
