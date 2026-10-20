import * as THREE from 'three'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import { rimMaterial } from './textures'

export interface RimSpec {
  color: THREE.ColorRepresentation
  power: number
  strength: number
}

export function glossyMaterial(color: THREE.ColorRepresentation): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.1,
    roughness: 0.3,
    clearcoat: 1.0,
    clearcoatRoughness: 0.16,
    envMapIntensity: 0.9,
  })
}

export function matteMaterial(color: THREE.ColorRepresentation): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0,
    roughness: 0.48,
    clearcoat: 0.3,
    clearcoatRoughness: 0.4,
    envMapIntensity: 0.55,
  })
}

/** Soft skin: low gloss, slight sheen. */
export function skinMaterial(color: THREE.ColorRepresentation): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0,
    roughness: 0.55,
    clearcoat: 0.25,
    clearcoatRoughness: 0.5,
    sheen: 0.4,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color('#ffd9c2'),
    envMapIntensity: 0.6,
  })
}

/** Adds an additive Fresnel shell sharing the mesh's geometry. */
export function addRimShell(mesh: THREE.Mesh, rim: RimSpec) {
  const shell = new THREE.Mesh(mesh.geometry, rimMaterial(rim.color, rim.power, rim.strength))
  shell.renderOrder = 2
  mesh.add(shell)
  return shell
}

export interface PrepareOptions {
  glossy: boolean
  rim?: RimSpec
  tint: THREE.ColorRepresentation
  useMap?: boolean
  smooth?: boolean
}

/**
 * Normalises a loaded GLB's materials to the hero look. Meshes are collected first because
 * adding children inside `traverse` would recurse forever.
 */
export function prepareModel(root: THREE.Object3D, opts: PrepareOptions) {
  const meshes: THREE.Mesh[] = []
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh)
  })
  for (const mesh of meshes) {
    if (opts.smooth) {
      let g = mesh.geometry.clone()
      g.deleteAttribute('normal')
      g.deleteAttribute('uv')
      g.deleteAttribute('uv1')
      g.deleteAttribute('tangent')
      g.deleteAttribute('color')
      g = mergeVertices(g, 1e-3)
      g.computeVertexNormals()
      mesh.geometry = g
    }
    const old = mesh.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[]
    const oldMap = Array.isArray(old) ? old[0]?.map : old?.map
    const mat = opts.glossy ? glossyMaterial(opts.tint) : matteMaterial(opts.tint)
    if (opts.useMap && oldMap) mat.map = oldMap
    mesh.material = mat
    if (opts.rim) addRimShell(mesh, opts.rim)
  }
}

export function disposeObject(root: THREE.Object3D) {
  root.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.geometry) m.geometry.dispose()
    const mat = (m as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
    else mat?.dispose()
    const sprite = o as THREE.Sprite
    if (sprite.isSprite) sprite.material.dispose()
  })
}
