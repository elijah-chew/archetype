import { ArrowRight, Check } from 'lucide-react'
import type { FutureSelf } from '../data/types'
import { Button, Eyebrow, Reveal, cx } from './ui/primitives'

interface Props {
  selves: FutureSelf[]
  selectedId: string | null
  onSelect: (self: FutureSelf) => void
}

export default function FutureSelfSelector({ selves, selectedId, onSelect }: Props) {
  return (
    <ul className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {selves.map((self, i) => {
        const selected = self.id === selectedId
        return (
          <Reveal key={self.id} as="li" stagger={(i + 1) as 1 | 2 | 3}>
            <article
              className={cx(
                'h-full rounded-3xl border p-6 flex flex-col transition-colors',
                selected ? 'border-brand-dark bg-white/90' : 'border-brand-dark/10 bg-white/60',
              )}
              aria-current={selected || undefined}
            >
              <h3 className="text-2xl text-brand-dark tracking-tight">{self.name}</h3>
              <p className="mt-1 text-sm text-brand-dark/70">{self.identity}</p>

              <div className="mt-6 space-y-5 text-sm">
                <div>
                  <Eyebrow className="mb-2 text-[11px]">A week in that life</Eyebrow>
                  <ul className="space-y-1.5">
                    {self.weekInLife.map((w) => (
                      <li key={w} className="text-brand-dark/80 leading-relaxed flex gap-3">
                        <span aria-hidden className="mt-[0.6em] h-1 w-1 rounded-full bg-brand-green/60 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Eyebrow className="mb-2 text-[11px]">Skills to build</Eyebrow>
                  <p className="text-brand-dark/80 leading-relaxed">{self.skills.join(' · ')}</p>
                </div>
                <div>
                  <Eyebrow className="mb-2 text-[11px]">First three actions</Eyebrow>
                  <ol className="space-y-1.5">
                    {self.firstActions.map((a, j) => (
                      <li key={a} className="text-brand-dark/80 leading-relaxed flex gap-3">
                        <span className="text-brand-dark/40 tabular-nums shrink-0">0{j + 1}</span>
                        {a}
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <Eyebrow className="mb-2 text-[11px]">Style direction</Eyebrow>
                  <p className="text-brand-dark/80 leading-relaxed">{self.styleDirection}</p>
                </div>
              </div>

              <div className="mt-auto pt-6">
                <Button variant={selected ? 'secondary' : 'primary'} className="w-full" onClick={() => onSelect(self)} aria-pressed={selected}>
                  {selected ? (
                    <>
                      <Check className="w-3.5 h-3.5" aria-hidden />
                      Selected
                    </>
                  ) : (
                    <>
                      Select this future
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                    </>
                  )}
                </Button>
              </div>
            </article>
          </Reveal>
        )
      })}
    </ul>
  )
}
