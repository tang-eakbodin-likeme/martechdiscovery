import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs, Eyebrow } from '@/components/SiteChrome';
import { categories, categoryName } from '@/lib/catalog';
import { isLocale, localeParams, pick } from '@/lib/i18n';

export const generateStaticParams = localeParams;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: pick(locale, 'Buyer Guide preview', 'ตัวอย่าง Buyer Guide'),
    description: 'Free preview: executive summary, methodology, 18-category map, and a practical MarTech buying framework.',
  };
}

const steps: [string, string][] = [
  ['Define the business need and desired outcomes.', 'กำหนดโจทย์และผลลัพธ์ที่ต้องการ'],
  ['Build a shortlist using published capabilities and criteria.', 'ทำ shortlist ด้วยความสามารถและเกณฑ์ที่ประกาศไว้'],
  ['Verify market availability, language, integrations, security, and total cost.', 'ตรวจสอบการรองรับประเทศ ภาษา การเชื่อมต่อ ความปลอดภัย และต้นทุนรวม'],
  ['Validate real workflows through a demo and proof of concept.', 'ทดสอบ workflow จริงผ่าน Demo และ POC ก่อนตัดสินใจ'],
];

export default async function BuyerGuidePreviewPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = (en: string, th: string) => pick(locale, en, th);
  return (
    <main className="route-main">
      <Breadcrumbs locale={locale} trail={[{ label: t('Buyer Guide', 'คู่มือเลือกซื้อ') }, { label: 'Preview' }]} />
      <Eyebrow>{t('Ungated preview · executive summary + methodology', 'ตัวอย่างที่อ่านได้ฟรี · executive summary + methodology')}</Eyebrow>
      <h1>{t('Buyer Guide preview', 'ตัวอย่าง Buyer Guide')}</h1>
      <p className="route-intro">{t('Read the executive summary, 18-category map, and methodology free. The comparison matrix and full provider profiles are reserved for the complete guide.', 'อ่านบทสรุป แผนผัง 18 หมวด และวิธีประเมินได้ฟรี ก่อนดาวน์โหลด Comparison Matrix และโปรไฟล์ผู้ให้บริการฉบับเต็ม')}</p>
      <section className="profile-section guide-preview-section">
        <h2>{t('Make MarTech decisions for the Thai market', 'เลือก MarTech ให้เหมาะกับบริบทไทย')}</h2>
        <p>{t('Evaluate LINE OA integration, PDPA readiness, data residency, THB pricing, Thai-language support, and local implementation partners alongside product capabilities.', 'พิจารณาการเชื่อมต่อ LINE OA ความพร้อมด้าน PDPA และ Data Residency ราคาเงินบาท การรองรับภาษาไทย และพาร์ตเนอร์ที่ติดตั้งได้ในประเทศ')}</p>
        <h2>{t('18-category map', 'แผนผัง 18 หมวดหมู่')}</h2>
        <div className="preview-category-grid">
          {categories.map((c, i) => (
            <Link key={c.slug} href={`/${locale}/categories/${c.slug}/`}><span>{String(i + 1).padStart(2, '0')}</span>{categoryName(c, locale)} <b>↗</b></Link>
          ))}
        </div>
        <h2>{t('Evaluation methodology', 'กรอบการประเมิน')}</h2>
        <ol>{steps.map(([en, th]) => <li key={en}>{t(en, th)}</li>)}</ol>
        <div className="disclosure">{t('Payment does not buy inclusion, scores, or rankings. Sponsored content is clearly labelled.', 'การชำระเงินไม่สามารถซื้อการถูกรวมในไกด์ คะแนน หรืออันดับได้ เนื้อหาที่ได้รับการสนับสนุนจะติดป้าย Sponsored')}</div>
      </section>
    </main>
  );
}
