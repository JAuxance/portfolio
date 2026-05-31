'use client';

import { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const Label = ({ children, className, ...rest }: { children: ReactNode; className?: string; htmlFor?: string }) => (
  <label
    className={cn(
      'font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]',
      className
    )}
    style={{ fontFamily: 'var(--font-mono)' }}
    {...rest}
  >
    {children}
  </label>
);

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-white/[0.08] bg-white/[0.025] px-3.5 py-2.5 text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none transition-colors',
        'focus:border-white/[0.20] focus:bg-white/[0.04]',
        className
      )}
      {...rest}
    />
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-white/[0.08] bg-white/[0.025] px-3.5 py-2.5 text-[14px] leading-[1.65] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none transition-colors resize-y',
        'focus:border-white/[0.20] focus:bg-white/[0.04]',
        className
      )}
      {...rest}
    />
  );
});

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'outline', size = 'md', className, ...rest },
  ref
) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'h-8 px-3 text-[12px]',
    md: 'h-10 px-4 text-[13px]',
  };
  const variants = {
    primary: 'bg-white text-black hover:bg-white/90',
    outline: 'border border-white/[0.08] bg-white/[0.025] text-[var(--color-text-primary)] hover:bg-white/[0.05] hover:border-white/[0.14]',
    ghost: 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/[0.04]',
    danger: 'text-[var(--color-text-tertiary)] hover:text-red-300',
  };
  return <button ref={ref} className={cn(base, sizes[size], variants[variant], className)} {...rest} />;
});

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        checked ? 'bg-white/30' : 'bg-white/[0.08]'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
      {label && <span className="sr-only">{label}</span>}
    </button>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-[var(--color-text-tertiary)]">{hint}</p>}
    </div>
  );
}

export function FormSurface({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.10] bg-white/[0.02] p-7',
        className
      )}
    >
      {children}
    </div>
  );
}
