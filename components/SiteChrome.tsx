import Link from 'next/link';
import { otherLocale, pick, type Locale } from '@/lib/i18n';
import { AccountLinks, LanguageLink, ThemeToggle } from './SiteChromeClient';

const Brand = ({ locale }: { locale: Locale }) => (
  <Link className="brand" href={`/${locale}/`}>
    <span className="brandmark"><img src="/assets/platform-discovery-mark.png" alt="" /></span>
    <span>MARTECH<br /><b>DISCOVERY</b></span>
  </Link>
);

export function Header({ locale }: { locale: Locale }) {
  const t = (en: string, th: string) => pick(locale, en, th);
  return (
    <header className="top">
      <Brand locale={locale} />
      <nav>
        <Link href={`/${locale}/categories/`}>{t('Categories', 'หมวดหมู่')}</Link>
        <Link href={`/${locale}/buyer-guide/`}>{t('Buyer Guide', 'คู่มือเลือกซื้อ')}</Link>
        <Link href={`/${locale}/for-buyers/`}>{t('For Buyers', 'สำหรับผู้ซื้อ')}</Link>
        <Link href={`/${locale}/for-providers/`}>{t('For Providers', 'สำหรับผู้ให้บริการ')}</Link>
      </nav>
      <div className="actions">
        <LanguageLink locale={locale} target={otherLocale(locale)} />
        <ThemeToggle />
        <AccountLinks locale={locale} />
        <Link className="button small" href={`/${locale}/tools/`}>{t('Explore tools', 'สำรวจเครื่องมือ')}</Link>
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
  return (
    <div className="breadcrumbs">
      <Link href={`/${locale}/`}>{pick(locale, 'Home', 'หน้าหลัก')}</Link>
      {trail.map((item) => (
        <span key={item.label}> / {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}</span>
      ))}
    </div>
  );
}

/** Small label above a page or section title, with the "/" marker. */
export const Eyebrow = ({ children }: { children: React.ReactNode }) => <div className="eyebrow"><i>/</i> {children}</div>;
