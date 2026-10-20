import type { TestQuestion } from './types'

export const testQuestions: TestQuestion[] = [
  {
    id: 'weekend',
    prompt: 'A free Saturday. What do you actually do?',
    options: [
      { label: 'Build the side project I keep talking about', archetype: 'builder' },
      { label: 'Read until I understand something new', archetype: 'sage' },
      { label: 'Make something: music, images, words', archetype: 'creator' },
      { label: 'Train, then rest properly', archetype: 'athlete' },
      { label: 'Go somewhere I have never been', archetype: 'explorer' },
      { label: 'Host people at mine', archetype: 'connector' },
    ],
  },
  {
    id: 'compliment',
    prompt: 'Which compliment would land hardest?',
    options: [
      { label: 'You get things done.', archetype: 'operator' },
      { label: 'You see what others miss.', archetype: 'visionary' },
      { label: 'You have incredible taste.', archetype: 'aesthete' },
      { label: 'You make people feel safe.', archetype: 'caregiver' },
      { label: 'You own every room you walk into.', archetype: 'icon' },
      { label: 'You do not care what anyone thinks.', archetype: 'maverick' },
    ],
  },
  {
    id: 'rule',
    prompt: 'Someone says “that is just how it is done.” You…',
    options: [
      { label: 'Ask why, then try the opposite', archetype: 'maverick' },
      { label: 'Look for the system underneath the rule', archetype: 'sage' },
      { label: 'Build a faster version and show them', archetype: 'builder' },
      { label: 'Imagine how it should work in ten years', archetype: 'visionary' },
      { label: 'Document it, then improve it', archetype: 'operator' },
      { label: 'Ask who the rule leaves out', archetype: 'caregiver' },
    ],
  },
  {
    id: 'wardrobe',
    prompt: 'Your ideal wardrobe is…',
    options: [
      { label: 'One silhouette, repeated. Decisions removed.', archetype: 'builder' },
      { label: 'Natural fabrics, soft colors, one fine detail', archetype: 'aesthete' },
      { label: 'Color and play, a signature piece people know', archetype: 'creator' },
      { label: 'Sharp tailoring, controlled, elevated', archetype: 'icon' },
      { label: 'Oversized, high contrast, a rule broken', archetype: 'maverick' },
      { label: 'Utility layers that age well', archetype: 'explorer' },
    ],
  },
  {
    id: 'proud',
    prompt: 'In five years, you would be proudest of…',
    options: [
      { label: 'A company that exists because of me', archetype: 'builder' },
      { label: 'A body of work with my fingerprints on it', archetype: 'creator' },
      { label: 'Mastery of one discipline', archetype: 'athlete' },
      { label: 'A community that shows up for each other', archetype: 'connector' },
      { label: 'A bet nobody understood until it paid off', archetype: 'visionary' },
      { label: 'The people I helped become themselves', archetype: 'caregiver' },
    ],
  },
  {
    id: 'crisis',
    prompt: 'When everything is on fire, you…',
    options: [
      { label: 'Get calm and make a list', archetype: 'operator' },
      { label: 'Zoom out and ask what actually matters', archetype: 'sage' },
      { label: 'Take control of the room', archetype: 'icon' },
      { label: 'Check on everyone first', archetype: 'caregiver' },
      { label: 'Start fixing the first thing I can touch', archetype: 'builder' },
      { label: 'Treat it as the interesting part', archetype: 'explorer' },
    ],
  },
]
