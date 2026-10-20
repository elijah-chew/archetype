import { ArrowRight } from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { Link } from 'react-router-dom'
import { conveyorArchetypeIds, getArchetype } from '../data/archetypes'
import { getPerson } from '../data/people'
import type { Archetype } from '../data/types'
import { usePrefersReducedMotion } from '../lib/hooks'
import { CharacterImage, Container, Pill, SectionHeading } from './ui/primitives'

const SPEED_PX_PER_S = 28

export default function ArchetypeConveyor() {
  const reducedMotion = usePrefersReducedMotion()
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [paused, setPaused] = useState(false)
  const drag = useRef<{ startX: number; startScroll: number; moved: boolean; active: boolean }>({
    startX: 0,
    startScroll: 0,
    moved: false,
    active: false,
  })

  const items = [...conveyorArchetypeIds, ...conveyorArchetypeIds].map((id) => getArchetype(id))

  useEffect(() => {
    if (reducedMotion) return
    const el = trackRef.current
    if (!el) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      if (!paused && !drag.current.active) {
        el.scrollLeft += SPEED_PX_PER_S * dt
        const half = el.scrollWidth / 2
        if (el.scrollLeft >= half) el.scrollLeft -= half
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [paused, reducedMotion])

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return
    const el = trackRef.current
    if (!el) return
    drag.current = { startX: e.clientX, startScroll: el.scrollLeft, moved: false, active: true }
    el.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = trackRef.current
    if (!el || !drag.current.active) return
    const dx = e.clientX - drag.current.startX
    if (Math.abs(dx) > 4) drag.current.moved = true
    el.scrollLeft = drag.current.startScroll - dx
  }
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = trackRef.current
    if (!el || !drag.current.active) return
    drag.current.active = false
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
    const half = el.scrollWidth / 2
    if (el.scrollLeft >= half) el.scrollLeft -= half
    if (el.scrollLeft < 0) el.scrollLeft += half
  }
  const onClickCapture = (e: ReactMouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      drag.current.moved = false
    }
  }

  return (
    <section className="relative py-20 md:py-28 bg-brand-cream overflow-hidden" aria-labelledby="conveyor-heading">
      <Container>
        <SectionHeading
          eyebrow="The archive"
          title={<span id="conveyor-heading">Archetypes, decoded through the people who embody them.</span>}
          subtitle="From Zuckerberg’s relentless focus to Rihanna’s fearless reinvention—study the identity, signature style, and path behind people who became unmistakable."
        />
      </Container>

      <div
        className="mt-12 md:mt-16 edge-fade"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false)
        }}
      >
        <div
          ref={trackRef}
          className="flex gap-5 md:gap-6 overflow-x-auto no-scrollbar px-6 lg:px-8 py-2 cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: 'none', touchAction: 'pan-x pan-y' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
          onClickCapture={onClickCapture}
          aria-label="Archetype cards"
        >
          {items.map((a, i) => (
            <ConveyorCard key={`${a.id}-${i}`} archetype={a} ariaHidden={i >= conveyorArchetypeIds.length} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ConveyorCard({ archetype, ariaHidden }: { archetype: Archetype; ariaHidden: boolean }) {
  const people = archetype.examplePeople
    .map((slug) => getPerson(slug)?.name)
    .filter(Boolean)
    .slice(0, 3)
  return (
    <article
      aria-hidden={ariaHidden || undefined}
      className="w-[280px] sm:w-[320px] shrink-0 rounded-3xl border border-brand-dark/10 bg-white/60 backdrop-blur-sm p-5 flex flex-col"
    >
      <div className="relative aspect-[4/3] rounded-2xl bg-brand-light overflow-hidden">
        <CharacterImage src={archetype.character} alt="" className="absolute inset-0 w-full h-full" />
      </div>
      <h3 className="mt-5 text-xl text-brand-dark tracking-tight">{archetype.name}</h3>
      <p className="mt-1 text-sm text-brand-dark/70">{archetype.identity}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {archetype.pills.map((p) => (
          <Pill key={p}>{p}</Pill>
        ))}
      </div>
      <p className="mt-4 text-xs text-brand-dark/55 leading-relaxed">{people.join(' · ')}</p>
      <Link
        to={`/archetypes/${archetype.id}`}
        tabIndex={ariaHidden ? -1 : 0}
        draggable={false}
        className="mt-auto pt-5 inline-flex items-center gap-1.5 text-sm text-brand-dark hover:opacity-70 transition-opacity"
      >
        Explore archetype
        <ArrowRight className="w-3.5 h-3.5" aria-hidden />
      </Link>
    </article>
  )
}
