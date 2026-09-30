'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Chip } from '@/components/public/chip';
import { ChatInput } from '@/components/public/chat-input';
import { ExpandableAbstract } from '@/components/public/expandable-abstract';
import { HubSelector } from '@/components/public/hub-selector';
import { reveal, revealFadeOnly } from '@/lib/motion';

interface HeroProps {
  abstract: string;
  locale: 'en' | 'fr';
  hasBook: boolean;
}

export function Hero({ abstract, hasBook }: HeroProps) {
  const t = useTranslations('hero');
  const reduced = useReducedMotion();
  const variants = reduced ? revealFadeOnly : reveal;
  const inputRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll-linked exit: the hero recedes as the next section takes over.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const heroBlur = useTransform(scrollYProgress, [0, 1], ['blur(0px)', 'blur(6px)']);
  const exitStyle = reduced
    ? undefined
    : { scale: heroScale, opacity: heroOpacity, y: heroY, filter: heroBlur };

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
      ref={sectionRef}
      className="relative mx-auto max-w-[960px] px-6 pt-[88px] pb-[80px] md:px-10 md:pt-[100px] lg:px-0 lg:pt-[112px]"
      aria-label="Hero"
    >
      <motion.div style={exitStyle} className="origin-top">
      <motion.div initial="hidden" animate="show" className="flex flex-col gap-11">
        {/* The visitor chooses a destination before anything else. */}
        <HubSelector revealOffset={0} hasBook={hasBook} />

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
      </motion.div>
    </section>
  );
}
