import { cn } from '@/lib/cn';

interface HeatherLogoProps {
  size?: number;
  className?: string;
  /** Subtle pulse animation on the inner dot */
  animated?: boolean;
  /** Render a unique gradient id (use when multiple instances are on the page) */
  id?: string;
}

/**
 * Heather — Auxance's AI assistant.
 * A small orb: gradient halo (cool blue → soft violet) with a bright white core.
 * Echoes the atmospheric glow palette used across the site.
 */
export function HeatherLogo({ size = 24, className, animated = false, id = 'heather' }: HeatherLogoProps) {
  const haloId = `${id}-halo`;
  const coreId = `${id}-core`;
  const ringId = `${id}-ring`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Heather"
      className={cn('inline-block', className)}
    >
      <defs>
        <radialGradient id={haloId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="35%" stopColor="rgba(140,178,255,0.65)" />
          <stop offset="75%" stopColor="rgba(191,140,255,0.35)" />
          <stop offset="100%" stopColor="rgba(191,140,255,0)" />
        </radialGradient>
        <radialGradient id={coreId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
        </radialGradient>
        <linearGradient id={ringId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(140,178,255,0.6)" />
          <stop offset="100%" stopColor="rgba(191,140,255,0.4)" />
        </linearGradient>
      </defs>

      {/* outer halo */}
      <circle cx="16" cy="16" r="15" fill={`url(#${haloId})`} opacity="0.9" />
      {/* thin ring */}
      <circle cx="16" cy="16" r="9.5" fill="none" stroke={`url(#${ringId})`} strokeWidth="0.7" opacity="0.7" />
      {/* bright core */}
      <circle cx="16" cy="16" r="3.6" fill={`url(#${coreId})`}>
        {animated && (
          <animate
            attributeName="r"
            values="3.6;4.4;3.6"
            dur="2.4s"
            repeatCount="indefinite"
          />
        )}
      </circle>
    </svg>
  );
}
