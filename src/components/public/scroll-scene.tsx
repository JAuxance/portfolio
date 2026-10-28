'use client';

import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useTheme } from './theme-provider';

const Canvas = dynamic(() => import('./scroll-scene-canvas'), { ssr: false });

class WebGLBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * True when a hardware-accelerated WebGL context is available. With
 * `failIfMajorPerformanceCaveat`, Chrome/Brave refuse software rendering
 * (GPU blocklisted or hardware acceleration off), where the scene would crawl
 * at a few fps — the static backdrop is a better experience there.
 */
function webglUsable() {
  try {
    const c = document.createElement('canvas');
    const opts = { failIfMajorPerformanceCaveat: true };
    const gl = (c.getContext('webgl2', opts) ?? c.getContext('webgl', opts)) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

const MAX_RESTARTS = 3;

/**
 * The page's centerpiece: a fixed WebGL journey behind the content. The
 * camera flies through a particle tunnel and particles and planets as the page
 * scrolls, tinting from white → blue → violet → amber → teal.
 *
 * A CSS starfield sits underneath: it shows while three.js loads, and stays
 * if WebGL is unavailable or the GPU context is lost.
 */
export function ScrollScene() {
  const reduced = useReducedMotion();
  const { theme } = useTheme();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [generation, setGeneration] = useState(0);
  const restartTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setSupported(webglUsable());
    return () => clearTimeout(restartTimer.current);
  }, []);

  const onReady = useCallback(() => setReady(true), []);
  const onRestored = useCallback(() => {
    clearTimeout(restartTimer.current);
    setReady(true);
  }, []);
  // Context lost (GPU reset, too many contexts, backgrounded on mobile):
  // show the fallback, and remount the canvas if the browser does not restore it.
  const onLost = useCallback(() => {
    setReady(false);
    clearTimeout(restartTimer.current);
    restartTimer.current = setTimeout(() => {
      setGeneration((g) => (g < MAX_RESTARTS ? g + 1 : g));
    }, 1500);
  }, []);
  const onError = useCallback(() => {
    setReady(false);
    setSupported(false);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div
        className={cn(
          'starfield-fallback absolute inset-0 transition-opacity duration-700',
          ready ? 'opacity-0' : 'opacity-100'
        )}
      />
      {supported && (
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-700',
            ready ? 'opacity-100' : 'opacity-0'
          )}
        >
          <WebGLBoundary key={generation} onError={onError}>
            <Canvas
              light={theme === 'light'}
              animated={!reduced}
              onReady={onReady}
              onLost={onLost}
              onRestored={onRestored}
            />
          </WebGLBoundary>
        </div>
      )}
    </div>
  );
}
