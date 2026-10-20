import type { ArchetypeId, CharacterSpec } from './types'

const defaultSpec: CharacterSpec = {
  skin: '#f2c9a8',
  hair: '#4a2f1d',
  hairStyle: 'short',
  top: '#6e6e74',
  bottom: '#1d1d20',
  shoes: '#f4f4f1',
  accent: '#3d5a3e',
  prop: 'none',
}

/** Per-archetype recipes for the procedural hero figure. Unlisted archetypes use the default. */
export const characterSpecs: Partial<Record<ArchetypeId, CharacterSpec>> = {
  builder: {
    skin: '#f2c9a8',
    hair: '#4a2f1d',
    hairStyle: 'short',
    top: '#6e6e74',
    bottom: '#1d1d20',
    shoes: '#f4f4f1',
    accent: '#3d5a3e',
    prop: 'none',
  },
  visionary: {
    skin: '#f3d2b8',
    hair: '#2a211f',
    hairStyle: 'swept',
    top: '#1b1b1f',
    bottom: '#1b1b1f',
    shoes: '#111114',
    accent: '#6b7cff',
    prop: 'longcoat',
  },
  creator: {
    skin: '#e3b592',
    hair: '#6b3a22',
    hairStyle: 'curly',
    top: '#f1e8dc',
    bottom: '#2f4a7a',
    shoes: '#e3e0d8',
    accent: '#e0734f',
    prop: 'beret',
  },
  athlete: {
    skin: '#b57d5a',
    hair: '#171311',
    hairStyle: 'buzz',
    top: '#f5f3ef',
    bottom: '#23272c',
    shoes: '#f6f6f6',
    accent: '#2bb673',
    prop: 'headband',
  },
  sage: {
    skin: '#efd2bb',
    hair: '#9a948c',
    hairStyle: 'long',
    top: '#6d5a44',
    bottom: '#3d3833',
    shoes: '#3a2f27',
    accent: '#c99a3b',
    prop: 'glasses',
  },
  maverick: {
    skin: '#e6bb9a',
    hair: '#0f0d0d',
    hairStyle: 'swept',
    top: '#17171a',
    bottom: '#26262b',
    shoes: '#0f0f12',
    accent: '#d93b4c',
    prop: 'jacket',
  },
}

export function getCharacterSpec(id: ArchetypeId): CharacterSpec {
  return characterSpecs[id] ?? defaultSpec
}
