import type { ReactNode } from 'react'
import { Container, Eyebrow, cx } from './ui/primitives'

interface PageHeaderProps {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  children?: ReactNode
  className?: string
}

/** Standard top-of-page header with clearance for the fixed navbar. */
export default function PageHeader({ eyebrow, title, subtitle, children, className }: PageHeaderProps) {
  return (
    <header className={cx('pt-28 md:pt-40 pb-10 md:pb-14 bg-brand-cream', className)}>
      <Container className="flex flex-col items-start">
        {eyebrow && <Eyebrow className="mb-5 animate-fade-up stagger-2">{eyebrow}</Eyebrow>}
        <h1 className="text-4xl sm:text-5xl md:text-6xl text-brand-dark leading-[1.05] tracking-tight max-w-4xl font-helvetica-neue animate-fade-up stagger-3">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 text-base md:text-lg text-brand-dark/70 leading-relaxed max-w-2xl animate-fade-up stagger-4">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8 w-full animate-fade-up stagger-5">{children}</div>}
      </Container>
    </header>
  )
}
