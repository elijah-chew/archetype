import { Check, Copy } from 'lucide-react'
import type { PresenceItem } from '../data/types'
import { useCopy } from '../lib/hooks'
import { useSession } from '../lib/session'
import { Reveal, cx } from './ui/primitives'

export default function PresenceCoach({ items }: { items: PresenceItem[] }) {
  const { completedPresence, togglePresenceComplete } = useSession()
  const done = items.filter((i) => completedPresence.includes(i.id)).length

  return (
    <div>
      <p className="text-xs text-brand-dark/50 tracking-wide mb-6" aria-live="polite">
        {done} of {items.length} complete
      </p>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {items.map((item, i) => (
          <Reveal key={item.id} as="li" stagger={((i % 2) + 1) as 1 | 2}>
            <PresenceCard item={item} complete={completedPresence.includes(item.id)} onToggle={() => togglePresenceComplete(item.id)} />
          </Reveal>
        ))}
      </ul>
    </div>
  )
}

function PresenceCard({ item, complete, onToggle }: { item: PresenceItem; complete: boolean; onToggle: () => void }) {
  const { copied, copy } = useCopy()
  return (
    <article
      className={cx(
        'h-full rounded-3xl border p-6 flex flex-col transition-colors',
        complete ? 'border-brand-green/40 bg-brand-green/5' : 'border-brand-dark/10 bg-white/60',
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg text-brand-dark tracking-tight">{item.label}</h3>
        {complete && (
          <span className="inline-flex items-center gap-1 text-xs text-brand-green">
            <Check className="w-3.5 h-3.5" aria-hidden />
            Done
          </span>
        )}
      </div>
      <pre className="mt-4 whitespace-pre-wrap font-helvetica-neue text-sm text-brand-dark/80 leading-relaxed flex-1">{item.content}</pre>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void copy(item.content)}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-dark/20 px-4 py-2 text-sm text-brand-dark hover:bg-white/90 transition-colors"
          aria-live="polite"
        >
          {copied ? <Check className="w-3.5 h-3.5" aria-hidden /> : <Copy className="w-3.5 h-3.5" aria-hidden />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={complete}
          className={cx(
            'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-colors',
            complete ? 'bg-brand-green/15 text-brand-dark hover:bg-brand-green/25' : 'bg-brand-dark text-brand-cream hover:bg-brand-green',
          )}
        >
          {complete ? 'Mark incomplete' : 'Mark complete'}
        </button>
      </div>
    </article>
  )
}
