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
    : `translate3d(${pointer.x * 6}px, ${pointer.y * 4}px, 0) rotateY(${pointer.x * 5}deg) rotateX(${-pointer.y * 2.5}deg)`
  const pillTransform = reducedMotion ? undefined : `translate3d(${pointer.x * 3}px, ${pointer.y * 2}px, 0)`

  return (
    <div
      ref={stageRef}
      className="relative w-full max-w-[min(100%,17.5rem)] sm:max-w-[19rem] lg:max-w-[21rem] mx-auto lg:mx-0 lg:ml-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false)
      }}
    >
      {/* No panel behind the figure — multiply blends the render’s cream plate into the hero video. */}
      <div className="relative aspect-square" style={{ perspective: '1200px' }}>
        <div
          className="absolute inset-[14%] transition-transform duration-500 ease-out will-change-transform"
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
                blend
                loading={id === heroArchetypeIds[0] ? 'eager' : 'lazy'}
                className={cx(
                  'absolute inset-0 h-full w-full object-contain object-bottom transition-opacity duration-700 ease-out',
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
              <span aria-hidden className="h-px w-4 sm:w-6 bg-brand-green/50 shrink-0" />
              <span className="inline-flex items-center rounded-full border border-brand-green/40 bg-white/85 backdrop-blur-sm px-2.5 py-0.5 text-[10px] sm:text-[11px] text-brand-dark whitespace-nowrap shadow-sm font-helvetica-neue">
                {pill.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.25em] uppercase text-brand-dark/50">Archetype</p>
          <p key={activeId} className="text-base sm:text-lg text-brand-dark tracking-tight animate-fade-up drop-shadow-[0_1px_12px_rgba(250,248,245,0.85)]">
            {active.name}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0" role="tablist" aria-label="Choose archetype">
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
                  'h-1.5 rounded-full transition-all duration-300',
                  selected ? 'w-4 bg-brand-dark' : 'w-1.5 bg-brand-dark/30 hover:bg-brand-dark/50',
                )}
              />
            )
          })}
        </div>
      </div>

      <div className="mt-2 h-px w-full bg-brand-dark/15 overflow-hidden" aria-hidden>
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
