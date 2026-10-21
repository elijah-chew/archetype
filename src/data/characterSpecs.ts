import type { ArchetypeId, CharacterSpec } from './types'

/** Reference look: navy quarter-zip, charcoal trousers, dark shoes, neat dark hair. */
const defaultSpec: CharacterSpec = {
  skin: '#f2c7a4',
  hair: '#3a2a22',
  hairStyle: 'swept',
  top: '#1e3a66',
  bottom: '#3e434a',
  shoes: '#2a241f',
  accent: '#3d5a3e',
  prop: 'none',
}

/**
 * Per-archetype recipes for the procedural hero figure.
 * Every archetype wears the same quarter-zip silhouette; colour, hair, and a small prop differ.
 */
export const characterSpecs: Partial<Record<ArchetypeId, CharacterSpec>> = {
  builder: {
    skin: '#f2c7a4',
    hair: '#3a2a22',
    hairStyle: 'swept',
    top: '#1e3a66',
    bottom: '#3e434a',
    shoes: '#2a241f',
    accent: '#3d5a3e',
    prop: 'none',
  },
  visionary: {
    skin: '#f3d2b8',
    hair: '#1c1816',
    hairStyle: 'swept',
    top: '#1a1e28',
    bottom: '#2c3138',
    shoes: '#161412',
    accent: '#6b7cff',
    prop: 'none',
  },
  creator: {
    skin: '#e8bc98',
    hair: '#5c3824',
    hairStyle: 'swept',
    top: '#d9cfc0',
    bottom: '#3a3e46',
    shoes: '#2c2622',
    accent: '#e0734f',
    prop: 'beret',
  },
  athlete: {
    skin: '#c48b62',
    hair: '#171311',
    hairStyle: 'buzz',
    top: '#e6e8ee',
    bottom: '#3a3f46',
    shoes: '#2a2724',
    accent: '#1f8a4c',
    prop: 'headband',
  },
  sage: {
    skin: '#efd2bb',
    hair: '#7a736c',
    hairStyle: 'swept',
    top: '#5c6a78',
    bottom: '#3a3e44',
    shoes: '#2e2a26',
    accent: '#c99a3b',
    prop: 'glasses',
  },
  maverick: {
    skin: '#e6bb9a',
    hair: '#121010',
    hairStyle: 'swept',
    top: '#16161a',
    bottom: '#2a2c32',
    shoes: '#121214',
    accent: '#d93b4c',
    prop: 'none',
  },
}

export function getCharacterSpec(id: ArchetypeId): CharacterSpec {
  return characterSpecs[id] ?? defaultSpec
}
