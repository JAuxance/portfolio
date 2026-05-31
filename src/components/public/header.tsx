'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { NavLink } from './nav-link';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  const t = useTranslations('nav');
  const tLocale = useTranslations('locale');
  const locale = useLocale();
  const pathname = usePathname() ?? '/';
  const otherLocale = locale === 'en' ? 'fr' : 'en';
  const switched = pathname.startsWith(`/${locale}`)
    ? pathname.replace(`/${locale}`, `/${otherLocale}`)
    : `/${otherLocale}${pathname}`;

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b border-[var(--color-glass-border)]"
      style={{
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        background: 'color-mix(in srgb, var(--color-bg) 70%, transparent)',
      }}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 md:px-10 lg:px-20 h-[60px]">
        <Link
          href={`/${locale}`}
          className="text-[14px] font-semibold tracking-[-0.01em] text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Auxance
          <span className="ml-1 inline-block h-1.5 w-1.5 translate-y-[-2px] rounded-full bg-[var(--color-text-primary)] shadow-[0_0_8px_currentColor] opacity-70" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink href={`/${locale}#work`}>{t('work')}</NavLink>
          <NavLink href={`/${locale}#research`}>{t('research')}</NavLink>
          <NavLink href={`/${locale}#now`}>{t('now')}</NavLink>
          <NavLink href={`/${locale}#contact`}>{t('contact')}</NavLink>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href={switched}
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {locale.toUpperCase()} ⇄ {tLocale('switch')}
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
