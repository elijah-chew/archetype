export type OnboardingStepId = 'name' | 'stage' | 'age' | 'goal' | 'description'

interface BaseStep {
  id: OnboardingStepId
  /** Prompt text; `{name}` is replaced with the visitor's first name. */
  prompt: string
  optional?: boolean
}

export interface TextStep extends BaseStep {
  kind: 'text'
  placeholder: string
  maxLength: number
}

export interface ChoiceStep extends BaseStep {
  kind: 'choice'
  choices: string[]
}

export interface LongTextStep extends BaseStep {
  kind: 'longtext'
  placeholder: string
  maxLength: number
}

export type OnboardingStep = TextStep | ChoiceStep | LongTextStep

export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'name',
    kind: 'text',
    prompt: 'What should we call you?',
    placeholder: 'First name',
    maxLength: 40,
  },
  {
    id: 'stage',
    kind: 'choice',
    prompt: 'Nice to meet you, {name}. Where are you right now?',
    choices: [
      'Still in school',
      'University student',
      'Early career',
      'Working professional',
      'Founder or building something',
      'Exploring a change',
    ],
  },
  {
    id: 'age',
    kind: 'choice',
    prompt: 'How old are you?',
    choices: ['Under 16', '16–18', '19–22', '23–27', '28–34', '35+'],
  },
  {
    id: 'goal',
    kind: 'choice',
    prompt: 'What do you want Archetype AI to help with?',
    choices: [
      'Find the kind of person I want to become',
      'Choose a career or path',
      'Build a stronger personal presence',
      'Find my style and identity',
      'Learn from people I admire',
      'Plan my next 1–3 years',
    ],
  },
  {
    id: 'description',
    kind: 'longtext',
    prompt: 'Describe yourself in one sentence.',
    placeholder: 'I’m a student founder who likes AI, design, and building things people use.',
    maxLength: 280,
    optional: true,
  },
]
