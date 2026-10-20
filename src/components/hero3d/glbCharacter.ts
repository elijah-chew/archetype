import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { CharacterSpec } from '../../data/types'
import { FIGURE_HEIGHT, type ArmRig, type Rig } from './character'
import { createEye, type Eye } from './eyes'
import { addRimShell, disposeObject } from './materials'

const loader = new GLTFLoader()

function findNode(root: THREE.Object3D, ...names: string[]): THREE.Object3D | null {
  const wanted = names.map((n) => n.toLowerCase().replace(/[^a-z]/g, ''))
  let found: THREE.Object3D | null = null
  root.traverse((o) => {
    if (found) return
    const n = o.name.toLowerCase().replace(/[^a-z]/g, '')
    if (wanted.includes(n)) found = o
  })
  return found
}

/**
 * Loads a sculpted GLB and wraps it in the same rig the procedural figure uses.
 * Node naming convention: `Head`, `Eye_L`, `Eye_R`, `Arm_L`, `Arm_R`. Missing nodes degrade
 * gracefully (whole figure turns; no pupil tracking).
 */
export async function loadGlbCharacter(url: string, spec: CharacterSpec): Promise<Rig> {
  const gltf = await loader.loadAsync(url)
  const model = gltf.scene

  // Normalise: feet at the same floor as the procedural figure, same overall height.
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const scale = FIGURE_HEIGHT / Math.max(size.y, 1e-3)
  model.scale.setScalar(scale)
  box.setFromObject(model)
  const centre = box.getCenter(new THREE.Vector3())
  model.position.set(-centre.x, -(box.min.y + FIGURE_HEIGHT * 0.475), -centre.z)

  const meshes: THREE.Mesh[] = []
  model.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh)
  })
  for (const m of meshes) {
    const mat = m.material as THREE.MeshStandardMaterial
    if (mat && 'envMapIntensity' in mat) mat.envMapIntensity = 0.8
    addRimShell(m, { color: spec.accent, power: 3.2, strength: 0.28 })
  }

  const root = new THREE.Group()
  const body = new THREE.Group()
  root.add(body)
  body.add(model)

  const headNode = findNode(model, 'Head')
  const head = new THREE.Group()
  if (headNode && headNode.parent) {
    // Re-parent the head under a pivot placed at the head node's location.
    const parent = headNode.parent
    headNode.updateWorldMatrix(true, false)
    const worldPos = new THREE.Vector3()
    headNode.getWorldPosition(worldPos)
    body.worldToLocal(worldPos)
    head.position.copy(worldPos)
    body.add(head)
    parent.remove(headNode)
    head.add(headNode)
    headNode.position.set(0, 0, 0)
  } else {
    // No head node: the whole figure acts as the head so it still turns toward the cursor.
    body.remove(model)
    head.add(model)
    body.add(head)
  }

  const eyes: Eye[] = []
  for (const name of ['Eye_L', 'Eye_R']) {
    const node = findNode(model, name)
    if (!node) continue
    const eye = createEye(spec.accent, 0.5)
    node.getWorldPosition(eye.group.position)
    head.worldToLocal(eye.group.position)
    const dir = eye.group.position.clone().setY(0).normalize()
    eye.group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.lengthSq() ? dir : new THREE.Vector3(0, 0, 1))
    head.add(eye.group)
    eyes.push(eye)
  }

  const arms: ArmRig[] = []
  for (const [name, phase] of [
    ['Arm_L', 0],
    ['Arm_R', Math.PI * 0.85],
  ] as const) {
    const node = findNode(model, name)
    if (!node) continue
    const g = node as THREE.Group
    arms.push({ group: g, restX: g.position.x, restY: g.position.y, restRz: g.rotation.z, phase })
  }

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
