'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { Chip } from '@/components/public/chip';
import { ChatInput } from '@/components/public/chat-input';
import { ExpandableAbstract } from '@/components/public/expandable-abstract';
import { HubSelector } from '@/components/public/hub-selector';
import { reveal, revealFadeOnly } from '@/lib/motion';

interface HeroProps {
  abstract: string;
  locale: 'en' | 'fr';
}

export function Hero({ abstract }: HeroProps) {
  const t = useTranslations('hero');
  const reduced = useReducedMotion();
  const variants = reduced ? revealFadeOnly : reveal;
  const inputRef = useRef<HTMLDivElement>(null);

  const handleChip = (question: string) => {
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Synthesize a submit event on the input form inside ChatInput.
    const form = inputRef.current?.querySelector('form');
    const input = form?.querySelector('input') as HTMLInputElement | null;
    if (!input || !form) return;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    setter?.call(input, question);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    setTimeout(() => form.requestSubmit(), 60);
  };

  return (
    <section
      className="relative mx-auto max-w-[960px] px-6 pt-[88px] pb-[80px] md:px-10 md:pt-[100px] lg:px-0 lg:pt-[112px]"
      aria-label="Hero"
    >
      <motion.div initial="hidden" animate="show" className="flex flex-col gap-11">
        {/* Hub selector — the visitor picks a destination before anything
            else. Internal anchors only: the hero stays outbound-link-free;
            the first real egress on the page is the journal section. */}
        <HubSelector revealOffset={0} />

        <motion.div variants={variants} custom={1}>
          <ExpandableAbstract text={abstract} limit={84} />
        </motion.div>

        <motion.div variants={variants} custom={2} ref={inputRef}>
          <ChatInput placeholder={t('chatPlaceholder')} />
        </motion.div>

        <motion.div variants={variants} custom={3} className="flex flex-wrap gap-2">
          <Chip onClick={() => handleChip(t('chip1'))}>{t('chip1')}</Chip>
          <Chip onClick={() => handleChip(t('chip2'))}>{t('chip2')}</Chip>
          <Chip onClick={() => handleChip(t('chip3'))}>{t('chip3')}</Chip>
        </motion.div>
      </motion.div>
    </section>
  );
}
