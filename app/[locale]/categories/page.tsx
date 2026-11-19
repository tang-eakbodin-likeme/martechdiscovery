import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs, Eyebrow } from '@/components/SiteChrome';
import { categories, categoryDescription, categoryName } from '@/lib/catalog';
import { isLocale, localeParams, pick } from '@/lib/i18n';

export const generateStaticParams = localeParams;
export const dynamicParams = false;
type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: pick(locale, 'Explore MarTech categories', 'สำรวจหมวดหมู่ MarTech') };
}

export default async function CategoriesPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = (en: string, th: string) => pick(locale, en, th);
  return (
    <main id="main" className="route-main">
      <Breadcrumbs locale={locale} trail={[{ label: t('Categories', 'หมวดหมู่') }]} />
      <Eyebrow>{t('Discover by capability', 'ค้นหาตามความสามารถ')}</Eyebrow>
      <h1>{t('Explore MarTech categories', 'สำรวจหมวดหมู่ MarTech')}</h1>
      <p className="route-intro">{t('Browse marketing technology by capability and team goals.', 'ค้นหาโซลูชันตามความสามารถและเป้าหมายของทีม')}</p>
      <div className="route-grid">
        {categories.map((c) => (
          <Link key={c.slug} className="result-card" href={`/${locale}/categories/${c.slug}/`}>
            <span className="eyebrow">{c.group}</span>
            <h2>{categoryName(c, locale)}</h2>
            <p>{categoryDescription(c, locale)}</p>
            <b>{t('Explore category', 'ดูหมวดหมู่')}</b>
          </Link>
        ))}
      </div>
    </main>
  );
}
