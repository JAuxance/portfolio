import type {
  Profile,
  NowItem,
  Project,
  ResearchTopic,
  Reference,
  TrajectoryStation,
  ProjectStatus,
  StationState,
  Locale as PrismaLocale,
} from '@prisma/client';

export type { Profile, NowItem, Project, ResearchTopic, Reference, TrajectoryStation, ProjectStatus, StationState };
export type DBLocale = PrismaLocale;

export type ArchitectureLayer = {
  layer: string;
  primary: string;
  notesEn: string;
  notesFr: string;
};

export type Decision = {
  n: string;
  titleEn: string;
  titleFr: string;
  bodyEn: string;
  bodyFr: string;
};

export type Lesson = {
  label: 'TECHNICAL' | 'PRODUCT' | 'TEAM' | 'TRANSITION' | string;
  textEn: string;
  textFr: string;
};

export type LocaleParam = 'en' | 'fr';

export function pickLocaleField<T extends string | string[] | null | undefined>(
  en: T,
  fr: T,
  locale: LocaleParam
): T {
  return locale === 'fr' ? fr : en;
}
