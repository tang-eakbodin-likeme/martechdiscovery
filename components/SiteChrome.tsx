import Link from 'next/link';
import { pick, type Locale } from '@/lib/i18n';
import { AccountMenu, LanguageSwitch, MobileMenu, NavLinks, ThemeToggle } from './SiteChromeClient';

const Brand = ({ locale }: { locale: Locale }) => (
  <Link className="brand" href={`/${locale}/`}>
    <span className="brandmark"><img src="/assets/platform-discovery-mark-128.png" alt="" /></span>
    <span>MARTECH<br /><b>DISCOVERY</b></span>
  </Link>
);

export function Header({ locale }: { locale: Locale }) {
  const t = (en: string, th: string) => pick(locale, en, th);
  return (
    <header className="top">
      <Brand locale={locale} />
      <NavLinks locale={locale} />
      <div className="actions">
        <LanguageSwitch locale={locale} />
        <ThemeToggle />
        <AccountMenu locale={locale} />
        <Link className="button small" href={`/${locale}/tools/`}>{t('Explore tools', 'สำรวจเครื่องมือ')}</Link>
        <MobileMenu locale={locale} />
      </div>
    </header>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  const t = (en: string, th: string) => pick(locale, en, th);
  return (
    <footer>
      <Brand locale={locale} />
      <p>{t('An independent MarTech directory for Thailand and Southeast Asia', 'ไดเรกทอรี MarTech อิสระสำหรับไทยและเอเชียตะวันออกเฉียงใต้')}</p>
      <div className="foot-links">
        <Link href={`/${locale}/tools/`}>{t('Directory', 'ไดเรกทอรี')}</Link>
        <Link href={`/${locale}/buyer-guide/`}>{t('Buyer Guide', 'คู่มือเลือกซื้อ')}</Link>
        <Link href={`/${locale}/for-providers/`}>{t('For Providers', 'สำหรับผู้ให้บริการ')}</Link>
        <Link href={`/${locale}/editorial-policy/`}>{t('Editorial Policy', 'นโยบายบรรณาธิการ')}</Link>
      </div>
      <small>© 2027 MarTech Discovery Platform · Thailand</small>
    </footer>
  );
}

export function Breadcrumbs({ locale, trail }: { locale: Locale; trail: { label: string; href?: string }[] }) {
  if (trail.length < 2) return null;
  return (
    <div className="breadcrumbs">
      <Link href={`/${locale}/`}>{pick(locale, 'Home', 'หน้าหลัก')}</Link>
      {trail.map((item, i) => (
        <span key={item.label}><i aria-hidden="true">›</i>{item.href ? <Link href={item.href}>{item.label}</Link> : i === trail.length - 1 ? <b>{item.label}</b> : item.label}</span>
      ))}
    </div>
  );
}

/** Small label above a page or section title, with the "/" marker. */
export const Eyebrow = ({ children }: { children: React.ReactNode }) => <div className="eyebrow"><i>/</i> {children}</div>;
