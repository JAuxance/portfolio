'use client';

import { Component, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';
import { useTheme } from './theme-provider';

const Canvas = dynamic(() => import('./scroll-scene-canvas'), { ssr: false });

class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * The page's centerpiece: a fixed WebGL journey behind the content. The
 * camera flies through a particle tunnel and ring "stations" as the page
 * scrolls, tinting from white → blue → violet → amber → teal.
 */
export function ScrollScene() {
  const reduced = useReducedMotion();
  const { theme } = useTheme();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <WebGLBoundary>
        <Canvas light={theme === 'light'} animated={!reduced} />
      </WebGLBoundary>
    </div>
  );
}
