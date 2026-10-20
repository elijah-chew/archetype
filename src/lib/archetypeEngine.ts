/**
 * Mock AI layer.
 *
 * Every function here is async and returns the same shapes a real model-backed API would,
 * so swapping in a network call later is a one-file change. The heuristics are deliberately
 * simple: keyword signals for free text, vote counting for the test, templates for plans.
 */
import { archetypes, getArchetype } from '../data/archetypes'
import { futureSelvesFor } from '../data/futureSelves'
import { getPath } from '../data/paths'
import { getPerson } from '../data/people'
import { getStyleCode } from '../data/styleCodes'
import type {
  ArchetypeId,
  ArchetypeResult,
  FutureSelf,
  GeneratedPlan,
  PlanInput,
  PlanPhase,
  PresenceItem,
  Trait,
} from '../data/types'

const THINK_MS = 1800

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function hashString(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h >>> 0)
}

/** Six trait dimensions and how strongly each archetype expresses them (0–1). */
const TRAIT_NAMES = ['Drive', 'Originality', 'Discipline', 'Depth', 'Independence', 'Warmth'] as const

const traitWeights: Record<ArchetypeId, number[]> = {
  builder: [0.95, 0.6, 0.75, 0.55, 0.65, 0.4],
  visionary: [0.9, 0.85, 0.5, 0.75, 0.8, 0.35],
  creator: [0.7, 0.95, 0.5, 0.6, 0.75, 0.55],
  athlete: [0.85, 0.35, 0.98, 0.45, 0.5, 0.45],
  sage: [0.5, 0.55, 0.7, 0.98, 0.55, 0.65],
  maverick: [0.75, 0.9, 0.4, 0.5, 0.98, 0.3],
  icon: [0.85, 0.7, 0.8, 0.5, 0.7, 0.4],
  connector: [0.6, 0.5, 0.55, 0.55, 0.35, 0.95],
  aesthete: [0.55, 0.85, 0.7, 0.7, 0.6, 0.5],
  operator: [0.8, 0.3, 0.95, 0.65, 0.4, 0.55],
  explorer: [0.7, 0.7, 0.4, 0.6, 0.85, 0.5],
  caregiver: [0.5, 0.4, 0.65, 0.65, 0.3, 0.98],
}

function rankArchetypes(scores: Record<ArchetypeId, number>, tiebreak: number): ArchetypeId[] {
  return [...archetypes]
    .map((a, i) => ({ id: a.id, score: scores[a.id] + ((tiebreak >> i) & 1) * 0.01 + (archetypes.length - i) * 0.0001 }))
    .sort((a, b) => b.score - a.score)
    .map((s) => s.id)
}

function buildTraits(primary: ArchetypeId, secondary: ArchetypeId, seed: number): Trait[] {
  const p = traitWeights[primary]
  const s = traitWeights[secondary]
  return TRAIT_NAMES.map((name, i) => {
    const mixed = p[i] * 0.65 + s[i] * 0.35
    const jitter = (((seed >> (i * 3)) & 7) - 3.5) / 100
    const percent = Math.round(Math.min(0.98, Math.max(0.32, mixed + jitter)) * 100)
    return { name, percent }
  }).sort((a, b) => b.percent - a.percent)
}

function lowerFirst(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1)
}

function stripPeriod(text: string) {
  return text.replace(/\.$/, '')
}

function buildResult(
  ranked: ArchetypeId[],
  seed: number,
  source: ArchetypeResult['source'],
): ArchetypeResult {
  const primary = ranked[0]
  const secondary = ranked[1]
  const p = getArchetype(primary)
  const s = getArchetype(secondary)
  const styleCode = getStyleCode(primary)

  const peopleToStudy = [...p.examplePeople, ...s.examplePeople]
    .filter((slug, i, arr) => arr.indexOf(slug) === i && getPerson(slug))
    .slice(0, 4)

  return {
    primary,
    secondary,
    identityStatement: `${p.name.replace('The ', 'A ')} with ${lowerFirst(s.name.replace('The ', 'a '))} edge. You ${lowerFirst(
      stripPeriod(p.identity),
    )}, and you ${lowerFirst(stripPeriod(s.identity))}.`,
    brandWords: styleCode.words,
    traits: buildTraits(primary, secondary, seed),
    futureSelves: futureSelvesFor(primary),
    styleCode,
    peopleToStudy,
    source,
  }
}

/** Score a free-text self description against each archetype's signal vocabulary. */
export async function analyzeDescription(text: string): Promise<ArchetypeResult> {
  await wait(THINK_MS)
  const scores = keywordScores(text)
  const seed = hashString(text.trim().toLowerCase())
  const ranked = rankArchetypes(scores, seed)
  return buildResult(ranked, seed, { kind: 'description', text })
}

function keywordScores(text: string): Record<ArchetypeId, number> {
  const normalized = ` ${text.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ')} `
  const scores = Object.fromEntries(archetypes.map((a) => [a.id, 0])) as Record<ArchetypeId, number>
  for (const archetype of archetypes) {
    for (const signal of archetype.signals) {
      const pattern = new RegExp(`\\b${signal.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'g')
      const hits = normalized.match(pattern)?.length ?? 0
      // Multi-word signals are stronger evidence than single words.
      scores[archetype.id] += hits * (signal.includes(' ') ? 2 : 1)
    }
  }
  return scores
}

/**
 * Count archetype votes from the test; first-choice ties resolve toward earlier answers.
 * An optional self-description adds keyword evidence on top of the votes.
 */
export async function scoreTest(answers: ArchetypeId[], description = ''): Promise<ArchetypeResult> {
  await wait(THINK_MS)
  const scores = Object.fromEntries(archetypes.map((a) => [a.id, 0])) as Record<ArchetypeId, number>
  answers.forEach((id, index) => {
    scores[id] += 1 + (answers.length - index) * 0.01
  })
  if (description.trim()) {
    // A keyword hit is worth less than a chosen answer, but enough to break near-ties.
    const kw = keywordScores(description)
    for (const a of archetypes) scores[a.id] += kw[a.id] * 0.5
  }
  const seed = hashString(`${answers.join('|')}::${description.trim().toLowerCase()}`)
  const ranked = rankArchetypes(scores, seed)
  return buildResult(ranked, seed, { kind: 'test', answers })
}

function hoursBand(hours: number) {
  if (hours < 5) return 'light'
  if (hours < 12) return 'steady'
  return 'intense'
}

function buildPresence(result: ArchetypeResult, self: FutureSelf, input: PlanInput): PresenceItem[] {
  const p = getArchetype(result.primary)
  const [w1, w2, w3] = result.brandWords
  const selfName = self.name.replace('The ', '').toLowerCase()
  const identity = lowerFirst(stripPeriod(self.identity))
  const skills = self.skills.slice(0, 3)
  const now = input.now.trim() || 'figuring out the next move'

  return [
    {
      id: 'instagram',
      label: 'Instagram bio',
      content: `${selfName} · ${identity}\n${w1.toLowerCase()} / ${w2.toLowerCase()} / ${w3.toLowerCase()}\ncurrently: ${now}`,
    },
    {
      id: 'tiktok',
      label: 'TikTok bio',
      content: `${identity}. documenting the ${selfName} path, one week at a time.`,
    },
    {
      id: 'linkedin-headline',
      label: 'LinkedIn headline',
      content: `${self.name.replace('The ', '')} · ${skills.join(' · ')} · ${stripPeriod(p.identity)}`,
    },
    {
      id: 'linkedin-about',
      label: 'LinkedIn about',
      content: `I ${identity}.\n\nRight now I’m ${now}. Over the next year I’m building toward ${
        input.oneYear.trim() || 'a body of work I can point to'
      }, with a focus on ${skills.map((s) => s.toLowerCase()).join(', ')}.\n\nThree words people use for how I work: ${w1.toLowerCase()}, ${w2.toLowerCase()}, ${w3.toLowerCase()}. If you’re working on something similar, I’d like to hear about it.`,
    },
    {
      id: 'github',
      label: 'GitHub profile',
      content: `## ${self.name}\n\n${self.identity}\n\n**Building toward:** ${input.oneYear.trim() || 'a project people use weekly'}\n**Current focus:** ${skills.join(', ')}\n**Shipping cadence:** weekly build log every Friday`,
    },
    {
      id: 'resume',
      label: 'Resume summary',
      content: `${self.name.replace('The ', '')} who ${identity}. ${p.strengths[0]} and ${lowerFirst(p.strengths[1])}. Currently ${now}; developing ${skills
        .map((s) => s.toLowerCase())
        .join(', ')} toward ${input.oneYear.trim() || 'a measurable outcome within twelve months'}.`,
    },
    {
      id: 'content-ideas',
      label: 'Content ideas',
      content: [
        `Week one of the ${selfName} path: what I’m starting with and why`,
        `The three ${p.name.replace('The ', '').toLowerCase()} habits I’m stealing, and the one I’m not`,
        `What ${self.firstActions[0].toLowerCase()} actually looked like`,
        `My ${w1.toLowerCase()}, ${w2.toLowerCase()}, ${w3.toLowerCase()} uniform, explained`,
        `Monthly review: what shipped, what slipped`,
      ]
        .map((idea, i) => `${i + 1}. ${idea}`)
        .join('\n'),
    },
    {
      id: 'photo',
      label: 'Profile photo direction',
      content: result.styleCode.photoAesthetic,
    },
  ]
}

function phase(label: string, horizon: string, focus: string, items: string[]): PlanPhase {
  return { label, horizon, focus, items }
}

/** Compose a personalized plan from the chosen future self, its path, and the user's inputs. */
export async function generatePlan(
  input: PlanInput,
  result: ArchetypeResult,
  self: FutureSelf,
  modeledOn?: string,
): Promise<GeneratedPlan> {
  await wait(THINK_MS + 600)
  const path = getPath(self.path)
  const band = hoursBand(input.hoursPerWeek)
  const person = modeledOn ? getPerson(modeledOn) : undefined
  const p = getArchetype(result.primary)

  const weeklyActions =
    band === 'light'
      ? [
          `One ninety-minute deep-work block on ${self.skills[0].toLowerCase()}`,
          'One conversation with someone further down this path',
          'Ten minutes on Sunday: write what moved and what did not',
        ]
      : band === 'steady'
        ? [
            `Three ninety-minute blocks on ${self.skills[0].toLowerCase()} and ${self.skills[1].toLowerCase()}`,
            `One small public output every week (${self.weekInLife[1].toLowerCase()})`,
            'One conversation with someone further down this path',
            'Sunday review: what shipped, what slipped, next week’s one priority',
          ]
        : [
            `Daily two-hour deep-work block, protected before anything else`,
            `Ship something visible every week`,
            `Two conversations a week with practitioners or users`,
            'Train or move daily; the body is part of the plan',
            'Sunday review and a public update',
          ]

  const appealing = input.appealingParts.length
    ? input.appealingParts
    : person
      ? person.adopt
      : p.strengths.slice(0, 2)

  const phases: [PlanPhase, PlanPhase, PlanPhase] = [
    phase('30 days', 'Foundation', `Establish the routine and finish the first visible thing.`, [
      ...self.firstActions,
      `Set up the ${band} weekly rhythm below and protect it`,
      `Adopt one pattern from the people you studied: ${appealing[0].toLowerCase()}`,
    ]),
    phase('90 days', 'Momentum', `Turn the first actions into a track record.`, [
      ...(path?.firstProjects.slice(0, 2) ?? []),
      `Reach a level in ${self.skills[1].toLowerCase()} you could teach to a beginner`,
      `Publish or share what you have built with at least twenty people`,
      input.constraints.trim()
        ? `Design around your constraint: ${input.constraints.trim()}`
        : 'Remove one recurring obstacle from your week',
    ]),
    phase('365 days', 'Direction', input.oneYear.trim() || `Become recognizably ${lowerFirst(self.name)} to the people who matter.`, [
      `Own a complete project end to end: ${path?.firstProjects[2] ?? 'something people rely on'}`,
      `Make ${self.skills[2].toLowerCase()} a real strength`,
      input.threeYears.trim() ? `Lay the groundwork for your three-year goal: ${input.threeYears.trim()}` : 'Decide what the three-year version of this looks like',
      `Adopt the second pattern: ${(appealing[1] ?? appealing[0]).toLowerCase()}`,
    ]),
  ]

  const skills = [...new Set([...self.skills, ...(path?.skills ?? [])])].slice(0, 6)
  const existing = input.existingSkills
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
  const skillsToLearn = skills.filter((s) => !existing.some((e) => s.toLowerCase().includes(e.toLowerCase())))

  const headline = `${self.name}, your version.`
  const summary = `${self.identity} ${input.now.trim() ? `You’re starting from ${lowerFirst(input.now.trim())}.` : ''} ${
    person ? `Modeled loosely on how ${person.name} built it, minus the parts that don’t fit your life.` : ''
  } Over the next year, ${input.hoursPerWeek} hours a week goes into ${skillsToLearn
    .slice(0, 2)
    .map((s) => s.toLowerCase())
    .join(' and ')}, with one visible output every week.`.replace(/\s+/g, ' ')

  return {
    futureSelf: self,
    headline,
    summary,
    phases,
    skills: skillsToLearn.length ? skillsToLearn : skills,
    projects: [...self.firstActions.slice(0, 1), ...(path?.firstProjects ?? [])].slice(0, 4),
    weeklyActions,
    styleCode: result.styleCode,
    presence: buildPresence(result, self, input),
    modeledOn,
  }
}
