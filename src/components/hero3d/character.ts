import * as THREE from 'three'
import type { CharacterSpec } from '../../data/types'
import { createEye, type Eye } from './eyes'
import { addRimShell, disposeObject } from './materials'

export interface ArmRig {
  group: THREE.Group
  restX: number
  restY: number
  restRz: number
  phase: number
}

export interface Rig {
  root: THREE.Group
  body: THREE.Group
  head: THREE.Group
  arms: ArmRig[]
  eyes: Eye[]
  /** World-space height of the figure, used to frame the camera. */
  height: number
  dispose: () => void
}

/** Big toy-like head: roughly a third of the figure's height. */
export const HEAD_R = 0.66
const HEAD_Y = 0.9
/** Feet at about -1.45, top of hair at about 1.8. */
export const FIGURE_HEIGHT = 3.25
export const FIGURE_CENTER_Y = 0.17

const IRIS = '#3a2416'

function mesh(geometry: THREE.BufferGeometry, material: THREE.Material) {
  return new THREE.Mesh(geometry, material)
}

/** Position an object on the head sphere surface facing outward. */
function onHead(obj: THREE.Object3D, x: number, y: number, radius = HEAD_R) {
  const z = Math.sqrt(Math.max(radius * radius - x * x - y * y, 0.0001))
  obj.position.set(x, y, z)
  obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), obj.position.clone().normalize())
}

function fabric(color: string, roughness = 0.8) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0,
    roughness,
    clearcoat: 0,
    sheen: 0.35,
    sheenRoughness: 0.8,
    sheenColor: new THREE.Color('#ffffff'),
    envMapIntensity: 0.5,
  })
}

function skin(color: string) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0,
    roughness: 0.62,
    clearcoat: 0.08,
    clearcoatRoughness: 0.6,
    sheen: 0.5,
    sheenRoughness: 0.7,
    sheenColor: new THREE.Color('#ffd7c4'),
    envMapIntensity: 0.55,
  })
}

function hairMat(color: string) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0,
    roughness: 0.5,
    clearcoat: 0.35,
    clearcoatRoughness: 0.35,
    envMapIntensity: 0.7,
  })
}

function shoeMat(color: string) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0,
    roughness: 0.38,
    clearcoat: 0.5,
    clearcoatRoughness: 0.3,
    envMapIntensity: 0.7,
  })
}

interface Tuft {
  p: [number, number, number]
  s: [number, number, number]
  r?: [number, number, number]
}

function addTufts(head: THREE.Group, mat: THREE.Material, tufts: Tuft[], radius = 0.24) {
  const geo = new THREE.SphereGeometry(radius, 32, 24)
  for (const t of tufts) {
    const m = mesh(geo, mat)
    m.position.set(...t.p)
    m.scale.set(...t.s)
    if (t.r) m.rotation.set(...t.r)
    head.add(m)
  }
}

/** A skull cap that stops above the eyebrows, used as the base of every hairstyle. */
function addCap(head: THREE.Group, mat: THREE.Material, thetaFraction: number, extra = 0.05, y = 0.06) {
  const g = new THREE.SphereGeometry(HEAD_R + extra, 64, 40, 0, Math.PI * 2, 0, Math.PI * thetaFraction)
  const m = mesh(g, mat)
  m.position.y = y
  m.scale.set(1.03, 1, 1.02)
  head.add(m)
  return m
}

/** Tousled, volumetric hair built from overlapping ellipsoids (the look of the reference render). */
function buildHair(spec: CharacterSpec, mat: THREE.Material, head: THREE.Group) {
  const side: Tuft[] = [
    { p: [-0.62, 0.14, 0.02], s: [0.5, 0.95, 0.85] },
    { p: [0.62, 0.14, 0.02], s: [0.5, 0.95, 0.85] },
  ]
  // Fringe lies low over the forehead; crown tufts stay flat so the silhouette is tousled, not tall.
  const tousled: Tuft[] = [
    { p: [0.0, 0.36, 0.5], s: [1.3, 0.55, 0.75], r: [0.6, 0, 0.08] },
    { p: [-0.3, 0.38, 0.44], s: [1.0, 0.55, 0.8], r: [0.55, 0.25, -0.35] },
    { p: [0.32, 0.36, 0.44], s: [1.0, 0.55, 0.8], r: [0.55, -0.25, 0.4] },
    { p: [0.14, 0.54, 0.26], s: [1.15, 0.6, 0.95], r: [0.3, 0, 0.3] },
    { p: [-0.2, 0.55, 0.22], s: [1.1, 0.6, 0.95], r: [0.25, 0, -0.25] },
    { p: [0, 0.6, -0.1], s: [1.3, 0.62, 1.1] },
    { p: [-0.4, 0.44, -0.2], s: [0.95, 0.65, 1.0] },
    { p: [0.4, 0.44, -0.2], s: [0.95, 0.65, 1.0] },
    { p: [0.24, 0.66, 0.1], s: [0.7, 0.42, 0.7], r: [0.2, 0, 0.7] },
  ]
  switch (spec.hairStyle) {
    case 'buzz': {
      addCap(head, mat, 0.46, 0.015, 0.03)
      break
    }
    case 'curly': {
      addCap(head, mat, 0.5, 0.07)
      const curls: Tuft[] = []
      const ring = 9
      for (let i = 0; i < ring; i++) {
        const a = (i / ring) * Math.PI * 2
        curls.push({ p: [Math.cos(a) * 0.5, 0.44 + ((i * 7) % 3) * 0.04, Math.sin(a) * 0.5], s: [0.9, 0.9, 0.9] })
      }
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + 0.3
        curls.push({ p: [Math.cos(a) * 0.3, 0.68, Math.sin(a) * 0.3], s: [0.95, 0.9, 0.95] })
      }
      curls.push({ p: [0, 0.8, 0], s: [1, 0.9, 1] })
      addTufts(head, mat, [...curls, ...side], 0.2)
      break
    }
    case 'long': {
      addCap(head, mat, 0.5, 0.05)
      addTufts(head, mat, tousled.slice(0, 6))
      const fall = new THREE.CapsuleGeometry(0.15, 0.6, 8, 24)
      for (const sx of [-1, 1]) {
        const f = mesh(fall, mat)
        f.position.set(sx * 0.56, -0.25, -0.1)
        f.rotation.z = sx * 0.1
        head.add(f)
      }
      const back = mesh(new THREE.CapsuleGeometry(0.34, 0.6, 8, 32), mat)
      back.position.set(0, -0.3, -0.42)
      back.scale.set(1.35, 1, 0.6)
      head.add(back)
      break
    }
    case 'swept': {
      addCap(head, mat, 0.46, 0.05)
      // Same tousle, pushed to one side with a longer fringe.
      const swept = tousled.map((t) => ({ ...t, p: [t.p[0] + 0.12, t.p[1], t.p[2]] as [number, number, number] }))
      swept.push({ p: [0.4, 0.36, 0.44], s: [1.1, 0.6, 0.8], r: [0.5, -0.3, -0.5] })
      addTufts(head, mat, [...swept, ...side])
      break
    }
    case 'short':
    case 'cap':
    default: {
      addCap(head, mat, 0.46, 0.05)
      addTufts(head, mat, [...tousled, ...side])
    }
  }
}

function buildProp(spec: CharacterSpec, parts: { body: THREE.Group; head: THREE.Group; topMat: THREE.MeshPhysicalMaterial }) {
  const { body, head, topMat } = parts
  switch (spec.prop) {
    case 'toolbelt': {
      const belt = mesh(new THREE.TorusGeometry(0.37, 0.045, 12, 64), fabric('#6b4a2e', 0.6))
      belt.rotation.x = Math.PI / 2
      belt.position.y = -0.78
      belt.scale.set(1, 0.78, 1)
      body.add(belt)
      const buckle = mesh(new THREE.BoxGeometry(0.1, 0.08, 0.03), shoeMat('#c9b37a'))
      buckle.position.set(0, -0.78, 0.3)
      body.add(buckle)
      break
    }
    case 'longcoat': {
      const skirt = mesh(new THREE.CylinderGeometry(0.36, 0.46, 0.5, 56, 1, true), topMat)
      skirt.position.y = -1.0
      skirt.scale.z = 0.8
      body.add(skirt)
      const lapelGeo = new THREE.BoxGeometry(0.08, 0.45, 0.03)
      const lapelMat = fabric('#2b2b31', 0.7)
      for (const sx of [-1, 1]) {
        const l = mesh(lapelGeo, lapelMat)
        l.position.set(sx * 0.1, -0.1, 0.27)
        l.rotation.z = sx * -0.18
        body.add(l)
      }
      break
    }
    case 'beret': {
      const beret = mesh(new THREE.SphereGeometry(0.56, 48, 32), fabric(spec.accent, 0.7))
      beret.scale.set(1.15, 0.36, 1.15)
      beret.position.set(0.12, 0.62, -0.02)
      beret.rotation.z = -0.22
      head.add(beret)
      break
    }
    case 'headband': {
      const band = mesh(new THREE.TorusGeometry(HEAD_R + 0.045, 0.045, 12, 72), fabric(spec.accent, 0.7))
      band.rotation.x = Math.PI / 2 - 0.1
      band.position.y = 0.3
      head.add(band)
      break
    }
    case 'glasses': {
      const rimMat = shoeMat('#2a2520')
      const rimGeo = new THREE.TorusGeometry(0.16, 0.013, 10, 48)
      for (const sx of [-1, 1]) {
        const r = mesh(rimGeo, rimMat)
        onHead(r, sx * 0.26, -0.02, HEAD_R + 0.05)
        head.add(r)
      }
      const bridge = mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.18, 12), rimMat)
      onHead(bridge, 0, 0, HEAD_R + 0.06)
      bridge.rotation.z = Math.PI / 2
      head.add(bridge)
      break
    }
    case 'jacket': {
      topMat.roughness = 0.28
      topMat.clearcoat = 0.9
      topMat.clearcoatRoughness = 0.18
      topMat.sheen = 0
      topMat.envMapIntensity = 1
      const zip = mesh(new THREE.BoxGeometry(0.025, 0.7, 0.015), shoeMat('#b9b9c2'))
      zip.position.set(0, -0.3, 0.27)
      body.add(zip)
      break
    }
    case 'none':
    default:
      break
  }
}

/**
 * Stylised figure in the proportions of the reference render: oversized round head, slim hoodie
 * body with a kangaroo pocket, tapered trousers and chunky sneakers.
 */
export function buildCharacter(spec: CharacterSpec): Rig {
  const root = new THREE.Group()
  const body = new THREE.Group()
  const head = new THREE.Group()
  root.add(body)
  head.position.y = HEAD_Y
  body.add(head)

  const skinMat = skin(spec.skin)
  const topMat = fabric(spec.top)
  const pocketMat = fabric(new THREE.Color(spec.top).multiplyScalar(0.86).getStyle())
  const bottomMat = fabric(spec.bottom, 0.75)
  const shoes = shoeMat(spec.shoes)
  const hair = hairMat(spec.hair)
  const rim = { color: spec.accent, power: 3.4, strength: 0.16 }

  // Torso (hoodie)
  const torso = mesh(new THREE.CapsuleGeometry(0.34, 0.5, 12, 48), topMat)
  torso.position.y = -0.3
  torso.scale.set(1.02, 1, 0.78)
  addRimShell(torso, rim)
  body.add(torso)

  // Hood ring around the neck and a soft hood bump at the back
  const hood = mesh(new THREE.TorusGeometry(0.28, 0.1, 14, 56), topMat)
  hood.rotation.x = Math.PI / 2
  hood.position.set(0, 0.26, -0.06)
  hood.scale.set(1.15, 1, 0.9)
  body.add(hood)
  const hoodBack = mesh(new THREE.SphereGeometry(0.3, 32, 24), topMat)
  hoodBack.position.set(0, 0.3, -0.28)
  hoodBack.scale.set(1.15, 0.7, 0.6)
  body.add(hoodBack)

  // Kangaroo pocket
  const pocket = mesh(new THREE.CapsuleGeometry(0.11, 0.34, 8, 28), pocketMat)
  pocket.rotation.z = Math.PI / 2
  pocket.position.set(0, -0.6, 0.23)
  pocket.scale.set(1, 1, 0.5)
  body.add(pocket)

  // Drawstrings
  const stringGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.3, 10)
  const stringMat = fabric('#e9e6df', 0.7)
  for (const sx of [-1, 1]) {
    const s = mesh(stringGeo, stringMat)
    s.position.set(sx * 0.07, 0.02, 0.28)
    s.rotation.x = 0.12
    body.add(s)
  }

  const neck = mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.3, 32), skinMat)
  neck.position.y = 0.32
  body.add(neck)

  // Legs: tapered trousers
  const legGeo = new THREE.CylinderGeometry(0.135, 0.105, 0.62, 32)
  for (const sx of [-1, 1]) {
    const leg = mesh(legGeo, bottomMat)
    leg.position.set(sx * 0.165, -1.06, 0.01)
    leg.rotation.z = sx * -0.03
    body.add(leg)
    const sneaker = mesh(new THREE.SphereGeometry(0.17, 32, 20), shoes)
    sneaker.position.set(sx * 0.18, -1.4, 0.1)
    sneaker.scale.set(1.05, 0.62, 1.6)
    body.add(sneaker)
  }

  // Arms: sleeves hang close to the body, small hands below
  const arms: ArmRig[] = []
  const sleeveGeo = new THREE.CapsuleGeometry(0.12, 0.48, 10, 32)
  const handGeo = new THREE.SphereGeometry(0.105, 28, 20)
  const poses = [
    { x: -0.43, rz: 0.1, phase: 0 },
    { x: 0.43, rz: -0.1, phase: Math.PI * 0.85 },
  ]
  for (const p of poses) {
    const g = new THREE.Group()
    g.position.set(p.x, 0.16, 0)
    g.rotation.z = p.rz
    const sleeve = mesh(sleeveGeo, topMat)
    sleeve.position.y = -0.34
    addRimShell(sleeve, rim)
    g.add(sleeve)
    const hand = mesh(handGeo, skinMat)
    hand.position.y = -0.72
    g.add(hand)
    body.add(g)
    arms.push({ group: g, restX: p.x, restY: 0.16, restRz: p.rz, phase: p.phase })
  }

  // Head
  const headMesh = mesh(new THREE.SphereGeometry(HEAD_R, 80, 56), skinMat)
  headMesh.scale.set(1.04, 1, 0.98)
  addRimShell(headMesh, rim)
  head.add(headMesh)

  const earGeo = new THREE.SphereGeometry(0.1, 24, 16)
  for (const sx of [-1, 1]) {
    const ear = mesh(earGeo, skinMat)
    ear.position.set(sx * (HEAD_R + 0.01), -0.04, -0.02)
    ear.scale.set(0.55, 0.85, 0.7)
    head.add(ear)
  }

  // Face
  const eyes: Eye[] = []
  for (const sx of [-1, 1]) {
    const eye = createEye(IRIS, 1)
    onHead(eye.group, sx * 0.25, -0.03, HEAD_R + 0.012)
    head.add(eye.group)
    eyes.push(eye)
  }

  const browGeo = new THREE.CapsuleGeometry(0.014, 0.11, 6, 16)
  for (const sx of [-1, 1]) {
    const brow = mesh(browGeo, hair)
    onHead(brow, sx * 0.25, 0.17, HEAD_R + 0.02)
    brow.rotateZ(Math.PI / 2 + sx * 0.22)
    head.add(brow)
  }

  const nose = mesh(new THREE.SphereGeometry(0.038, 20, 14), skinMat)
  onHead(nose, 0, -0.13, HEAD_R + 0.01)
  nose.scale.set(1, 0.85, 0.9)
  head.add(nose)

  const mouth = mesh(new THREE.TorusGeometry(0.075, 0.011, 10, 32, Math.PI), fabric('#7a3f3a', 0.6))
  onHead(mouth, 0, -0.26, HEAD_R + 0.01)
  mouth.rotateZ(Math.PI)
  mouth.scale.set(1, 0.55, 1)
  head.add(mouth)

  const blushMat = new THREE.MeshBasicMaterial({ color: '#f2a08c', transparent: true, opacity: 0.16 })
  const blushGeo = new THREE.CircleGeometry(0.1, 24)
  for (const sx of [-1, 1]) {
    const b = mesh(blushGeo, blushMat)
    onHead(b, sx * 0.4, -0.16, HEAD_R + 0.006)
    head.add(b)
  }

  buildHair(spec, hair, head)
  buildProp(spec, { body, head, topMat })

  return {
    root,
    body,
    head,
    arms,
    eyes,
    height: FIGURE_HEIGHT,
    dispose: () => disposeObject(root),
  }
}
