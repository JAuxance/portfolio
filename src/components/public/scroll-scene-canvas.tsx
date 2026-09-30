'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DEPTH = 140; // how far the camera travels along -z
const RINGS = 6; // one "station" per major scroll landmark

/** Accent stops along the page: calm white → blue → violet → amber → teal. */
const STOPS: [number, string][] = [
  [0, '#e8e8ea'],
  [0.25, '#7fb0ff'],
  [0.55, '#b393ff'],
  [0.8, '#ffb877'],
  [1, '#6ee7d0'],
];

function accentAt(p: number, out: THREE.Color) {
  for (let i = 1; i < STOPS.length; i++) {
    if (p <= STOPS[i][0]) {
      const [a, ca] = STOPS[i - 1];
      const [b, cb] = STOPS[i];
      return out.set(ca).lerp(new THREE.Color(cb), (p - a) / (b - a));
    }
  }
  return out.set(STOPS[STOPS.length - 1][1]);
}

/** Soft round sprite so points render as dots instead of squares. */
function makeDot() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.8)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface SceneProps {
  light: boolean;
  animated: boolean;
  count: number;
}

function Scene({ light, animated, count }: SceneProps) {
  const points = useRef<THREE.Points>(null);
  const rings = useRef<(THREE.LineLoop | null)[]>([]);
  const progress = useRef(0);
  const target = useRef(0);
  const dot = useMemo(() => makeDot(), []);
  const accent = useMemo(() => new THREE.Color(), []);

  const positions = useMemo(() => {
    const rand = mulberry(7);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = 2.4 + Math.pow(rand(), 0.7) * 13; // keep a clear lane in the middle
      arr[i * 3] = Math.cos(angle) * radius;
      arr[i * 3 + 1] = Math.sin(angle) * radius;
      arr[i * 3 + 2] = -rand() * (DEPTH + 30) + 10;
    }
    return arr;
  }, [count]);

  const ringGeometry = useMemo(() => {
    const pts = new THREE.EllipseCurve(0, 0, 3.4, 3.4, 0, Math.PI * 2).getPoints(96);
    return new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p.x, p.y, 0)));
  }, []);

  // Document scroll → 0..1, cached so useFrame never forces layout.
  const maxScroll = useRef(1);
  useEffect(() => {
    const measure = () => {
      maxScroll.current = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };
    const read = () => {
      target.current = Math.min(1, Math.max(0, window.scrollY / maxScroll.current));
    };
    measure();
    read();
    const ro = new ResizeObserver(() => {
      measure();
      read();
    });
    ro.observe(document.body);
    window.addEventListener('scroll', read, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', read);
      window.removeEventListener('resize', measure);
    };
  }, []);

  useFrame((state, dt) => {
    if (animated) progress.current += (target.current - progress.current) * Math.min(1, dt * 4);
    const p = progress.current;
    const t = state.clock.elapsedTime;

    accentAt(p, accent);
    const shown = light ? accent.clone().multiplyScalar(0.55) : accent;

    // The journey: fly forward, drift with the pointer, roll slightly.
    state.camera.position.z = -p * DEPTH;
    state.camera.position.x += (state.pointer.x * 0.7 - state.camera.position.x) * 0.04;
    state.camera.position.y += (state.pointer.y * 0.5 - state.camera.position.y) * 0.04;
    state.camera.rotation.z = animated ? p * Math.PI * 0.6 + Math.sin(t * 0.15) * 0.02 : 0;

    if (points.current) {
      (points.current.material as THREE.PointsMaterial).color.copy(shown);
    }
    rings.current.forEach((ring, i) => {
      if (!ring) return;
      const z = -((i + 0.5) / RINGS) * DEPTH;
      const near = 1 - Math.min(1, Math.abs(state.camera.position.z - z) / 22);
      const mat = ring.material as THREE.LineBasicMaterial;
      mat.color.copy(shown);
      mat.opacity = 0.14 + near * 0.8;
      ring.scale.setScalar((1 + (i % 3) * 0.55) * (1 + near * 0.35));
      if (animated) ring.rotation.z = t * 0.08 * (i % 2 ? 1 : -1) + i;
    });
  });

  const blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;

  return (
    <>
      <fog attach="fog" args={[light ? '#F6F5F1' : '#0A0A0B', 6, 46]} />
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.13}
          sizeAttenuation
          map={dot}
          alphaTest={0.02}
          transparent
          opacity={light ? 0.7 : 0.95}
          depthWrite={false}
          blending={blending}
        />
      </points>
      {Array.from({ length: RINGS }, (_, i) => (
        <lineLoop
          key={i}
          ref={(el) => {
            rings.current[i] = el;
          }}
          geometry={ringGeometry}
          position={[0, 0, -((i + 0.5) / RINGS) * DEPTH]}
        >
          <lineBasicMaterial transparent opacity={0.1} depthWrite={false} blending={blending} />
        </lineLoop>
      ))}
    </>
  );
}

export default function ScrollSceneCanvas({ light, animated }: { light: boolean; animated: boolean }) {
  const count = useMemo(
    () => (typeof window !== 'undefined' && window.innerWidth < 768 ? 900 : 2800),
    []
  );
  return (
    <Canvas
      camera={{ fov: 60, near: 0.1, far: 80, position: [0, 0, 0] }}
      dpr={[1, 1.5]}
      frameloop={animated ? 'always' : 'demand'}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
    >
      <Scene light={light} animated={animated} count={count} />
    </Canvas>
  );
}
