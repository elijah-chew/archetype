import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getArchetype } from '../data/archetypes'
import type { ArchetypeId, ArchetypeResult } from '../data/types'
import { analyzeDescription } from '../lib/archetypeEngine'
import { useSession } from '../lib/session'
import HeroStage from './HeroStage'
import { FIND_HASH } from './Navbar'
import { Button, CharacterImage, ThinkingDots, cx } from './ui/primitives'

const HERO_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260820_010308_b1636845-4c15-4ab6-b0c9-9a29bfb0c6e3.mp4'

const PLACEHOLDER = 'I’m a student founder who likes AI, design, and building things people use.'

type Phase = 'idle' | 'thinking' | 'revealed'

export default function Hero() {
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [preview, setPreview] = useState<ArchetypeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const { setResult } = useSession()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.hash === FIND_HASH) {
      inputRef.current?.focus({ preventScroll: false })
      inputRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [location.hash, location.key])

  const submit = async (e?: FormEvent) => {
    e?.preventDefault()
    const value = text.trim() || PLACEHOLDER
    if (value.length < 8) {
      setError('Give us a sentence or two to work with.')
      return
    }
    setError(null)
    setPhase('thinking')
    setPreview(null)
    try {
      const result = await analyzeDescription(value)
      setPreview(result)
      setResult(result)
      setPhase('revealed')
    } catch {
      setError('Something went wrong reading that. Try again.')
      setPhase('idle')
    }
  }

  const pinned: ArchetypeId | null = preview?.primary ?? null

  return (
    <section id="find" className="relative w-full min-h-[max(100vh,700px)] overflow-hidden bg-brand-cream">
      <div className="absolute inset-0" aria-hidden>
        <video
          src={HERO_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover object-bottom"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto pt-28 md:pt-36 pb-16 md:pb-24 px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-12 lg:gap-8 xl:gap-10 items-start">
          <div className="flex flex-col items-start text-left">
            <Link
              to="/archetypes"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-green/30 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-colors mb-5 md:mb-6 animate-fade-up stagger-3"
            >
              <span className="text-sm text-brand-dark">Now in early access</span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-dark" aria-hidden />
            </Link>

            <h1 className="text-left text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] text-brand-dark leading-[1.05] tracking-tight max-w-4xl font-helvetica-neue animate-fade-up stagger-4">
              Find your archetype.
              <br className="hidden sm:block" /> We’ll do the rest.
            </h1>

            <p className="mt-6 md:mt-7 text-base md:text-lg text-brand-dark/75 leading-relaxed max-w-xl animate-fade-up stagger-5">
              Every iconic person is built from visible signals—style, choices, values, and path. Explore theirs. Then
              build your own version.
            </p>

            <form
              onSubmit={submit}
              className="w-full max-w-xl mt-8 md:mt-10 animate-fade-up stagger-6"
              aria-label="Describe yourself to reveal your archetype"
            >
              <label htmlFor="hero-description" className="sr-only">
                Describe yourself
              </label>
              <div
                className={cx(
                  'relative rounded-[1.75rem] border bg-white/75 backdrop-blur-md shadow-[0_24px_60px_-36px_rgba(45,58,46,0.45)] transition-colors',
                  'border-brand-green/35 focus-within:border-brand-green focus-within:bg-white/90',
                )}
              >
                <textarea
                  ref={inputRef}
                  id="hero-description"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      void submit()
                    }
                  }}
                  rows={3}
                  disabled={phase === 'thinking'}
                  placeholder={PLACEHOLDER}
                  className="w-full resize-none bg-transparent px-5 pt-5 pb-16 text-base md:text-lg text-brand-dark placeholder:text-brand-dark/40 focus:outline-none disabled:opacity-60 leading-relaxed"
                />
                <div className="absolute left-5 right-3 bottom-3 flex items-center justify-between gap-3">
                  <div className="min-h-[1.25rem]">
                    {phase === 'thinking' ? (
                      <ThinkingDots label="Reading your signals" />
                    ) : error ? (
                      <p role="alert" className="text-xs text-brand-dark/70">
                        {error}
                      </p>
                    ) : (
                      <p className="hidden sm:block text-xs text-brand-dark/45">Enter to submit · Shift+Enter for a new line</p>
                    )}
                  </div>
                  <Button type="submit" disabled={phase === 'thinking'} className="shrink-0">
                    Reveal my archetype
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                  </Button>
                </div>
              </div>
            </form>

            <Link
              to="/test"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-dark/10 bg-white/60 backdrop-blur-sm px-4 py-2 text-sm text-brand-dark hover:bg-white/85 transition-colors animate-fade-up stagger-6"
            >
              Not sure? Take the 60-second archetype test
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>

            {preview && phase === 'revealed' && (
              <ArchetypePreview result={preview} onContinue={() => navigate('/result')} />
            )}
          </div>

          <div className="w-full animate-fade-up stagger-5 lg:pt-4">
            <HeroStage pinned={pinned} />
          </div>
        </div>
      </div>
    </section>
  )
}

function ArchetypePreview({ result, onContinue }: { result: ArchetypeResult; onContinue: () => void }) {
  const primary = getArchetype(result.primary)
  const secondary = getArchetype(result.secondary)
  return (
    <div
      className="mt-8 w-full max-w-xl rounded-[1.75rem] border border-brand-green/30 bg-white/80 backdrop-blur-md p-5 sm:p-6 animate-fade-up"
      role="region"
      aria-label="Your archetype preview"
    >
      <div className="flex items-start gap-5">
        <div className="hidden sm:block w-20 h-20 shrink-0 rounded-2xl bg-brand-light overflow-hidden">
          <CharacterImage src={primary.character} alt="" className="w-full h-full" loading="eager" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs tracking-[0.25em] uppercase text-brand-dark/50 animate-fade-up stagger-1">You read as</p>
          <p className="mt-1 text-2xl text-brand-dark tracking-tight animate-fade-up stagger-2">{primary.name}</p>
          <p className="mt-1 text-sm text-brand-dark/70 animate-fade-up stagger-3">
            {primary.identity} With {secondary.name.replace('The ', 'a ').toLowerCase()} edge.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 animate-fade-up stagger-4">
            {result.brandWords.map((w) => (
              <span
                key={w}
                className="inline-flex items-center rounded-full border border-brand-green/30 bg-white/70 px-3 py-1 text-xs text-brand-dark"
              >
                {w}
              </span>
            ))}
          </div>
          <div className="mt-4 animate-fade-up stagger-5">
            <Button onClick={onContinue} size="sm">
              See my full result
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
