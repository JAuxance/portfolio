'use client';

import { useTranslations } from 'next-intl';
import type { TrajectoryStation } from '@prisma/client';
import { Timeline } from '@/components/public/timeline';
import { SectionTitle } from '@/components/public/section-title';

interface TrajectorySectionProps {
  stations: TrajectoryStation[];
  locale: 'en' | 'fr';
}

export function TrajectorySection({ stations, locale }: TrajectorySectionProps) {
  const t = useTranslations('trajectory');

  return (
    <section
      id="trajectory"
      className="relative mx-auto max-w-[880px] px-6 py-[80px] md:py-[96px]"
      aria-label="Trajectory"
    >
      <SectionTitle className="mb-14 pl-[30px] md:pl-[40px] lg:pl-[48px]">
        {t('title')}
      </SectionTitle>

      <Timeline stations={stations} locale={locale} currentLabel={t('current')} />
    </section>
  );
}
