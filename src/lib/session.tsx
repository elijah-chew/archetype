import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ArchetypeResult, FutureSelf, GeneratedPlan, OnboardingAnswers } from '../data/types'

export const emptyOnboarding: OnboardingAnswers = {
  name: '',
  stage: null,
  age: null,
  goal: null,
  description: '',
  completedAt: null,
}

interface SessionState {
  onboarding: OnboardingAnswers
  result: ArchetypeResult | null
  futureSelf: FutureSelf | null
  plan: GeneratedPlan | null
  /** Person slug the user chose "Plan my version" from, if any. */
  modeledOn: string | null
  completedPresence: string[]
}

interface SessionValue extends SessionState {
  updateOnboarding: (patch: Partial<OnboardingAnswers>) => void
  setResult: (result: ArchetypeResult | null) => void
  setFutureSelf: (self: FutureSelf | null) => void
  setPlan: (plan: GeneratedPlan | null) => void
  setModeledOn: (slug: string | null) => void
  togglePresenceComplete: (id: string) => void
  reset: () => void
}

const STORAGE_KEY = 'archetype-ai.session.v2'

const emptyState: SessionState = {
  onboarding: emptyOnboarding,
  result: null,
  futureSelf: null,
  plan: null,
  modeledOn: null,
  completedPresence: [],
}

function load(): SessionState {
  if (typeof window === 'undefined') return emptyState
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState
    const parsed = JSON.parse(raw) as Partial<SessionState>
    return { ...emptyState, ...parsed, onboarding: { ...emptyOnboarding, ...(parsed.onboarding ?? {}) } }
  } catch {
    return emptyState
  }
}

const SessionContext = createContext<SessionValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(load)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage can be unavailable (private mode, quota); the session still works in memory.
    }
  }, [state])

  const updateOnboarding = useCallback((patch: Partial<OnboardingAnswers>) => {
    setState((s) => ({ ...s, onboarding: { ...s.onboarding, ...patch } }))
  }, [])
  const setResult = useCallback((result: ArchetypeResult | null) => {
    setState((s) => ({ ...s, result, futureSelf: null, plan: null, completedPresence: [] }))
  }, [])
  const setFutureSelf = useCallback((futureSelf: FutureSelf | null) => {
    setState((s) => ({ ...s, futureSelf, plan: null }))
  }, [])
  const setPlan = useCallback((plan: GeneratedPlan | null) => {
    setState((s) => ({ ...s, plan, completedPresence: [] }))
  }, [])
  const setModeledOn = useCallback((modeledOn: string | null) => {
    setState((s) => ({ ...s, modeledOn }))
  }, [])
  const togglePresenceComplete = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      completedPresence: s.completedPresence.includes(id)
        ? s.completedPresence.filter((x) => x !== id)
        : [...s.completedPresence, id],
    }))
  }, [])
  // Reset clears the result chain but keeps the visitor's name and onboarding answers.
  const reset = useCallback(() => setState((s) => ({ ...emptyState, onboarding: s.onboarding })), [])

  const value = useMemo<SessionValue>(
    () => ({ ...state, updateOnboarding, setResult, setFutureSelf, setPlan, setModeledOn, togglePresenceComplete, reset }),
    [state, updateOnboarding, setResult, setFutureSelf, setPlan, setModeledOn, togglePresenceComplete, reset],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}
