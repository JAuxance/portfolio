'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { Profile } from '@prisma/client';
import { SectionTitle } from '@/components/public/section-title';
import { substackHomeUrl, substackConfigured } from '@/lib/substack';

interface ContactSectionProps {
  profile: Profile;
  locale: 'en' | 'fr';
}

/**
 * The closing scene: the email is the answer, everything else supports it.
 * Left — blurb + giant mailto + one-click copy. Right — the Follow index,
 * same hairline-row grammar as the journal and work sections.
 */
export function ContactSection({ profile, locale }: ContactSectionProps) {
  const t = useTranslations('contact');
  const tJournal = useTranslations('journal');
  const blurb = locale === 'fr' ? profile.contactBlurbFr : profile.contactBlurbEn;
  const [copied, setCopied] = useState(false);

  // The terminal identity directory: GitHub, X, and the journal. LinkedIn and
  // Read.cv stay in the DB but off the page by the owner's choice.
  const elsewhere = [
    { label: 'GitHub', href: profile.github },
    { label: 'X', href: profile.twitter },
    { label: tJournal('via'), href: substackConfigured ? substackHomeUrl : null },
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
      className="relative mx-auto max-w-[880px] px-6 py-[80px] md:py-[96px]"
      aria-label="Contact"
    >
      <SectionTitle className="mb-12">{t('title')}</SectionTitle>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15%' }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_280px] md:gap-16"
      >
        {/* The ask */}
        <div className="flex flex-col items-start gap-6">
          <p className="max-w-[480px] text-[16px] leading-[1.65] text-[var(--color-text-secondary)]">
            {blurb}
          </p>
          <a
            href={`mailto:${profile.emailPublic}`}
            className="break-all text-[24px] font-semibold text-[var(--color-text-primary)] transition-opacity hover:opacity-80 md:text-[30px]"
            style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.01em' }}
          >
            {profile.emailPublic}
          </a>
          <button
            type="button"
            onClick={copyEmail}
            className="glass-thin glass-hover inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-mono)', borderRadius: 999 }}
          >
            {copied ? `${t('copied')} ✓` : t('copy')}
          </button>
        </div>

        {/* The Follow index */}
        {elsewhere.length > 0 && (
          <div>
            <p
              className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {t('follow')}
            </p>
            <ul className="flex flex-col">
              {elsewhere.map((s) => (
                <li
                  key={s.label}
                  className="group border-t border-[var(--color-glass-border)] last:border-b"
                >
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-baseline justify-between gap-6 py-4"
                  >
                    <span className="text-[14px] text-[var(--color-text-primary)]">{s.label}</span>
                    <span
                      aria-hidden
                      className="text-[13px] text-[var(--color-text-tertiary)] transition-colors group-hover:text-[var(--color-text-primary)]"
                    >
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </section>
  );
}
