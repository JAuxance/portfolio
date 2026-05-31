'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { Chip } from '@/components/public/chip';
import { ChatInput } from '@/components/public/chat-input';
import { ExpandableAbstract } from '@/components/public/expandable-abstract';
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
      className="relative mx-auto max-w-[960px] px-6 pt-[100px] pb-[80px] md:px-10 md:pt-[140px] lg:px-0 lg:pt-[200px]"
      aria-label="Hero"
    >
      <motion.div initial="hidden" animate="show" className="flex flex-col gap-11">
        <motion.div variants={variants} custom={0}>
          <ExpandableAbstract text={abstract} />
        </motion.div>

        <motion.div variants={variants} custom={1} ref={inputRef}>
          <ChatInput placeholder={t('chatPlaceholder')} />
        </motion.div>

        <motion.div variants={variants} custom={2} className="flex flex-wrap gap-2">
          <Chip onClick={() => handleChip(t('chip1'))}>{t('chip1')}</Chip>
          <Chip onClick={() => handleChip(t('chip2'))}>{t('chip2')}</Chip>
          <Chip onClick={() => handleChip(t('chip3'))}>{t('chip3')}</Chip>
        </motion.div>
      </motion.div>
    </section>
  );
}
