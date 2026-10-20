import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ArchetypeResult, FutureSelf, GeneratedPlan } from '../data/types'

interface SessionState {
  result: ArchetypeResult | null
  futureSelf: FutureSelf | null
  plan: GeneratedPlan | null
  /** Person slug the user chose "Plan my version" from, if any. */
  modeledOn: string | null
  completedPresence: string[]
}

interface SessionValue extends SessionState {
  setResult: (result: ArchetypeResult | null) => void
  setFutureSelf: (self: FutureSelf | null) => void
  setPlan: (plan: GeneratedPlan | null) => void
  setModeledOn: (slug: string | null) => void
  togglePresenceComplete: (id: string) => void
  reset: () => void
}

const STORAGE_KEY = 'archetype-ai.session.v1'

const emptyState: SessionState = {
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
    return { ...emptyState, ...(JSON.parse(raw) as Partial<SessionState>) }
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
  const reset = useCallback(() => setState(emptyState), [])

  const value = useMemo<SessionValue>(
    () => ({ ...state, setResult, setFutureSelf, setPlan, setModeledOn, togglePresenceComplete, reset }),
    [state, setResult, setFutureSelf, setPlan, setModeledOn, togglePresenceComplete, reset],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}
