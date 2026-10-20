import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { useInView } from '../../lib/hooks'

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

/* ---------- Layout ---------- */

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('max-w-7xl mx-auto px-6 lg:px-8', className)}>{children}</div>
}

/* ---------- Reveal on scroll ---------- */

interface RevealProps {
  children: ReactNode
  className?: string
  /** 1–6, maps to .stagger-N delays. */
  stagger?: 1 | 2 | 3 | 4 | 5 | 6
  as?: 'div' | 'section' | 'li' | 'article' | 'header' | 'span'
}

export function Reveal({ children, className, stagger = 1, as = 'div' }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const Tag = as as 'div'
  return (
    <Tag
      ref={ref}
      className={cx(inView ? `animate-fade-up stagger-${stagger}` : 'reveal-pending', className)}
    >
      {children}
    </Tag>
  )
}

/* ---------- Typography ---------- */

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cx('text-xs tracking-[0.25em] uppercase text-brand-dark/50 font-helvetica-neue', className)}>
      {children}
    </p>
  )
}

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({ eyebrow, title, subtitle, align = 'left', className }: SectionHeadingProps) {
  return (
    <div className={cx('flex flex-col', align === 'center' ? 'items-center text-center' : 'items-start text-left', className)}>
      {eyebrow && (
        <Reveal stagger={1}>
          <Eyebrow className="mb-5">{eyebrow}</Eyebrow>
        </Reveal>
      )}
      <Reveal stagger={2}>
        <h2 className="text-3xl sm:text-4xl md:text-5xl text-brand-dark leading-[1.08] tracking-tight max-w-3xl font-helvetica-neue">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal stagger={3}>
          <p className="mt-5 text-base md:text-lg text-brand-dark/70 leading-relaxed max-w-2xl">{subtitle}</p>
        </Reveal>
      )}
    </div>
  )
}

/* ---------- Pills ---------- */

interface PillProps {
  children: ReactNode
  className?: string
  tone?: 'frosted' | 'solid' | 'outline'
  size?: 'sm' | 'md'
}

export function Pill({ children, className, tone = 'frosted', size = 'sm' }: PillProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full whitespace-nowrap font-helvetica-neue',
        size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm',
        tone === 'frosted' && 'border border-brand-green/30 bg-white/70 backdrop-blur-sm text-brand-dark',
        tone === 'solid' && 'bg-brand-dark text-brand-cream',
        tone === 'outline' && 'border border-brand-dark/15 text-brand-dark',
        className,
      )}
    >
      {children}
    </span>
  )
}

/* ---------- Buttons ---------- */

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

function buttonClasses(variant: Variant, size: Size, className?: string) {
  return cx(
    'inline-flex items-center justify-center gap-2 rounded-full tracking-wide transition-colors font-helvetica-neue disabled:opacity-50 disabled:cursor-not-allowed',
    size === 'sm' && 'px-4 py-2 text-sm',
    size === 'md' && 'px-5 py-2.5 text-sm',
    size === 'lg' && 'px-8 py-3.5 text-base md:text-lg',
    variant === 'primary' && 'bg-brand-dark text-brand-cream hover:bg-brand-green',
    variant === 'secondary' && 'border border-brand-dark/20 bg-white/60 backdrop-blur-sm text-brand-dark hover:bg-white/90',
    variant === 'ghost' && 'text-brand-dark hover:opacity-70',
    className,
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...rest },
  ref,
) {
  return <button ref={ref} type={type} className={buttonClasses(variant, size, className)} {...rest} />
})

interface ButtonLinkProps extends Omit<LinkProps, 'className'> {
  variant?: Variant
  size?: Size
  className?: string
}

export function ButtonLink({ variant = 'primary', size = 'md', className, ...rest }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...rest} />
}

interface ExternalButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant
  size?: Size
}

export function ButtonAnchor({ variant = 'primary', size = 'md', className, ...rest }: ExternalButtonProps) {
  return <a className={buttonClasses(variant, size, className)} {...rest} />
}

/* ---------- Surfaces ---------- */

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx('rounded-3xl border border-brand-dark/10 bg-white/60 backdrop-blur-sm', className)}>
      {children}
    </div>
  )
}

/* ---------- Character render ---------- */

interface CharacterImageProps {
  src: string
  alt: string
  className?: string
  loading?: 'eager' | 'lazy'
}

export function CharacterImage({ src, alt, className, loading = 'lazy' }: CharacterImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      draggable={false}
      className={cx('character-img select-none object-contain', className)}
    />
  )
}

/* ---------- Label/value list used across detail pages ---------- */

export function Facet({ label, items, className }: { label: string; items: string[] | string; className?: string }) {
  return (
    <div className={className}>
      <Eyebrow className="mb-3">{label}</Eyebrow>
      {Array.isArray(items) ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="text-sm md:text-base text-brand-dark/80 leading-relaxed flex gap-3">
              <span aria-hidden className="mt-[0.6em] h-1 w-1 rounded-full bg-brand-green/60 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm md:text-base text-brand-dark/80 leading-relaxed">{items}</p>
      )}
    </div>
  )
}

/* ---------- Loading ---------- */

export function ThinkingDots({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 text-sm text-brand-dark/70">
      <span className="flex items-center gap-1" aria-hidden>
        <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-soft-pulse" />
        <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-soft-pulse [animation-delay:200ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-soft-pulse [animation-delay:400ms]" />
      </span>
      {label}
    </div>
  )
}

/* ---------- Brand mark ---------- */

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cx('w-5 h-5 text-brand-dark', className)} fill="currentColor">
      <path d="M12 3 21.5 20h-19L12 3Z" />
      <circle cx="12" cy="15" r="2.4" fill="#faf8f5" />
    </svg>
  )
}
