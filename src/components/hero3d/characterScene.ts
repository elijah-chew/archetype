import * as THREE from 'three'
import type { CharacterSpec } from '../../data/types'
import { FIGURE_CENTER_Y, buildCharacter, type Rig } from './character'
import { createStudioEnvironment } from './environment'
import { blinkScale } from './eyes'
import { loadGlbCharacter } from './glbCharacter'
import { glowTexture, radialTexture } from './textures'

export interface CharacterSceneOptions {
  canvas: HTMLCanvasElement
  /** Element whose size drives the renderer (the square stage). */
  host: HTMLElement
  reducedMotion: boolean
  /** Card surface colour so the canvas blends into it. */
  background: string
  onReady?: () => void
}

export interface CharacterScene {
  setCharacter: (spec: CharacterSpec, modelUrl?: string) => void
  setReducedMotion: (v: boolean) => void
  destroy: () => void
}

const FOV = 28
const IDLE_AFTER_MS = 3500
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

export function createCharacterScene(opts: CharacterSceneOptions): CharacterScene {
  const { canvas, host } = opts
  let reducedMotion = opts.reducedMotion

  // Transparent canvas: the card's CSS surface supplies the cream so the background is never
  // tone-mapped (ACES would turn #fff7ee grey).
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    premultipliedAlpha: false,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  scene.background = null
  scene.environment = createStudioEnvironment(renderer)
  scene.environmentIntensity = 1.0

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100)
  camera.position.set(0, 0, 10)
  camera.lookAt(0, 0, 0)

  scene.add(new THREE.HemisphereLight(0xfff6e8, 0x8a8578, 2.1))
  const key = new THREE.DirectionalLight(0xffffff, 0.55)
  key.position.set(-3, 4, 5)
  scene.add(key)

  // Accent haze behind the figure and a soft contact shadow + accent pool under it.
  const hazeMat = new THREE.SpriteMaterial({ color: 0xffffff, transparent: true, opacity: 0.14, depthWrite: false, toneMapped: false })
  const haze = new THREE.Sprite(hazeMat)
  haze.scale.setScalar(6.5)
  haze.position.set(0, 0.2, -3)
  scene.add(haze)

  const shadowTex = radialTexture([
    [0, 'rgba(45,58,46,0.55)'],
    [0.5, 'rgba(45,58,46,0.18)'],
    [1, 'rgba(45,58,46,0)'],
  ])
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false })
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMat)
  shadow.position.set(0, -1.62, -0.4)
  shadow.scale.set(2.6, 0.5, 1)
  scene.add(shadow)

  const poolMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false, toneMapped: false })
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), poolMat)
  pool.position.set(0, -1.6, -0.5)
  pool.scale.set(3.2, 0.62, 1)
  scene.add(pool)

  // No post-processing: UnrealBloomPass writes alpha 1 and would make the transparent canvas opaque.
  // Glow comes from the additive halo sprites instead.

  // ---- Rig state --------------------------------------------------------
  let rig: Rig | null = null
  let pendingToken = 0
  const stage = new THREE.Group()
  scene.add(stage)
  let intro = 0 // 0..1 pop-in progress
  let outro = 1 // 1..0 when swapping characters
  let swapTo: (() => void) | null = null

  const applySpecTextures = (spec: CharacterSpec) => {
    hazeMat.map?.dispose()
    hazeMat.map = glowTexture(spec.accent)
    hazeMat.needsUpdate = true
    poolMat.map?.dispose()
    poolMat.map = glowTexture(spec.accent)
    poolMat.needsUpdate = true
  }

  const mountRig = (next: Rig) => {
    if (rig) {
      stage.remove(rig.root)
      rig.dispose()
    }
    rig = next
    rig.root.position.y = -FIGURE_CENTER_Y
    rig.root.scale.setScalar(0.001)
    stage.add(rig.root)
    intro = 0
    outro = 1
    opts.onReady?.()
  }

  const setCharacter = (spec: CharacterSpec, modelUrl?: string) => {
    const token = ++pendingToken
    applySpecTextures(spec)
    const build = async (): Promise<Rig> => {
      if (modelUrl) {
        try {
          return await loadGlbCharacter(modelUrl, spec)
        } catch {
          // Fall through to the procedural figure.
        }
      }
      return buildCharacter(spec)
    }
    void build().then((next) => {
      if (token !== pendingToken) {
        next.dispose()
        return
      }
      if (rig) {
        // Shrink the current figure first, then pop the new one in.
        swapTo = () => mountRig(next)
      } else {
        mountRig(next)
      }
    })
  }

  // ---- Layout -----------------------------------------------------------
  let W = 1
  let H = 1
  const anchor = new THREE.Vector2()
  const layout = () => {
    W = Math.max(1, host.clientWidth)
    H = Math.max(1, host.clientHeight)
    renderer.setSize(W, H, false)
    camera.aspect = W / H
    const figurePx = Math.min(H * 0.98, W * 0.92)
    const figureUnits = 3.55
    camera.position.z = (figureUnits * H) / (figurePx * 2 * Math.tan(THREE.MathUtils.degToRad(FOV) / 2))
    anchor.set(W / 2, H * 0.49)
    camera.setViewOffset(W, H, W / 2 - anchor.x, H / 2 - anchor.y, W, H)
    camera.updateProjectionMatrix()
  }
  layout()
  const ro = new ResizeObserver(layout)
  ro.observe(host)

  // ---- Pointer ------------------------------------------------------------
  const target = new THREE.Vector2()
  const look = new THREE.Vector2()
  let lastMove = performance.now() - IDLE_AFTER_MS
  const onPointer = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect()
    const ax = rect.left + anchor.x
    const ay = rect.top + anchor.y
    const rx = Math.max(window.innerWidth * 0.55, 500)
    const ry = Math.max(window.innerHeight * 0.55, 400)
    target.set(clamp((clientX - ax) / rx, -1.2, 1.2), clamp((clientY - ay) / ry, -1.2, 1.2))
    lastMove = performance.now()
  }
  const onPointerEvent = (e: PointerEvent) => onPointer(e.clientX, e.clientY)
  const onTouch = (e: TouchEvent) => {
    const t = e.touches[0]
    if (t) onPointer(t.clientX, t.clientY)
  }
  window.addEventListener('pointermove', onPointerEvent, { passive: true })
  window.addEventListener('pointerdown', onPointerEvent, { passive: true })
  window.addEventListener('touchmove', onTouch, { passive: true })

  // ---- Visibility -------------------------------------------------------
  let visible = true
  const io = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true
    if (visible) schedule()
  })
  io.observe(host)

  // ---- Loop -------------------------------------------------------------
  let raf = 0
  let last = performance.now()
  let t = 0
  let nextBlinkAt = 2.5 + Math.random() * 3.5
  let blinkStart = -1
  let destroyed = false

  const schedule = () => {
    if (destroyed || raf) return
    raf = requestAnimationFrame(frame)
  }

  const frame = (now: number) => {
    raf = 0
    if (destroyed) return
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    t += dt
    const m = reducedMotion ? 0.25 : 1

    if (now - lastMove > IDLE_AFTER_MS) {
      target.set(Math.sin(t * 0.45) * 0.45, Math.sin(t * 0.31 + 1.2) * 0.2)
    }
    const k = 1 - Math.pow(0.0025, dt)
    look.x += (target.x - look.x) * k
    look.y += (target.y - look.y) * k

    const bob = Math.sin(t * 1.6) * 0.09 * m

    if (rig) {
      if (swapTo) {
        outro = Math.max(0, outro - dt * 3.2)
        rig.root.scale.setScalar(Math.max(0.001, outro * outro))
        if (outro <= 0) {
          const fn = swapTo
          swapTo = null
          fn()
        }
      } else if (intro < 1) {
        intro = Math.min(1, intro + dt * 1.4)
        const e = intro - 1
        const s = 1 + 2.4 * e * e * e + 1.4 * e * e
        rig.root.scale.setScalar(Math.max(0.001, s))
      }

      rig.root.position.y = -FIGURE_CENTER_Y + bob
      rig.head.rotation.set(look.y * 0.42, look.x * 0.5, -look.x * 0.06 + Math.sin(t * 1.1) * 0.015 * m)
      rig.body.rotation.set(look.y * 0.12, look.x * 0.28, 0)

      for (const arm of rig.arms) {
        const w = Math.sin(t * 2.0 + arm.phase)
        const sign = Math.sign(arm.restX) || 1
        arm.group.position.y = arm.restY + w * 0.13 * m - bob * 0.35
        arm.group.position.x = arm.restX + sign * look.x * -0.04
        arm.group.rotation.z = arm.restRz + w * 0.12 * sign * m
        arm.group.rotation.x = Math.sin(t * 1.3 + arm.phase) * 0.08 * m
      }

      if (t >= nextBlinkAt && blinkStart < 0) blinkStart = t
      const blink = blinkStart >= 0 ? blinkScale(t - blinkStart) : 1
      if (blinkStart >= 0 && t - blinkStart > 0.32) {
        blinkStart = -1
        nextBlinkAt = t + 2.5 + Math.random() * 3.5
      }
      for (const eye of rig.eyes) {
        eye.pupilWrap.position.set(clamp(look.x * 0.075, -0.07, 0.07), clamp(-look.y * 0.06, -0.06, 0.06), 0)
        eye.group.scale.y = blink
      }
    }

    shadow.scale.set(2.6 - bob * 3, 0.5 - bob * 0.4, 1)
    shadowMat.opacity = 0.42 + (0.09 - bob) * 1.2
    pool.scale.set(3.2 - bob * 3, 0.62 - bob * 0.4, 1)
    poolMat.opacity = 0.28 + (0.09 - bob) * 0.8
    hazeMat.opacity = 0.12 + Math.sin(t * 0.8) * 0.02

    renderer.render(scene, camera)
    if (visible) schedule()
  }
  schedule()

  const destroy = () => {
    destroyed = true
    if (raf) cancelAnimationFrame(raf)
    ro.disconnect()
    io.disconnect()
    window.removeEventListener('pointermove', onPointerEvent)
    window.removeEventListener('pointerdown', onPointerEvent)
    window.removeEventListener('touchmove', onTouch)
    rig?.dispose()
    shadowTex.dispose()
    hazeMat.map?.dispose()
    poolMat.map?.dispose()
    hazeMat.dispose()
    shadowMat.dispose()
    poolMat.dispose()
    scene.environment?.dispose()
    renderer.dispose()
  }

  return {
    setCharacter,
    setReducedMotion: (v) => {
      reducedMotion = v
    },
    destroy,
  }
}
