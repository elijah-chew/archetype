import * as THREE from 'three'

export interface Eye {
  group: THREE.Group
  /** Iris + pupil + highlights; moves with the cursor. */
  pupilWrap: THREE.Group
}

function overlay(mat: THREE.Material, renderOrder: number, obj: THREE.Object3D) {
  mat.toneMapped = false
  mat.depthWrite = false
  mat.depthTest = false
  obj.renderOrder = renderOrder
}

/**
 * Big cartoon eye: white almond sclera, large dark iris, pupil, two highlights and a soft upper
 * lid line. Materials ignore depth so the eyes stay crisp when the head turns.
 * `scale` = 1 gives a sclera radius of 0.135 (tuned for a 0.66 head radius).
 */
export function createEye(irisColor: string, scale = 1): Eye {
  const group = new THREE.Group()
  const iris = new THREE.Color(irisColor)

  const sclera = new THREE.Mesh(
    new THREE.CircleGeometry(0.135 * scale, 48),
    new THREE.MeshBasicMaterial({ color: '#fbfaf8' }),
  )
  sclera.scale.set(0.92, 1, 1)
  overlay(sclera.material, 10, sclera)
  group.add(sclera)

  const pupilWrap = new THREE.Group()

  const irisRim = new THREE.Mesh(
    new THREE.CircleGeometry(0.1 * scale, 48),
    new THREE.MeshBasicMaterial({ color: iris.clone().multiplyScalar(0.55) }),
  )
  overlay(irisRim.material, 11, irisRim)
  irisRim.position.z = 0.001
  pupilWrap.add(irisRim)

  const irisCore = new THREE.Mesh(
    new THREE.CircleGeometry(0.084 * scale, 48),
    new THREE.MeshBasicMaterial({ color: iris }),
  )
  overlay(irisCore.material, 11, irisCore)
  irisCore.position.z = 0.0015
  pupilWrap.add(irisCore)

  const pupil = new THREE.Mesh(
    new THREE.CircleGeometry(0.05 * scale, 40),
    new THREE.MeshBasicMaterial({ color: '#0c0a0a' }),
  )
  overlay(pupil.material, 12, pupil)
  pupil.position.z = 0.002
  pupilWrap.add(pupil)

  const glintMat = new THREE.MeshBasicMaterial({ color: '#ffffff' })
  const glint = new THREE.Mesh(new THREE.CircleGeometry(0.034 * scale, 24), glintMat)
  overlay(glint.material, 13, glint)
  glint.position.set(-0.035 * scale, 0.04 * scale, 0.003)
  pupilWrap.add(glint)

  const glint2 = new THREE.Mesh(new THREE.CircleGeometry(0.014 * scale, 16), glintMat)
  overlay(glint2.material, 13, glint2)
  glint2.position.set(0.04 * scale, -0.035 * scale, 0.003)
  pupilWrap.add(glint2)

  group.add(pupilWrap)

  // Upper lid: a thin dark arc hugging the top of the sclera.
  const lid = new THREE.Mesh(
    new THREE.RingGeometry(0.128 * scale, 0.142 * scale, 48, 1, Math.PI * 0.18, Math.PI * 0.64),
    new THREE.MeshBasicMaterial({ color: '#2a1a12' }),
  )
  lid.scale.set(0.92, 1, 1)
  overlay(lid.material, 13, lid)
  lid.position.z = 0.0035
  group.add(lid)

  return { group, pupilWrap }
}

/** Returns the eye's scale.y during a blink (1 → 0.08 → 1 over `duration`). */
export function blinkScale(elapsed: number, duration = 0.32) {
  if (elapsed < 0 || elapsed > duration) return 1
  const k = elapsed / duration
  const closed = k < 0.5 ? k / 0.5 : 1 - (k - 0.5) / 0.5
  return 1 - closed * 0.92
}
