import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Container, Eyebrow, ThinkingDots, cx } from '../components/ui/primitives'
import { testQuestions } from '../data/testQuestions'
import type { ArchetypeId } from '../data/types'
import { scoreTest } from '../lib/archetypeEngine'
import { useSession } from '../lib/session'

export default function Test() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<(ArchetypeId | null)[]>(() => testQuestions.map(() => null))
  const [thinking, setThinking] = useState(false)
  const navigate = useNavigate()
  const { setResult } = useSession()

  const question = testQuestions[step]
  const total = testQuestions.length
  const chosen = answers[step]

  const choose = (id: ArchetypeId) => {
    setAnswers((prev) => prev.map((a, i) => (i === step ? id : a)))
  }

  const next = async () => {
    if (!chosen) return
    if (step < total - 1) {
      setStep(step + 1)
      return
    }
    setThinking(true)
    const result = await scoreTest(answers.filter((a): a is ArchetypeId => a !== null))
    setResult(result)
    navigate('/result')
  }

  return (
    <section className="min-h-screen pt-28 md:pt-40 pb-24 bg-brand-cream">
      <Container className="max-w-3xl">
        <div className="flex items-center justify-between gap-6 animate-fade-up stagger-1">
          <Eyebrow>Archetype test</Eyebrow>
          <p className="text-xs text-brand-dark/50 tabular-nums">
            {step + 1} / {total}
          </p>
        </div>
        <div className="mt-4 h-px w-full bg-brand-dark/10 overflow-hidden animate-fade-up stagger-2" aria-hidden>
          <div className="h-full bg-brand-green transition-all duration-500 ease-out" style={{ width: `${((step + 1) / total) * 100}%` }} />
        </div>

        <div key={question.id} className="mt-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl text-brand-dark leading-[1.08] tracking-tight animate-fade-up stagger-2">{question.prompt}</h1>
          <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label={question.prompt}>
            {question.options.map((opt, i) => {
              const selected = chosen === opt.archetype
              return (
                <li key={opt.label} className={`animate-fade-up stagger-${Math.min(6, i + 1)}`}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => choose(opt.archetype)}
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
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || thinking}>
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
            Back
          </Button>
          {thinking ? (
            <ThinkingDots label="Reading your answers" />
          ) : (
            <Button onClick={next} disabled={!chosen}>
              {step === total - 1 ? 'Reveal my archetype' : 'Next'}
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Button>
          )}
        </div>
      </Container>
    </section>
  )
}
