import { getTranslations } from 'next-intl/server';

export async function Footer() {
  const t = await getTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-32 border-t border-[var(--color-glass-border)]">
      <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-3 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-20">
        <p
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          © {year} · Auxance Jourdan
        </p>
        <a
          href="https://github.com/JAuxance/portfolio"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {t('viewSource')} ↗
        </a>
      </div>
    </footer>
  );
}
