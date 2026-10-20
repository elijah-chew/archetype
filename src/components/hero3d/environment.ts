import * as THREE from 'three'

interface Softbox {
  color: THREE.ColorRepresentation
  w: number
  h: number
  position: [number, number, number]
  intensity: number
}

/**
 * A light studio built from emissive spheres (round softboxes avoid square bloom artefacts).
 * Lit for a cream card: white key/strip/top plus warm and soft-green fills instead of violet.
 */
const softboxes: Softbox[] = [
  { color: '#ffffff', w: 5, h: 3.2, position: [-3, 4.5, 4], intensity: 3.2 },
  { color: '#ffffff', w: 1.2, h: 6, position: [6, 0.5, 2], intensity: 1.1 },
  { color: '#ffffff', w: 3, h: 1, position: [1.5, 5, -1], intensity: 0.8 },
  { color: '#f3e4cf', w: 4, h: 5, position: [-5, 0, -4], intensity: 1.0 },
  { color: '#cfd9c8', w: 4, h: 5, position: [5, 0, -4], intensity: 1.0 },
  { color: '#e7dccb', w: 6, h: 3, position: [0, -5, 1], intensity: 0.35 },
]

export function createStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const envScene = new THREE.Scene()
  envScene.background = new THREE.Color('#2a2622')
  const geo = new THREE.SphereGeometry(0.5, 32, 16)
  for (const s of softboxes) {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(s.color).multiplyScalar(s.intensity) })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(...s.position)
    mesh.scale.set(s.w, s.h, 0.3)
    mesh.lookAt(0, 0, 0)
    envScene.add(mesh)
  }
  const pmrem = new THREE.PMREMGenerator(renderer)
  const texture = pmrem.fromScene(envScene, 0.02).texture
  pmrem.dispose()
  geo.dispose()
  return texture
}
