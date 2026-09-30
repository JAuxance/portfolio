'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import type { Profile } from '@prisma/client';
import { ScrollText } from '@/components/public/scroll-text';
import { iconFor } from '@/components/public/brand-icons';
import { SectionTitle } from '@/components/public/section-title';

interface ContactSectionProps {
  profile: Profile;
  locale: 'en' | 'fr';
}

/**
 * The closing scene: the email is the answer, everything else supports it.
 * Horizontal: title + follow pills on top, blurb, then one wide email bar.
 */
export function ContactSection({ profile, locale }: ContactSectionProps) {
  const t = useTranslations('contact');
  const blurb = locale === 'fr' ? profile.contactBlurbFr : profile.contactBlurbEn;
  const [copied, setCopied] = useState(false);

  // LinkedIn and Read.cv stay in the DB but off the page by the owner's choice.
  const elsewhere = [
    { label: 'GitHub', href: profile.github },
    { label: 'X', href: profile.twitter },
  ].filter((s): s is { label: string; href: string } => !!s.href);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.emailPublic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — the mailto link still works
    }
  }

  return (
    <section
      id="contact"
      className="relative mx-auto max-w-[1120px] px-6 py-[96px] md:px-10 md:py-[140px]"
      aria-label="Contact"
    >
      {/* Row 1: title on the left, the elsewhere links on the right */}
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionTitle>{t('title')}</SectionTitle>

        {elsewhere.length > 0 && (
          <ul className="flex flex-wrap items-center gap-2.5" aria-label={t('follow')}>
            {elsewhere.map((s) => {
              const Icon = iconFor(s.label);
              return (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group glass-thin glass-hover inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 text-[14px] text-[var(--color-text-primary)] transition-colors"
                    style={{ borderRadius: 999 }}
                  >
                    {Icon && (
                      <Icon className="h-4 w-4 text-[var(--color-text-tertiary)] transition-colors group-hover:text-[var(--color-text-primary)]" />
                    )}
                    {s.label}
                    <ArrowUpRight
                      aria-hidden
                      className="h-3.5 w-3.5 text-[var(--color-text-tertiary)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-text-primary)]"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15%' }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-10 md:mt-14"
      >
        <ScrollText className="max-w-[560px] text-[16px] leading-[1.65] text-[var(--color-text-secondary)] md:text-[18px]">
          {blurb}
        </ScrollText>

        {/* Row 2: one wide bar — the email is the answer, copy sits at its end */}
        <div className="mt-8 flex flex-col gap-5 border-y border-[var(--color-glass-border-hover)] py-7 md:mt-10 md:flex-row md:items-center md:justify-between md:gap-8 md:py-9">
          <a
            href={`mailto:${profile.emailPublic}`}
            className="group relative inline-flex min-w-0 items-center gap-4 break-all text-[26px] font-semibold text-[var(--color-text-primary)] sm:text-[36px] md:text-[48px]"
            style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}
          >
            {profile.emailPublic}
            <ArrowUpRight
              aria-hidden
              className="h-[0.6em] w-[0.6em] shrink-0 text-[var(--color-text-tertiary)] transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[var(--color-text-primary)]"
            />
            <span
              aria-hidden
              className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-[var(--color-text-primary)] transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:scale-x-100"
            />
          </a>

          <button
            type="button"
            onClick={copyEmail}
            className="glass-thin glass-hover inline-flex shrink-0 items-center gap-2 self-start rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)] md:self-auto"
            style={{ fontFamily: 'var(--font-mono)', borderRadius: 999 }}
          >
            {copied ? (
              <Check aria-hidden className="h-3.5 w-3.5" />
            ) : (
              <Copy aria-hidden className="h-3.5 w-3.5" />
            )}
            {copied ? t('copied') : t('copy')}
          </button>
        </div>
      </motion.div>
    </section>
  );
}
