import { useCallback, useEffect, useRef, useState } from 'react'
import { getArchetype, heroArchetypeIds } from '../data/archetypes'
import type { ArchetypeId } from '../data/types'
import { usePrefersReducedMotion } from '../lib/hooks'
import { CharacterImage, cx } from './ui/primitives'

const DWELL_MS = 5000

interface HeroStageProps {
  /** When set, the stage shows this archetype and stops rotating. */
  pinned?: ArchetypeId | null
  onChange?: (id: ArchetypeId) => void
}

export default function HeroStage({ pinned, onChange }: HeroStageProps) {
  const reducedMotion = usePrefersReducedMotion()
  const [index, setIndex] = useState(0)
  const [cycle, setCycle] = useState(0)
  const [paused, setPaused] = useState(false)
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const stageRef = useRef<HTMLDivElement | null>(null)

  const pinnedIndex = pinned ? heroArchetypeIds.indexOf(pinned) : -1
  const rotating = pinnedIndex === -1
  const activeId = rotating ? heroArchetypeIds[index] : pinned!
  const active = getArchetype(activeId)
  const showAll = pinnedIndex === -1 ? heroArchetypeIds : [...new Set([...heroArchetypeIds, pinned!])]

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % heroArchetypeIds.length) + heroArchetypeIds.length) % heroArchetypeIds.length)
      setCycle((c) => c + 1)
    },
    [],
  )

  useEffect(() => {
    onChange?.(activeId)
  }, [activeId, onChange])

  useEffect(() => {
    if (!rotating || paused) return
    const t = window.setTimeout(() => goTo(index + 1), DWELL_MS)
    return () => window.clearTimeout(t)
  }, [index, cycle, paused, rotating, goTo])

  useEffect(() => {
    if (reducedMotion) return
    const onMove = (e: PointerEvent) => {
      const el = stageRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const x = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2)))
      const y = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2)))
      setPointer({ x, y })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reducedMotion])

  const characterTransform = reducedMotion
    ? undefined
    : `translate3d(${pointer.x * 10}px, ${pointer.y * 6}px, 0) rotateY(${pointer.x * 7}deg) rotateX(${-pointer.y * 4}deg)`
  const pillTransform = reducedMotion ? undefined : `translate3d(${pointer.x * 4}px, ${pointer.y * 3}px, 0)`

  return (
    <div
      ref={stageRef}
      className="relative w-full max-w-[520px] mx-auto lg:mx-0 lg:ml-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false)
      }}
    >
      <div
        className="relative aspect-square rounded-[2rem] border border-brand-dark/10 bg-white/70 backdrop-blur-md shadow-[0_30px_80px_-40px_rgba(45,58,46,0.35)]"
        style={{ perspective: '1200px' }}
      >
        <div
          className="absolute inset-[6%] transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: characterTransform, transformStyle: 'preserve-3d' }}
          aria-live="polite"
        >
          {showAll.map((id) => {
            const a = getArchetype(id)
            const isActive = id === activeId
            return (
              <CharacterImage
                key={id}
                src={a.character}
                alt={isActive ? `${a.name} character` : ''}
                loading={id === heroArchetypeIds[0] ? 'eager' : 'lazy'}
                className={cx(
                  'absolute inset-0 w-full h-full transition-opacity duration-700 ease-out',
                  isActive ? 'opacity-100' : 'opacity-0',
                )}
              />
            )
          })}
        </div>

        <div
          key={`${activeId}-${cycle}`}
          className="absolute inset-0 transition-transform duration-700 ease-out pointer-events-none"
          style={{ transform: pillTransform }}
        >
          {active.heroPills.map((pill, i) => (
            <div
              key={pill.label}
              className={cx(
                'absolute flex items-center -translate-y-1/2',
                pill.side === 'left' ? 'flex-row-reverse' : 'flex-row',
                reducedMotion ? '' : `animate-fade-up stagger-${Math.min(6, i + 1)}`,
              )}
              style={
                pill.side === 'left'
                  ? { right: `${100 - pill.tx}%`, top: `${pill.ty}%` }
                  : { left: `${pill.tx}%`, top: `${pill.ty}%` }
              }
            >
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-green shrink-0" />
              <span aria-hidden className="h-px w-5 sm:w-8 md:w-10 bg-brand-green/50 shrink-0" />
              <span className="inline-flex items-center rounded-full border border-brand-green/40 bg-white/85 backdrop-blur-sm px-3 py-1 text-[11px] sm:text-xs text-brand-dark whitespace-nowrap shadow-sm font-helvetica-neue">
                {pill.label}
              </span>
            </div>
          ))}
        </div>

        <div className="absolute left-5 bottom-5 right-5 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] tracking-[0.25em] uppercase text-brand-dark/45">Archetype</p>
            <p key={activeId} className="text-base sm:text-lg text-brand-dark tracking-tight animate-fade-up">
              {active.name}
            </p>
          </div>
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Choose archetype">
            {heroArchetypeIds.map((id, i) => {
              const selected = id === activeId
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-label={getArchetype(id).name}
                  onClick={() => goTo(i)}
                  className={cx(
                    'h-2 rounded-full transition-all duration-300',
                    selected ? 'w-5 bg-brand-dark' : 'w-2 bg-brand-dark/25 hover:bg-brand-dark/50',
                  )}
                />
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 h-px w-full bg-brand-dark/10 overflow-hidden" aria-hidden>
        {rotating && (
          <div
            key={`${index}-${cycle}`}
            className="h-full w-full bg-brand-green/70 animate-grow-x"
            style={{ ['--dwell' as string]: `${DWELL_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
          />
        )}
      </div>
    </div>
  )
}
