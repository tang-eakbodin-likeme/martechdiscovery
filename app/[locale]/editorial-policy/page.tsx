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
    title: pick(locale, 'Editorial policy', 'นโยบายบรรณาธิการ'),
    description: pick(locale, 'Editorial content and sponsor disclosure standards for MarTech Discovery Platform', 'หลักเกณฑ์การจัดทำเนื้อหาและการเปิดเผยผู้สนับสนุน'),
  };
}

export default async function EditorialPolicyPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = (en: string, th: string) => pick(locale, en, th);
  return (
    <main id="main" className="route-main">
      <Breadcrumbs locale={locale} trail={[{ label: t('Editorial Policy', 'นโยบายบรรณาธิการ') }]} />
      <Eyebrow>{t('Editorial policy', 'นโยบายบรรณาธิการ')}</Eyebrow>
      <h1>{t('Independent, transparent, and consistent', 'อิสระ โปร่งใส และใช้เกณฑ์เดียวกัน')}</h1>
      <p className="route-intro">{t('We separate editorial information from commercial sponsorship so buyers can understand how provider information is presented.', 'เราแยกข้อมูลบรรณาธิการออกจากการสนับสนุนทางการค้า เพื่อให้ผู้ซื้อใช้ข้อมูลเปรียบเทียบได้อย่างเข้าใจที่มา')}</p>
      <section className="profile-section">
        <h2>{t('Editorial inclusion and evaluation', 'เกณฑ์การจัดทำเนื้อหา')}</h2>
        <p>{t('Providers cannot pay for directory inclusion, scores, rankings, or an Editor’s Pick. We apply published and consistent criteria to every provider.', 'ผู้ให้บริการไม่สามารถซื้อการถูกรวมในไดเรกทอรี คะแนน อันดับ หรือตำแหน่ง Editor’s Pick ได้ เราใช้เกณฑ์ที่เปิดเผยและสม่ำเสมอกับผู้ให้บริการทุกราย')}</p>
        <h2>{t('Sponsor disclosure', 'การเปิดเผยผู้สนับสนุน')}</h2>
        <p>{t('Sponsored content and placements are clearly labelled. Sponsor-submitted descriptions are identified as such and are not treated as independent verification of other product facts.', 'เนื้อหาและตำแหน่งที่ได้รับการสนับสนุนจะติดป้าย Sponsored อย่างชัดเจน คำอธิบายที่ผู้สนับสนุนส่งมาให้จะระบุที่มา และไม่ใช้แทนการตรวจสอบข้อเท็จจริงของข้อมูลอื่น')}</p>
        <h2>{t('Verification status', 'สถานะการตรวจสอบข้อมูล')}</h2>
        <p>{t('Some provider information is still being verified. Unconfirmed fields are labelled accordingly. Confirm product details, pricing, and PDPA readiness with the provider before making a decision.', 'ข้อมูลหลายส่วนของผู้ให้บริการยังอยู่ระหว่างตรวจสอบ รายการที่ยังไม่ได้ยืนยันจะแสดงสถานะตามจริง โปรดตรวจสอบรายละเอียดผลิตภัณฑ์ ราคา และความพร้อมด้าน PDPA กับผู้ให้บริการก่อนตัดสินใจ')}</p>
        <Link className="button" href={`/${locale}/buyer-guide/preview/`}>{t('Read our methodology →', 'อ่านวิธีประเมิน →')}</Link>
      </section>
    </main>
  );
}
