import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DirectoryBrowser } from '@/components/DirectoryBrowser';
import { Breadcrumbs, Eyebrow } from '@/components/SiteChrome';
import { VendorCard } from '@/components/VendorCard';
import { categories, categoryName, vendors } from '@/lib/catalog';
import { isLocale, localeParams, pick } from '@/lib/i18n';
import { profileFor } from '@/lib/profiles';

export const generateStaticParams = localeParams;
export const dynamicParams = false;
type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: pick(locale, 'MarTech tools directory', 'ไดเรกทอรีเครื่องมือ MarTech') };
}

export default async function ToolsPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = (en: string, th: string) => pick(locale, en, th);
  const items = vendors.map((v) => {
    const name = profileFor(v.slug)?.productName || v.name;
    return { slug: v.slug, name, company: v.name.toLocaleLowerCase(), categories: v.categories, card: <VendorCard vendor={v} locale={locale} /> };
  });
  return (
    <main className="route-main">
      <Breadcrumbs locale={locale} trail={[{ label: t('Directory', 'ไดเรกทอรี') }]} />
      <Eyebrow>{t('Discovery directory', 'ไดเรกทอรีค้นหา')}</Eyebrow>
      <h1>{t('MarTech tools directory', 'ไดเรกทอรีเครื่องมือ MarTech')}</h1>
      <p className="route-intro">{t('Search and filter providers by company name and category.', 'ค้นหาและกรองผู้ให้บริการตามชื่อและหมวดหมู่')}</p>
      <DirectoryBrowser locale={locale} items={items} categories={categories.map((c) => ({ slug: c.slug, label: categoryName(c, locale) }))} />
    </main>
  );
}
