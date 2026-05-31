import type { Variants } from 'framer-motion';

export const ease = {
  outQuint: [0.22, 1, 0.36, 1] as [number, number, number, number],
  spring: [0.32, 0.72, 0, 1] as [number, number, number, number],
  inOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

export const duration = {
  instant: 0.15,
  quick: 0.25,
  standard: 0.35,
  gentle: 0.6,
  page: 0.8,
};

export const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.gentle,
      delay: i * 0.08,
      ease: ease.outQuint,
    },
  }),
};

export const revealFadeOnly: Variants = {
  hidden: { opacity: 0 },
  show: (i: number = 0) => ({
    opacity: 1,
    transition: { duration: duration.gentle, delay: i * 0.04 },
  }),
};

export const hoverCard: Variants = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -4,
    scale: 1.005,
    transition: { duration: duration.standard, ease: ease.outQuint },
  },
};

export const hoverButton: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.06,
    transition: { duration: duration.quick, ease: ease.spring },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};
