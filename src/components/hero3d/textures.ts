import * as THREE from 'three'

export type GradientStop = [offset: number, color: string]

export function radialTexture(stops: GradientStop[], size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  for (const [offset, color] of stops) grad.addColorStop(offset, color)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

function rgba(hex: string, alpha: number) {
  const c = new THREE.Color(hex)
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${alpha})`
}

/** Soft glow sprite texture tinted to an accent colour. */
export function glowTexture(accent: string): THREE.CanvasTexture {
  const light = new THREE.Color(accent).lerp(new THREE.Color('#ffffff'), 0.35).getStyle()
  return radialTexture([
    [0, light.replace('rgb(', 'rgba(').replace(')', ',1)')],
    [0.25, rgba(accent, 0.55)],
    [0.6, rgba(accent, 0.12)],
    [1, rgba(accent, 0)],
  ])
}

/** Iris texture: light centre fading to the accent at the edge. */
export function irisTexture(accent: string): THREE.CanvasTexture {
  const a = new THREE.Color(accent)
  const c0 = a.clone().lerp(new THREE.Color('#ffffff'), 0.7).getStyle()
  const c1 = a.clone().lerp(new THREE.Color('#ffffff'), 0.3).getStyle()
  const c2 = a.getStyle()
  const c3 = a.clone().multiplyScalar(0.7).getStyle()
  return radialTexture([
    [0, c0],
    [0.45, c1],
    [0.8, c2],
    [1, c3],
  ])
}

/** Additive Fresnel rim shell used as a child of each body mesh. */
export function rimMaterial(color: THREE.ColorRepresentation, power: number, strength: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uPower: { value: power },
      uStrength: { value: strength },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uPower;
      uniform float uStrength;
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        float f = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), uPower);
        gl_FragColor = vec4(uColor * f * uStrength, f);
      }
    `,
  })
}
