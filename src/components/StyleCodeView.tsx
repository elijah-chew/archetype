import { Eyebrow, Facet, Reveal } from './ui/primitives'
import type { StyleCode } from '../data/types'

export default function StyleCodeView({ styleCode }: { styleCode: StyleCode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-10 lg:gap-16">
      <div>
        <Reveal stagger={1}>
          <Eyebrow className="mb-4">Three words</Eyebrow>
          <p className="text-3xl md:text-4xl text-brand-dark tracking-tight leading-tight">{styleCode.words.join(' · ')}</p>
        </Reveal>
        <Reveal stagger={2} className="mt-6">
          <p className="text-base md:text-lg text-brand-dark/75 leading-relaxed">{styleCode.summary}</p>
        </Reveal>
        <Reveal stagger={3} className="mt-8">
          <Eyebrow className="mb-4">Color palette</Eyebrow>
          <ul className="grid grid-cols-4 gap-3">
            {styleCode.palette.map((s) => (
              <li key={s.hex} className="flex flex-col gap-2">
                <span className="aspect-square rounded-2xl border border-brand-dark/10" style={{ backgroundColor: s.hex }} />
                <span className="text-xs text-brand-dark/70">{s.name}</span>
                <span className="text-[11px] text-brand-dark/45 uppercase tabular-nums">{s.hex}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal stagger={4} className="mt-8">
          <Eyebrow className="mb-3">Signature item</Eyebrow>
          <p className="text-lg text-brand-dark">{styleCode.signatureItem}</p>
        </Reveal>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <Reveal stagger={2}>
          <Facet label="Outfit formula" items={styleCode.outfitFormula} />
        </Reveal>
        <Reveal stagger={3}>
          <Facet label="Typography direction" items={styleCode.typography} />
        </Reveal>
        <Reveal stagger={3}>
          <Facet label="Photo aesthetic" items={styleCode.photoAesthetic} />
        </Reveal>
        <Reveal stagger={4}>
          <Facet label="Brand associations" items={styleCode.brandAssociations} />
        </Reveal>
        <Reveal stagger={5}>
          <Facet label="Do" items={styleCode.dos} />
        </Reveal>
        <Reveal stagger={6}>
          <Facet label="Don’t" items={styleCode.donts} />
        </Reveal>
      </div>
    </div>
  )
}
