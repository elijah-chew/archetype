import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
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

/** Stylised head, about a third of the standing figure. */
export const HEAD_R = 0.5
const HEAD_Y = 1.02
/** Soles near -1.5, top of the hair near 1.7. Center keeps the feet on the contact shadow. */
export const FIGURE_HEIGHT = 3.25
export const FIGURE_CENTER_Y = 0.12

const COLLAR = '#f3efe6'
const LAPTOP = '#9aa0a6'
const LAPTOP_EDGE = '#6e747c'

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

/** Soft dome plus a separate fringe, so the hairline is not a hard bowl edge. */
function buildHair(spec: CharacterSpec, mat: THREE.Material, head: THREE.Group) {
  const dome = mesh(new THREE.SphereGeometry(HEAD_R + 0.025, 48, 32), mat)
  const short = spec.hairStyle === 'buzz'
  dome.scale.set(1.02, short ? 0.46 : 0.68, short ? 1 : 0.86)
  dome.position.set(short ? 0 : -0.03, short ? 0.26 : 0.22, short ? 0 : -0.06)
  head.add(dome)
  if (short) return

  const sweep = spec.hairStyle === 'swept' || spec.hairStyle === 'long' ? 1 : 0.55
  // Bangs lie on the forehead and sweep to one side.
  const fringe = mesh(new THREE.SphereGeometry(0.2, 28, 18), mat)
  fringe.scale.set(1.35, 0.48, 0.4)
  fringe.position.set(0.05 * sweep, 0.0, 0.38)
  fringe.rotation.set(0.75, -0.2 * sweep, -0.55 * sweep)
  head.add(fringe)

  const part = mesh(new THREE.SphereGeometry(0.14, 22, 14), mat)
  part.scale.set(1.2, 0.6, 0.8)
  part.position.set(-0.16 * sweep, 0.34, 0.08)
  head.add(part)

  const sideGeo = new THREE.SphereGeometry(0.12, 18, 12)
  for (const sx of [-1, 1]) {
    const side = mesh(sideGeo, mat)
    side.scale.set(0.6, 0.55, 0.6)
    side.position.set(sx * 0.36, 0.12, 0.02)
    head.add(side)
  }

  const back = mesh(new THREE.SphereGeometry(0.18, 20, 14), mat)
  back.scale.set(1.25, 0.65, 0.5)
  back.position.set(0, 0.16, -0.36)
  head.add(back)

  if (spec.hairStyle === 'curly') {
    const curlGeo = new THREE.SphereGeometry(0.1, 16, 12)
    for (const [x, y, z] of [
      [-0.28, 0.28, 0.2],
      [0.26, 0.26, 0.16],
      [0.02, 0.4, 0.02],
    ] as const) {
      const c = mesh(curlGeo, mat)
      c.position.set(x, y, z)
      head.add(c)
    }
  }
}

/** Closed laptop: a slim grey slab with a lid seam. Parent keeps it with the holding arm. */
function buildLaptop(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'laptop'
  const shell = new THREE.MeshPhysicalMaterial({
    color: LAPTOP,
    metalness: 0.06,
    roughness: 0.42,
    clearcoat: 0.28,
    clearcoatRoughness: 0.45,
    envMapIntensity: 0.5,
  })
  g.add(mesh(new RoundedBoxGeometry(0.34, 0.48, 0.036, 3, 0.016), shell))
  const seam = mesh(new RoundedBoxGeometry(0.3, 0.008, 0.042, 2, 0.003), shoeMat(LAPTOP_EDGE))
  seam.position.y = 0.04
  g.add(seam)
  return g
}

/** Point a group's local -Y axis at `target` (same parent space). */
function aimDown(group: THREE.Group, target: THREE.Vector3) {
  const dir = new THREE.Vector3().subVectors(target, group.position).normalize()
  group.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir)
}

function buildProp(spec: CharacterSpec, parts: { body: THREE.Group; head: THREE.Group }) {
  const { body, head } = parts
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
    case 'longcoat':
      // The shared silhouette is the quarter-zip. A coat would hide it.
      break
    case 'beret': {
      const beret = mesh(new THREE.SphereGeometry(0.34, 40, 24), fabric(spec.accent, 0.7))
      beret.scale.set(1.2, 0.32, 1.15)
      beret.position.set(0.1, 0.46, 0.02)
      beret.rotation.z = -0.28
      head.add(beret)
      break
    }
    case 'headband': {
      const band = mesh(new THREE.TorusGeometry(HEAD_R + 0.03, 0.032, 12, 64), fabric(spec.accent, 0.65))
      band.rotation.x = Math.PI / 2
      band.position.y = 0.16
      head.add(band)
      break
    }
    case 'glasses': {
      const rimMat = shoeMat('#2a2520')
      const rimGeo = new THREE.TorusGeometry(0.105, 0.012, 10, 40)
      for (const sx of [-1, 1]) {
        const r = mesh(rimGeo, rimMat)
        onHead(r, sx * 0.16, 0.02, HEAD_R + 0.04)
        head.add(r)
      }
      const bridge = mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.1, 12), rimMat)
      onHead(bridge, 0, 0.02, HEAD_R + 0.05)
      bridge.rotation.z = Math.PI / 2
      head.add(bridge)
      break
    }
    case 'jacket':
      // Same quarter-zip. Colour comes from the spec, not a second garment.
      break
    case 'none':
    default:
      break
  }
}

/**
 * Stylised figure in the proportions of the reference: large rounded head, neat side-swept
 * hair, quarter-zip with a light collar, slim trousers, simple dark shoes, laptop under one arm.
 * The returned rig is what the scene animates (head, pupils, arms, blink).
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
  const collarMat = fabric(COLLAR, 0.62)
  const bottomMat = fabric(spec.bottom, 0.75)
  const shoes = shoeMat(spec.shoes)
  const hair = hairMat(spec.hair)
  const rim = { color: spec.accent, power: 3.4, strength: 0.14 }
  const hemColor = new THREE.Color(spec.top).multiplyScalar(0.86).getStyle()

  // Quarter-zip. Shoulders come up to a short neck so the head sits on the collar.
  const torso = mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.7, 40), topMat)
  torso.position.y = -0.06
  torso.scale.z = 0.78
  addRimShell(torso, rim)
  body.add(torso)
  const shoulder = mesh(new THREE.SphereGeometry(0.3, 32, 20), topMat)
  shoulder.scale.set(1.06, 0.48, 0.78)
  shoulder.position.y = 0.22
  body.add(shoulder)

  const hem = mesh(new THREE.CylinderGeometry(0.27, 0.28, 0.06, 32), fabric(hemColor, 0.8))
  hem.position.y = -0.42
  hem.scale.z = 0.8
  body.add(hem)

  const neck = mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.12, 28), skinMat)
  neck.position.y = 0.42
  body.add(neck)

  // Collar sits on the shoulder line, half buried so it reads as part of the shirt.
  const collar = mesh(new THREE.TorusGeometry(0.132, 0.036, 12, 32), collarMat)
  collar.rotation.x = Math.PI / 2
  collar.position.set(0, 0.33, 0.02)
  collar.scale.set(1.08, 1, 0.82)
  body.add(collar)
  const zip = mesh(new THREE.BoxGeometry(0.012, 0.15, 0.012), shoeMat('#c5ccd4'))
  zip.position.set(0, 0.2, 0.25)
  body.add(zip)
  const pull = mesh(new THREE.BoxGeometry(0.022, 0.03, 0.012), shoeMat('#f4f6f8'))
  pull.position.set(0, 0.26, 0.258)
  body.add(pull)

  const hip = mesh(new THREE.SphereGeometry(0.16, 24, 16), bottomMat)
  hip.position.set(0, -0.5, 0.02)
  hip.scale.set(1.55, 0.65, 0.85)
  body.add(hip)

  const legGeo = new THREE.CylinderGeometry(0.1, 0.088, 0.86, 28)
  const shoeGeo = new RoundedBoxGeometry(0.16, 0.1, 0.25, 3, 0.036)
  for (const sx of [-1, 1]) {
    const leg = mesh(legGeo, bottomMat)
    leg.position.set(sx * 0.105, -0.98, 0.02)
    body.add(leg)
    const shoe = mesh(shoeGeo, shoes)
    shoe.position.set(sx * 0.11, -1.44, 0.07)
    body.add(shoe)
  }

  // Arms. Left elbow sticks out; the forearm crosses in and holds the laptop against the hip.
  const arms: ArmRig[] = []
  const handGeo = new THREE.SphereGeometry(0.075, 22, 14)
  const holdRz = 0.5

  const relaxed = new THREE.Group()
  relaxed.position.set(-0.26, 0.2, 0.02)
  relaxed.rotation.z = -0.16
  const relaxedSleeve = mesh(new THREE.CapsuleGeometry(0.078, 0.68, 8, 22), topMat)
  relaxedSleeve.position.y = -0.42
  relaxed.add(relaxedSleeve)
  const relaxedHand = mesh(handGeo, skinMat)
  relaxedHand.position.y = -0.84
  relaxedHand.scale.set(1, 1.1, 0.8)
  relaxed.add(relaxedHand)
  body.add(relaxed)
  arms.push({ group: relaxed, restX: -0.26, restY: 0.2, restRz: -0.16, phase: 0 })

  const holding = new THREE.Group()
  holding.position.set(0.26, 0.2, 0.02)
  holding.rotation.z = holdRz
  const upper = mesh(new THREE.CapsuleGeometry(0.082, 0.26, 8, 20), topMat)
  upper.position.y = -0.18
  holding.add(upper)
  const fore = new THREE.Group()
  fore.position.set(0, -0.34, 0)
  const grip = new THREE.Vector3(-0.32, -0.4, 0.28)
  aimDown(fore, grip)
  const foreSleeve = mesh(new THREE.CapsuleGeometry(0.074, 0.26, 8, 18), topMat)
  foreSleeve.position.y = -0.2
  fore.add(foreSleeve)
  const holdHand = mesh(handGeo, skinMat)
  holdHand.position.y = -0.38
  holdHand.scale.set(1.1, 0.85, 0.75)
  fore.add(holdHand)
  holding.add(fore)
  const laptop = buildLaptop()
  laptop.position.set(-0.18, -0.4, 0.24)
  // Cancel the shoulder tilt so the laptop stays upright while it bobs with the arm.
  laptop.rotation.set(0.12, -0.55, -holdRz)
  holding.add(laptop)
  body.add(holding)
  arms.push({ group: holding, restX: 0.26, restY: 0.2, restRz: holdRz, phase: Math.PI * 0.85 })

  const headMesh = mesh(new THREE.SphereGeometry(HEAD_R, 80, 56), skinMat)
  headMesh.scale.set(1.0, 1.06, 0.96)
  addRimShell(headMesh, rim)
  head.add(headMesh)

  const earGeo = new THREE.SphereGeometry(0.075, 20, 14)
  for (const sx of [-1, 1]) {
    const ear = mesh(earGeo, skinMat)
    ear.position.set(sx * (HEAD_R * 0.96), -0.1, 0.02)
    ear.scale.set(0.48, 0.9, 0.6)
    head.add(ear)
  }

  const eyes: Eye[] = []
  for (const sx of [-1, 1]) {
    const eye = createEye(IRIS, 0.82)
    onHead(eye.group, sx * 0.155, 0.02, HEAD_R + 0.008)
    head.add(eye.group)
    eyes.push(eye)
  }

  const browGeo = new THREE.CapsuleGeometry(0.011, 0.08, 4, 10)
  for (const sx of [-1, 1]) {
    const brow = mesh(browGeo, hair)
    brow.position.set(sx * 0.15, 0.15, 0.48)
    brow.rotation.z = Math.PI / 2 - sx * 0.22
    head.add(brow)
  }

  const nose = mesh(new THREE.SphereGeometry(0.028, 16, 12), skinMat)
  onHead(nose, 0, -0.1, HEAD_R + 0.006)
  nose.scale.set(0.9, 0.75, 0.8)
  head.add(nose)

  const mouth = mesh(new THREE.TorusGeometry(0.046, 0.007, 8, 20, Math.PI), fabric('#7a3f3a', 0.6))
  onHead(mouth, 0, -0.2, HEAD_R + 0.006)
  mouth.rotateZ(Math.PI)
  mouth.scale.set(1, 0.45, 1)
  head.add(mouth)

  const blushMat = new THREE.MeshBasicMaterial({ color: '#f2a08c', transparent: true, opacity: 0.16 })
  const blushGeo = new THREE.CircleGeometry(0.055, 18)
  for (const sx of [-1, 1]) {
    const b = mesh(blushGeo, blushMat)
    onHead(b, sx * 0.26, -0.08, HEAD_R + 0.004)
    head.add(b)
  }

  buildHair(spec, hair, head)
  buildProp(spec, { body, head })

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
