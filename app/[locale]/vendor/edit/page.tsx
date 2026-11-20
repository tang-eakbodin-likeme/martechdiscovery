import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { VendorEditForm } from '@/components/VendorEditForm';
import { Breadcrumbs, Eyebrow } from '@/components/SiteChrome';
import { isLocale, localeParams, pick } from '@/lib/i18n';
import { CAPS, sampleContent, sampleVendor } from '@/lib/profiles';
import { categories, categoryName } from '@/lib/catalog';

export const generateStaticParams = localeParams;
export const dynamicParams = false;
type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: pick(locale, 'Edit your profile', 'แก้ไขโปรไฟล์'), robots: { index: false } };
}

export default async function VendorEditPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = (en: string, th: string) => pick(locale, en, th);
  return (
    <main id="main" className="route-main vendor-edit">
      <Breadcrumbs locale={locale} trail={[{ label: t('Vendor', 'ผู้ให้บริการ') }, { label: t('Edit profile', 'แก้ไขโปรไฟล์') }]} />
      <Eyebrow>{t('Your profile', 'โปรไฟล์ของคุณ')}</Eyebrow>
      {/* the demo vendor owns the sample profile; Phase 2 loads the signed-in vendor's own profile */}
      <VendorEditForm locale={locale} caps={CAPS} vendor={sampleVendor(true)} content={sampleContent(true)} freeContent={sampleContent(false)}
        cats={categories.map((c) => ({ slug: c.slug, name: categoryName(c, locale) }))} />
      <p className="disclosure">{t('This page is a prototype. Requests are kept in this browser only and do not reach the MarTech Discovery team yet.', 'หน้านี้เป็นต้นแบบ คำขอจะถูกเก็บไว้ในเบราว์เซอร์นี้เท่านั้น และยังไม่ถูกส่งถึงทีม MarTech Discovery')}</p>
    </main>
  );
}
