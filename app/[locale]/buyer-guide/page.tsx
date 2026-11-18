import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, Scale } from 'lucide-react';
import { Breadcrumbs, Eyebrow } from '@/components/SiteChrome';
import LeadForm from '@/components/LeadForm';
import { categories, categoryName } from '@/lib/catalog';
import { isLocale, localeParams, pick } from '@/lib/i18n';

export const generateStaticParams = localeParams;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: pick(locale, 'MarTech Buyer Guide', 'คู่มือเลือกซื้อ MarTech'),
    description: 'Thai-context MarTech decision guide covering local requirements, buying framework, 18 categories, and a transparent methodology.',
  };
}

const sections = [
  ['Use the guide', 'Objectivity statement, methodology, inclusion criteria, editorial board, and sponsor disclosure.', 'วิธีใช้คู่มือ', 'คำชี้แจงความเป็นกลาง วิธีประเมิน เกณฑ์คัดเลือก กองบรรณาธิการ และการเปิดเผยผู้สนับสนุน'],
  ['Thai MarTech landscape', 'Market map, emerging trends, and budget considerations for 2027.', 'ภาพรวม MarTech ไทย', 'แผนที่ตลาด แนวโน้มที่กำลังเกิดขึ้น และข้อพิจารณาด้านงบประมาณปี 2027'],
  ['Buying framework', 'Needs assessment, shortlist, RFP, demo, POC, negotiation, and implementation checklists.', 'กรอบการเลือกซื้อ', 'ประเมินความต้องการ ทำ shortlist จัดทำ RFP ทดลอง Demo และ POC เจรจา และใช้เช็กลิสต์ก่อนติดตั้ง'],
  ['Category deep-dives', 'Definitions, who each category fits, comparison criteria, and provider profiles.', 'เจาะลึกแต่ละหมวด', 'นิยาม กลุ่มผู้ใช้ที่เหมาะสม เกณฑ์เปรียบเทียบ และโปรไฟล์ผู้ให้บริการ'],
  ['Expert insights', 'Clearly labelled sponsored perspectives from consultancies and agencies.', 'มุมมองจากผู้เชี่ยวชาญ', 'ข้อคิดเห็นจากที่ปรึกษาและเอเจนซี พร้อมติดป้าย Sponsored อย่างชัดเจน'],
  ['Case studies', 'Editorial case studies shown separately from sponsored stories.', 'กรณีศึกษา', 'แยกกรณีศึกษาจากกองบรรณาธิการออกจากเรื่องราวที่ได้รับการสนับสนุน'],
  ['Provider directory', 'Browse providers and follow QR links to their product pages.', 'ไดเรกทอรีผู้ให้บริการ', 'ค้นหารายชื่อผู้ให้บริการและสแกน QR ไปยังหน้าผลิตภัณฑ์'],
];

const benefits: [string, string][] = [
  ['Free ungated preview is always available', 'อ่านตัวอย่างฟรีได้โดยไม่ต้องกรอกฟอร์ม'],
  ['Buyer Guide available in Thai and English', 'Buyer Guide มีทั้งภาษาไทยและอังกฤษ'],
  ['Optional partner sharing is named and separate', 'การแชร์ข้อมูลให้พาร์ตเนอร์ระบุชื่อและแยกความยินยอม'],
];

export default async function BuyerGuidePage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = (en: string, th: string) => pick(locale, en, th);
  const th = locale === 'th';
  return (
    <main className="route-main">
      <Breadcrumbs locale={locale} trail={[{ label: t('Buyer Guide', 'คู่มือเลือกซื้อ') }]} />
      <section className="buyer-hero">
        <div className="buyer-hero-copy">
          <Eyebrow>{t('Thai-context MarTech decision guide · 2027', 'คู่มือตัดสินใจเลือก MarTech สำหรับบริบทไทย · 2027')}</Eyebrow>
          {th ? <h1>เลือก MarTech<br />ให้เหมาะกับทีมคุณ</h1> : <h1>Choose MarTech<br />with <em>confidence</em></h1>}
          <p className="route-intro">{t('A practical buyer guide for evaluating MarTech in Thailand and Southeast Asia—covering local fit, implementation, and the questions to ask before you buy.', 'คู่มือสำหรับประเมินและเลือกเทคโนโลยีการตลาดในไทยและเอเชียตะวันออกเฉียงใต้ ตั้งแต่ความเหมาะสมกับตลาด การนำไปใช้ ไปจนถึงคำถามสำคัญก่อนตัดสินใจ')}</p>
          <div className="buyer-hero-actions">
            <a className="button" href="#guide-form">{t('Get the Buyer Guide', 'รับ Buyer Guide')} <b>→</b></a>
            <Link className="text-cta" href={`/${locale}/buyer-guide/preview/`}>{t('Read the free preview ↓', 'อ่านตัวอย่างฟรี ↓')}</Link>
          </div>
          <div className="buyer-proof"><span>TH / EN</span><span>{t('18 solution categories', '18 หมวดหมู่โซลูชัน')}</span><span>{t('Independent methodology', 'เปิดเผยวิธีประเมิน')}</span></div>
        </div>
        <div className="book buyer-book"><div className="book-cover"><small>2027 EDITION</small><span>MARTECH<br /><b>BUYER’S</b><br />GUIDE</span><i>THAILAND &amp; SOUTHEAST ASIA</i><div className="book-stamp">MD<br />✳</div></div></div>
      </section>
      <section className="buyer-intro">
        <div>
          <Eyebrow>{t('Built for the Thai market', 'ออกแบบเพื่อบริบทตลาดไทย')}</Eyebrow>
          <h2>{t('Global tools.', 'เครื่องมือระดับโลก')}<br /><em>{t('Local realities', 'ที่เข้าใจบริบทไทย')}</em></h2>
        </div>
        <div>
          <p>{t('Compare tools against the factors global guides often miss: LINE OA integration, PDPA readiness, data residency, THB pricing, Thai-language support, and local implementation partners.', 'เปรียบเทียบเครื่องมือด้วยเกณฑ์ที่ไกด์ระดับโลกมักมองข้าม เช่น การเชื่อมต่อ LINE OA ความพร้อมด้าน PDPA ที่ตั้งจัดเก็บข้อมูล ราคาเงินบาท การรองรับภาษาไทย และพาร์ตเนอร์ผู้ติดตั้งในประเทศ')}</p>
          <p>{t('Use the guide to move from needs assessment to shortlist, RFP, demo, proof of concept, negotiation, and implementation.', 'ใช้กรอบการเลือกซื้อตั้งแต่ประเมินความต้องการ ทำรายชื่อเครื่องมือที่ควรพิจารณา จัดทำ RFP ทดลอง Demo และ POC เจรจา ไปจนถึงวางแผนติดตั้ง')}</p>
        </div>
      </section>
      <section className="guide-sections">
        <Eyebrow>{t('What’s inside', 'เนื้อหาภายในคู่มือ')}</Eyebrow>
        <h2>{t('A clearer path from ', 'เส้นทางชัดเจนจาก')}<em>{t('need to decision', 'โจทย์สู่การตัดสินใจ')}</em></h2>
        <div className="guide-section-grid">
          {sections.map(([en, enP, thH, thP], i) => (
            <article key={en}><span>{String(i + 1).padStart(2, '0')}</span><h3>{th ? thH : en}</h3><p>{th ? thP : enP}</p></article>
          ))}
        </div>
      </section>
      <section className="buyer-categories">
        <Eyebrow>{t('The category map', 'แผนผังหมวดหมู่')}</Eyebrow>
        <div className="section-head">
          <h2>{t('18 categories. ', '18 หมวดหมู่ ')}<em>{t('One buying framework', 'กรอบการเลือกซื้อเดียวกัน')}</em></h2>
          <Link className="arrowlink" href={`/${locale}/categories/`}>{t('Browse categories', 'ดูหมวดหมู่')} <b>↗</b></Link>
        </div>
        <div className="buyer-category-grid">
          {categories.map((c, i) => (
            <Link key={c.slug} href={`/${locale}/categories/${c.slug}/`}><span>{String(i + 1).padStart(2, '0')}</span><b>{categoryName(c, locale)}</b><i>↗</i></Link>
          ))}
        </div>
      </section>
      <section className="editorial-promise">
        <span className="promise-icon"><Scale strokeWidth={1.75} /></span>
        <div>
          <Eyebrow>{t('Editorial independence', 'ความเป็นอิสระด้านบรรณาธิการ')}</Eyebrow>
          <h2>{t('Clear criteria. ', 'เกณฑ์ชัดเจน ')}<em>{t('No paid rankings', 'ไม่มีอันดับที่ซื้อได้')}</em></h2>
          <p>{t('Payment does not buy inclusion, scores, comparison placement, or an “Editor’s Pick.” Sponsored content is labelled. The same published criteria apply to every provider.', 'การชำระเงินไม่สามารถซื้อการถูกรวมในไกด์ คะแนน หรือตำแหน่งในตารางเปรียบเทียบได้ เนื้อหา Sponsored จะติดป้ายกำกับชัดเจน และใช้เกณฑ์เดียวกันกับผู้ให้บริการทุกราย')}</p>
          <Link href={`/${locale}/buyer-guide/preview/`}>{t('Read the methodology in the free preview →', 'อ่านวิธีประเมินในตัวอย่างฟรี →')}</Link>
        </div>
      </section>
      <section className="leadgen-layout" id="guide-form">
        <div className="leadgen-copy">
          <Eyebrow>{t('Get the guide', 'รับคู่มือ')}</Eyebrow>
          <h2>{t('Get your MarTech', 'รับคู่มือ')}<br /><em>{t('decision guide', 'ตัดสินใจเลือก MarTech')}</em></h2>
          <p>{t('Tell us where to send the guide. Optional details help tailor follow-up, but you can skip them and continue without selecting any consent.', 'ระบุช่องทางรับคู่มือ ข้อมูลเสริมช่วยแนะนำเนื้อหาได้ตรงขึ้น แต่ข้ามได้และรับคู่มือได้โดยไม่ต้องเลือกความยินยอม')}</p>
          {benefits.map(([en, thText]) => (
            <div className="leadgen-benefit" key={en}><Check strokeWidth={1.75} /><span>{th ? thText : en}</span></div>
          ))}
        </div>
        <LeadForm locale={locale} />
      </section>
    </main>
  );
}
