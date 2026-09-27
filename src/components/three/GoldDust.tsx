"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  attribute float aScale;
  attribute float aSeed;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    float t = uTime * 0.04 + aSeed * 10.0;
    // Slow upward drift, wrapped inside a 10-unit column.
    p.y = mod(p.y + uTime * 0.045 * (0.35 + aScale) + 5.0, 10.0) - 5.0;
    p.x += sin(t * 2.0 + aSeed * 6.2831) * 0.28;
    p.z += cos(t * 1.4 + aSeed * 3.1415) * 0.22;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aScale * uPixelRatio / -mv.z;

    float twinkle = 0.55 + 0.45 * sin(uTime * (0.5 + aSeed) + aSeed * 40.0);
    float edge = smoothstep(-5.0, -3.2, p.y) * (1.0 - smoothstep(3.2, 5.0, p.y));
    vAlpha = twinkle * edge;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    float glow = pow(core, 3.0);
    gl_FragColor = vec4(uColor, (glow * 0.85 + core * 0.12) * vAlpha);
  }
`;

function Dust({ count, pointer }: { count: number; pointer: React.RefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null);
  const dpr = useThree((s) => s.viewport.dpr);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = -4 + Math.random() * 6;
      // Most motes are tiny; a few large, soft ones read as out-of-focus bokeh.
      scales[i] = Math.random() < 0.08 ? 1.6 + Math.random() * 1.6 : 0.25 + Math.random() * 0.9;
      seeds[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uSize: { value: 70 },
        uColor: { value: new THREE.Color("#e9cf9f") },
      },
    });
    return { geometry: g, material: m };
  }, [count]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  useFrame((state, delta) => {
    material.uniforms.uTime.value += delta;
    material.uniforms.uPixelRatio.value = dpr;
    const g = group.current;
    if (!g) return;
    const p = pointer.current;
    // Weighted, lagging response to the cursor — depth, not reaction.
    g.rotation.y += (p.x * 0.14 - g.rotation.y) * 0.03;
    g.rotation.x += (-p.y * 0.08 - g.rotation.x) * 0.03;
    g.position.x += (p.x * 0.35 - g.position.x) * 0.03;
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} />
    </group>
  );
}

/** Champagne dust drifting through the hero. Pauses when `active` is false. */
export default function GoldDust({ active, count = 320 }: { active: boolean; count?: number }) {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <Dust count={count} pointer={pointer} />
    </Canvas>
  );
}
