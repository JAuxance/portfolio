'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { Profile } from '@prisma/client';
import { SectionTitle } from '@/components/public/section-title';

interface ContactSectionProps {
  profile: Profile;
  locale: 'en' | 'fr';
}

export function ContactSection({ profile, locale }: ContactSectionProps) {
  const t = useTranslations('contact');
  const blurb = locale === 'fr' ? profile.contactBlurbFr : profile.contactBlurbEn;

  const socials = [
    { label: 'GitHub', href: profile.github },
    { label: 'LinkedIn', href: profile.linkedin },
    { label: 'Twitter', href: profile.twitter },
    { label: 'Read.cv', href: profile.readcv },
  ].filter((s): s is { label: string; href: string } => !!s.href);

  return (
    <section
      id="contact"
      className="relative mx-auto max-w-[880px] px-6 py-[80px] md:py-[96px] text-center md:text-left"
      aria-label="Contact"
    >
      <SectionTitle className="mb-12">{t('title')}</SectionTitle>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15%' }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col gap-5"
      >
        <p
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {t('reachOut')}
        </p>
        <a
          href={`mailto:${profile.emailPublic}`}
          className="text-[22px] md:text-[28px] font-semibold text-[var(--color-text-primary)] hover:opacity-80 transition-opacity"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.01em' }}
        >
          {profile.emailPublic}
        </a>
        <p className="max-w-[560px] text-[16px] leading-[1.6] text-[var(--color-text-secondary)]">{blurb}</p>

        {socials.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:justify-start">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1 text-[14px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {s.label}
                <span className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-primary)]">↗</span>
              </a>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
