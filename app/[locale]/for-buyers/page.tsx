import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs, Eyebrow } from '@/components/SiteChrome';
import { isLocale, localeParams, pick } from '@/lib/i18n';

export const generateStaticParams = localeParams;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: pick(locale, 'For buyers', 'สำหรับผู้ซื้อ'),
    description: pick(locale, 'Discover, shortlist, and connect with MarTech providers.', 'ค้นหา บันทึก และติดต่อผู้ให้บริการ MarTech'),
  };
}

export default async function ForBuyersPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = (en: string, th: string) => pick(locale, en, th);
  return (
    <main id="main" className="route-main">
      <Breadcrumbs locale={locale} trail={[{ label: t('For Buyers', 'สำหรับผู้ซื้อ') }]} />
      <Eyebrow>{t('Start your search', 'เริ่มต้นค้นหา')}</Eyebrow>
      <h1>{t('Find the right MarTech for your next move', 'ค้นหา MarTech ที่เหมาะกับก้าวต่อไปของคุณ')}</h1>
      <p className="route-intro">{t('Search independently and build a shortlist that fits your goals.', 'ค้นหาอย่างอิสระ และจัดทำรายชื่อเครื่องมือที่ตรงกับเป้าหมาย')}</p>
      <div className="route-grid">
        <Link className="result-card" href={`/${locale}/tools/`}>
          <h2>{t('Search', 'ค้นหา')}</h2>
          <p>{t('Explore provider profiles by capability and region.', 'เลือกดูโปรไฟล์ผู้ให้บริการตามความสามารถและภูมิภาค')}</p>
          <b>{t('Open directory →', 'เปิดไดเรกทอรี →')}</b>
        </Link>
        <Link className="result-card" href={`/${locale}/categories/`}>
          <h2>{t('Explore categories', 'ดูหมวดหมู่')}</h2>
          <p>{t('Start with the problem your team needs to solve.', 'เริ่มจากโจทย์ที่ทีมต้องการแก้')}</p>
          <b>{t('Browse categories →', 'ดูหมวดหมู่ →')}</b>
        </Link>
      </div>
    </main>
  );
}
