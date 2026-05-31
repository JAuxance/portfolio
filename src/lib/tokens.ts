export const colors = {
  bg: '#0A0A0B',
  bgElevated: '#0E0E10',
  textPrimary: '#E8E8EA',
  textSecondary: '#8A8A92',
  textTertiary: '#5A5A62',
  white: '#FFFFFF',
  glass: {
    fill: 'rgba(255,255,255,0.04)',
    fillHover: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.08)',
    borderHover: 'rgba(255,255,255,0.14)',
  },
  glow: {
    coolBlue: 'rgba(140, 178, 255, 0.035)',
    warmAmber: 'rgba(255, 217, 153, 0.030)',
    softViolet: 'rgba(191, 140, 255, 0.030)',
    warmOrange: 'rgba(255, 170, 120, 0.030)',
    white: 'rgba(255, 255, 255, 0.040)',
  },
} as const;

export const fonts = {
  display: 'var(--font-inter-tight), var(--font-inter), system-ui, sans-serif',
  body: 'var(--font-inter), system-ui, sans-serif',
  mono: 'var(--font-jetbrains), ui-monospace, monospace',
} as const;

export const tracking = {
  display: -0.03,
  displayTight: -0.025,
  display2: -0.02,
  body: -0.01,
  mono: 0,
  monoWide: 0.14,
  monoWider: 0.16,
} as const;

export const lineHeight = {
  display: 1.1,
  displayLoose: 1.18,
  heading: 1.12,
  body: 1.6,
  bodyTight: 1.5,
  mono: 1.5,
} as const;

export const radius = {
  sm: '6px',
  md: '8px',
  lg: '14px',
  xl: '16px',
  pill: '999px',
} as const;

export const spacing = {
  section: { y: 96, x: 80 },
  sectionTablet: { y: 80, x: 48 },
  sectionMobile: { y: 80, x: 24 },
  container: { desktop: 1280, narrow: 880, narrower: 700 },
} as const;
