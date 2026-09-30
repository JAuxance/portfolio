'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DEPTH = 140; // how far the camera travels along -z

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


/* ── Planets ───────────────────────────────────────────────────────────
   Same visual language as the tunnel: hairlines and dots, tinted by the
   shared accent. Three flavours — dotted globe, lat/long wireframe, and a
   dark "eclipse" disc that hides the stars behind it.                     */

type PlanetKind = 'dots' | 'lines' | 'eclipse';

interface PlanetSpec {
  kind: PlanetKind;
  radius: number;
  x: number;
  y: number;
  z: number;
  tilt: number;
  ring?: boolean;
  moon?: boolean;
}

const PLANETS: PlanetSpec[] = [
  { kind: 'dots', radius: 4.2, x: 9.5, y: 1.8, z: -18, tilt: 0.5, ring: true },
  { kind: 'lines', radius: 5, x: -10.5, y: -2.2, z: -44, tilt: -0.4, ring: true },
  { kind: 'eclipse', radius: 4.4, x: 9.5, y: -2.4, z: -70, tilt: 0.35, ring: true },
  { kind: 'dots', radius: 3.2, x: -9.5, y: 2.8, z: -94, tilt: 0.7, moon: true },
  { kind: 'lines', radius: 4.6, x: 10, y: 0.6, z: -120, tilt: -0.6, ring: true },
];

function dotsGeometry(radius: number, n = 1500) {
  const arr = new Float32Array(n * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = i * golden;
    arr[i * 3] = Math.cos(a) * r * radius;
    arr[i * 3 + 1] = y * radius;
    arr[i * 3 + 2] = Math.sin(a) * r * radius;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  return g;
}

function latLonGeometry(radius: number) {
  const seg = 64;
  const pts: number[] = [];
  const push = (a: THREE.Vector3, b: THREE.Vector3) => pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
  for (const lat of [-60, -30, 0, 30, 60]) {
    const phi = (lat * Math.PI) / 180;
    for (let i = 0; i < seg; i++) {
      const t0 = (i / seg) * Math.PI * 2;
      const t1 = ((i + 1) / seg) * Math.PI * 2;
      const at = (t: number) =>
        new THREE.Vector3(
          Math.cos(phi) * Math.cos(t) * radius,
          Math.sin(phi) * radius,
          Math.cos(phi) * Math.sin(t) * radius
        );
      push(at(t0), at(t1));
    }
  }
  for (let m = 0; m < 6; m++) {
    const theta = (m / 6) * Math.PI;
    const at = (t: number) =>
      new THREE.Vector3(
        Math.cos(t) * Math.cos(theta) * radius,
        Math.sin(t) * radius,
        Math.cos(t) * Math.sin(theta) * radius
      );
    for (let i = 0; i < seg; i++) {
      push(at((i / seg) * Math.PI * 2), at(((i + 1) / seg) * Math.PI * 2));
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

function circleGeometry(radius: number) {
  const pts = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2).getPoints(120);
  return new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p.x, p.y, 0)));
}

interface PlanetProps {
  spec: PlanetSpec;
  index: number;
  dot: THREE.Texture;
  shown: React.MutableRefObject<THREE.Color>;
  light: boolean;
  animated: boolean;
}

function Planet({ spec, index, dot, shown, light, animated }: PlanetProps) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const moon = useRef<THREE.Group>(null);
  const { kind, radius, ring, moon: hasMoon } = spec;

  const geometry = useMemo(
    () => (kind === 'dots' ? dotsGeometry(radius) : kind === 'lines' ? latLonGeometry(radius) : null),
    [kind, radius]
  );
  const ringGeo = useMemo(() => circleGeometry(radius * 1.65), [radius]);
  const orbitGeo = useMemo(() => circleGeometry(radius * 2.4), [radius]);
  const outline = useMemo(() => circleGeometry(radius), [radius]);
  const blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
  const bg = light ? '#F6F5F1' : '#0A0A0B';

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const ahead = state.camera.position.z - spec.z; // >0 while the planet is in front
    const fade = Math.min(1, Math.max(0, (ahead - 3) / 7)) * Math.min(1, Math.max(0, (ahead + 6) / 6));
    if (animated && body.current) body.current.rotation.y = t * 0.12 + index;
    if (animated && moon.current) moon.current.rotation.z = t * 0.35 + index;
    group.current.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | undefined;
      if (!m || o.userData.keep) {
        if (m && o.userData.keep) m.opacity = fade;
        return;
      }
      (m as THREE.LineBasicMaterial).color.copy(shown.current);
      m.opacity = (o.userData.alpha ?? 0.5) * fade;
    });
  });

  return (
    <group
      ref={group}
      position={[spec.x, spec.y, spec.z]}
      rotation={[spec.tilt, 0, spec.tilt * 0.6]}
    >
      {/* atmosphere: a soft glow behind the body */}
      <points userData={{ alpha: kind === 'eclipse' ? 0.55 : 0.4 }}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[new Float32Array([0, 0, -0.5]), 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={radius * 4.2}
          sizeAttenuation
          transparent
          map={dot}
          depthWrite={false}
          blending={blending}
        />
      </points>

      <group ref={body}>
        {/* solid core: hides the far side so the globe reads as a volume */}
        <mesh userData={{ keep: true }}>
          <sphereGeometry args={[radius * 0.985, 48, 32]} />
          <meshBasicMaterial color={bg} transparent />
        </mesh>
        {kind === 'dots' && geometry && (
          <points geometry={geometry} userData={{ alpha: 1 }}>
            <pointsMaterial
              size={0.17}
              sizeAttenuation
              transparent
              map={dot}
              alphaTest={0.02}
              depthWrite={false}
              blending={blending}
            />
          </points>
        )}
        {kind === 'lines' && geometry && (
          <lineSegments geometry={geometry} userData={{ alpha: 0.75 }}>
            <lineBasicMaterial transparent depthWrite={false} blending={blending} />
          </lineSegments>
        )}
        {kind === 'eclipse' && (
          <lineLoop geometry={outline} userData={{ alpha: 1 }}>
            <lineBasicMaterial transparent depthWrite={false} blending={blending} />
          </lineLoop>
        )}
      </group>

      {ring && (
        <>
          <lineLoop geometry={ringGeo} rotation={[Math.PI / 2.4, 0, 0]} userData={{ alpha: 0.85 }}>
            <lineBasicMaterial transparent depthWrite={false} blending={blending} />
          </lineLoop>
          <lineLoop
            geometry={ringGeo}
            rotation={[Math.PI / 2.4, 0, 0]}
            scale={1.22}
            userData={{ alpha: 0.35 }}
          >
            <lineBasicMaterial transparent depthWrite={false} blending={blending} />
          </lineLoop>
        </>
      )}

      {hasMoon && (
        <>
          <lineLoop geometry={orbitGeo} rotation={[Math.PI / 2.8, 0, 0]} userData={{ alpha: 0.3 }}>
            <lineBasicMaterial transparent depthWrite={false} blending={blending} />
          </lineLoop>
          <group ref={moon} rotation={[Math.PI / 2.8, 0, 0]}>
            <points position={[radius * 2.4, 0, 0]} userData={{ alpha: 1 }}>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[new Float32Array([0, 0, 0]), 3]} />
              </bufferGeometry>
              <pointsMaterial
                size={0.8}
                sizeAttenuation
                transparent
                map={dot}
                alphaTest={0.02}
                depthWrite={false}
                blending={blending}
              />
            </points>
          </group>
        </>
      )}
    </group>
  );
}

interface SceneProps {
  light: boolean;
  animated: boolean;
  count: number;
}

function Scene({ light, animated, count }: SceneProps) {
  const points = useRef<THREE.Points>(null);
  const progress = useRef(0);
  const target = useRef(0);
  const dot = useMemo(() => makeDot(), []);
  const accent = useMemo(() => new THREE.Color(), []);
  const shownRef = useRef(new THREE.Color());

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
    shownRef.current.copy(shown);

    // The journey: fly forward, drift with the pointer, roll slightly.
    state.camera.position.z = -p * DEPTH;
    state.camera.position.x += (state.pointer.x * 0.7 - state.camera.position.x) * 0.04;
    state.camera.position.y += (state.pointer.y * 0.5 - state.camera.position.y) * 0.04;
    state.camera.rotation.z = animated ? p * Math.PI * 0.6 + Math.sin(t * 0.15) * 0.02 : 0;

    if (points.current) {
      (points.current.material as THREE.PointsMaterial).color.copy(shown);
    }
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
      {PLANETS.map((spec, i) => (
        <Planet
          key={i}
          spec={spec}
          index={i}
          dot={dot}
          shown={shownRef}
          light={light}
          animated={animated}
        />
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
      flat
      camera={{ fov: 60, near: 0.1, far: 80, position: [0, 0, 0] }}
      dpr={[1, 1.5]}
      frameloop={animated ? 'always' : 'demand'}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
    >
      <Scene light={light} animated={animated} count={count} />
    </Canvas>
  );
}
