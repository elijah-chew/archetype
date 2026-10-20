export type ArchetypeId =
  | 'builder'
  | 'visionary'
  | 'creator'
  | 'athlete'
  | 'sage'
  | 'maverick'
  | 'icon'
  | 'connector'
  | 'aesthete'
  | 'operator'
  | 'explorer'
  | 'caregiver'

/** A pill anchored to a point on the hero character stage (percent coordinates). */
export interface AnchoredPill {
  label: string
  /** Which side of the anchor point the pill sits on. */
  side: 'left' | 'right'
  /** Point on the character the connector dot sits on, percent of stage width/height. */
  tx: number
  ty: number
}

export type CharacterProp =
  | 'none'
  | 'toolbelt'
  | 'longcoat'
  | 'beret'
  | 'headband'
  | 'glasses'
  | 'jacket'

/**
 * Colour and prop recipe for the procedural 3D hero character.
 * All colours are CSS hex strings.
 */
export interface CharacterSpec {
  skin: string
  hair: string
  /** Hair silhouette on the sphere head. */
  hairStyle: 'short' | 'swept' | 'curly' | 'buzz' | 'long' | 'cap'
  top: string
  bottom: string
  shoes: string
  /** Eye ring, rim light and glow colour. */
  accent: string
  prop: CharacterProp
}

export interface Archetype {
  id: ArchetypeId
  name: string
  /** One-line identity, e.g. "Turn ideas into real things." */
  identity: string
  description: string
  coreValues: string[]
  strengths: string[]
  visualLanguage: string[]
  /** Three short pills shown on compact cards. */
  pills: string[]
  /** Slugs from the people archive. */
  examplePeople: string[]
  /** Path ids from the paths database. */
  paths: string[]
  character: string
  /**
   * Optional URL of a sculpted GLB for the 3D hero. When set it replaces the procedural figure.
   * Nodes named `Head`, `Eye_L`, `Eye_R`, `Arm_L`, `Arm_R` get head/eye/arm tracking.
   */
  model?: string
  /** Pills shown around the character in the hero. */
  heroPills: AnchoredPill[]
  /** Keywords used by the mock analyzer to score free-text descriptions. */
  signals: string[]
  /** Short description of how this archetype carries itself. */
  presenceNote: string
}

export interface TimelineEntry {
  year: string
  event: string
}

export interface Person {
  slug: string
  name: string
  archetype: ArchetypeId
  association: string
  signatureOutfit: string
  outfitBreakdown: string[]
  coreValues: string[]
  strengths: string[]
  timeline: TimelineEntry[]
  keyDecisions: string[]
  lessons: string[]
  adopt: string[]
  dontCopy: string[]
  /** Short initials used by the portrait placeholder. */
  initials: string
  /** Portrait placeholder accent, a muted tone from the editorial palette. */
  tone: string
}

export interface Path {
  id: string
  name: string
  archetype: ArchetypeId
  whoFor: string
  identityStatement: string
  skills: string[]
  firstProjects: string[]
  /** Slugs from the people archive. */
  people: string[]
  styleDirection: string
}

export interface FutureSelf {
  id: string
  archetype: ArchetypeId
  name: string
  identity: string
  weekInLife: string[]
  skills: string[]
  firstActions: string[]
  styleDirection: string
  /** Path id this future self maps onto. */
  path: string
}

export interface PaletteSwatch {
  name: string
  hex: string
}

export interface StyleCode {
  archetype: ArchetypeId
  words: [string, string, string]
  summary: string
  palette: PaletteSwatch[]
  typography: string
  photoAesthetic: string
  outfitFormula: string
  brandAssociations: string[]
  signatureItem: string
  dos: string[]
  donts: string[]
}

export interface Trait {
  name: string
  percent: number
}

export interface ArchetypeResult {
  primary: ArchetypeId
  secondary: ArchetypeId
  identityStatement: string
  brandWords: [string, string, string]
  traits: Trait[]
  futureSelves: FutureSelf[]
  styleCode: StyleCode
  /** Slugs from the people archive. */
  peopleToStudy: string[]
  /** The text or test answers that produced this result. */
  source: { kind: 'description'; text: string } | { kind: 'test'; answers: ArchetypeId[] }
}

export interface PlanInput {
  now: string
  oneYear: string
  threeYears: string
  fiveYears: string
  hoursPerWeek: number
  existingSkills: string
  constraints: string
  appealingParts: string[]
}

export interface PlanPhase {
  label: string
  horizon: string
  focus: string
  items: string[]
}

export interface PresenceItem {
  id: string
  label: string
  content: string
}

export interface GeneratedPlan {
  futureSelf: FutureSelf
  headline: string
  summary: string
  phases: [PlanPhase, PlanPhase, PlanPhase]
  skills: string[]
  projects: string[]
  weeklyActions: string[]
  styleCode: StyleCode
  presence: PresenceItem[]
  /** The person whose path informed this plan, when launched from a profile. */
  modeledOn?: string
}

export interface OnboardingAnswers {
  name: string
  stage: string | null
  age: string | null
  goal: string | null
  /** Optional one-sentence self description; empty when skipped. */
  description: string
  completedAt: number | null
}

export interface TestQuestion {
  id: string
  prompt: string
  options: { label: string; archetype: ArchetypeId }[]
}
