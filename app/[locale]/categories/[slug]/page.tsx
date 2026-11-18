import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs, Eyebrow } from '@/components/SiteChrome';
import { VendorCard } from '@/components/VendorCard';
import { categories, categoryDescription, categoryName, getCategory, vendorsIn } from '@/lib/catalog';
import { isLocale, LOCALES, pick } from '@/lib/i18n';

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.flatMap((locale) => categories.map((c) => ({ locale, slug: c.slug })));
type Params = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const c = getCategory(slug);
  if (!isLocale(locale) || !c) return {};
  return { title: categoryName(c, locale), description: categoryDescription(c, locale) };
}

export default async function CategoryPage({ params }: Params) {
  const { locale, slug } = await params;
  const c = getCategory(slug);
  if (!isLocale(locale) || !c) notFound();
  const t = (en: string, th: string) => pick(locale, en, th);
  const list = vendorsIn(slug).sort((a, b) => Number(b.sponsored) - Number(a.sponsored));
  return (
    <main className="route-main">
      <Breadcrumbs locale={locale} trail={[{ label: t('Categories', 'หมวดหมู่'), href: `/${locale}/categories/` }, { label: categoryName(c, locale) }]} />
      <Eyebrow>{t('Category', 'หมวดหมู่')}</Eyebrow>
      <h1>{categoryName(c, locale)}</h1>
      <p className="route-intro">{categoryDescription(c, locale)}</p>
      <div className="route-grid">
        {list.length ? list.map((v) => <VendorCard key={v.slug} vendor={v} locale={locale} />) : (
          <div className="empty-state">
            <p className="route-intro">{t('No profiles are classified in this category yet. Vendor categories are being verified.', 'ยังไม่มีโปรไฟล์ในหมวดนี้ ข้อมูลการจัดหมวดหมู่กำลังอยู่ระหว่างตรวจสอบ')}</p>
            <Link className="button small" href={`/${locale}/tools/`}>{t('Browse all providers', 'ดูผู้ให้บริการทั้งหมด')}</Link>
          </div>
        )}
      </div>
      <p className="disclosure">
        {t('Category placements are suggested and awaiting verification. Provider facts are still being reviewed. Featured placements are paid and labelled.',
          'ข้อมูลผู้ให้บริการอิงข้อเท็จจริง ตำแหน่งที่ชำระเงินติดป้ายแนะนำ และไม่มีผลต่อการเรียงหมวดหมู่ทั่วไป')}
      </p>
    </main>
  );
}
