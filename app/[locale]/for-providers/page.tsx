import type { Metadata } from 'next';
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
    title: pick(locale, 'Provider packages', 'แพ็กเกจสำหรับผู้ให้บริการ'),
    description: pick(locale, 'Compare free Basic and paid Featured MarTech provider listings.', 'เปรียบเทียบแพ็กเกจ Basic ฟรี และ Featured แบบชำระเงิน'),
  };
}

type T = { en: string; th: string };
const L = (en: string, th: string): T => ({ en, th });

const basicBenefits = [L('Basic company and product details', 'ข้อมูลบริษัทและผลิตภัณฑ์พื้นฐาน'), L('Organic search and category listing', 'แสดงในผลค้นหาแบบ Organic'), L('Link to your website', 'ลิงก์ไปเว็บไซต์บริษัท')];
const featuredBenefits = [L('More product details, images, videos, and case studies', 'ข้อมูลรายละเอียด ภาพ วิดีโอ และ Case study มากขึ้น'), L('CTAs for website, demo, or free trial', 'CTA สำหรับเว็บไซต์, Demo หรือ Free Trial'), L('SEO/AEO/GEO content and monthly performance report', 'ข้อมูล SEO/AEO/GEO และรายงานรายเดือน')];

// [row label, Basic, Featured]
const rows: [T, T, T][] = [
  [L('Profile information', 'ข้อมูลโปรไฟล์'), L('Name and logo · Short description up to 200 characters', 'ชื่อและโลโก้ · คำอธิบายไม่เกิน 200 ตัวอักษร'), L('Name and logo · Short description up to 500 characters', 'ชื่อและโลโก้ · คำอธิบายไม่เกิน 500 ตัวอักษร')],
  [L('Categories and tags', 'หมวดหมู่และแท็ก'), L('1 primary + 1 secondary category · Up to 5 feature tags', '1 หมวดหลัก + หมวดรองได้ 1 · Feature tags สูงสุด 5'), L('1 primary + up to 5 secondary categories · Up to 20 feature tags', '1 หมวดหลัก + หมวดรองสูงสุด 5 · Feature tags สูงสุด 20')],
  [L('Product details', 'รายละเอียดผลิตภัณฑ์'), L('Basic information · 3 benefits · 2 use cases', 'ข้อมูลพื้นฐาน · Benefits 3 ข้อ · Use cases 2 ข้อ'), L('Full description · Up to 10 benefits · Up to 10 use-case cards', 'รายละเอียดเต็ม · Benefits สูงสุด 10 · Use-case cards สูงสุด 10')],
  [L('Audience and pricing', 'กลุ่มเป้าหมายและราคา'), L('Basic audience tags · Pricing model and starting price', 'Audience tags พื้นฐาน · รูปแบบราคาและราคาเริ่มต้น'), L('Detailed audience/industry tags · Pricing cards and plan comparison', 'ระบุอุตสาหกรรม/กลุ่มเป้าหมายละเอียด · Pricing cards และตารางเปรียบเทียบแพ็กเกจ')],
  [L('Images and video', 'ภาพและวิดีโอ'), L('1 product image · No video', 'ภาพสินค้า 1 ภาพ · ไม่มีวิดีโอ'), L('Up to 10 images · Up to 3 videos', 'ภาพสูงสุด 10 ภาพ · วิดีโอสูงสุด 3 รายการ')],
  [L('Integrations and proof', 'การเชื่อมต่อ และหลักฐาน'), L('Show up to 5 integrations', 'แสดง การเชื่อมต่อ 5 รายการ'), L('All integrations · Up to 5 case studies · Up to 20 customer logos', 'แสดง การเชื่อมต่อ ทั้งหมด · กรณีศึกษา สูงสุด 5 · โลโก้ลูกค้าสูงสุด 20')],
  [L('Trust signals', 'เสียงยืนยันและรางวัล'), L('—', '—'), L('Up to 5 testimonials · Awards and certifications', 'Testimonials สูงสุด 5 · Awards และ Certifications')],
  [L('Offers and CTA', 'ข้อเสนอและ CTA'), L('Visit Website', 'ปุ่ม Visit Website'), L('Up to 3 CTA links · Special-offer banner', 'CTA สูงสุด 3 ลิงก์ · แบนเนอร์โปรโมชัน')],
  [L('Contact actions', 'ปุ่มติดต่อ'), L('Visit Website', 'Visit Website'), L('Visit Website + Book Demo / Free Trial · Up to 3 CTA destinations', 'Visit Website + Book Demo / Free Trial · CTA ได้สูงสุด 3 ปลายทาง')],
  [L('Visibility', 'การมองเห็น'), L('Organic search and category listings', 'ผลค้นหาและหมวดหมู่แบบ Organic'), L('Featured badge and eligibility for sponsored placements*', 'Featured badge และสิทธิ์เข้าพื้นที่ Sponsored*')],
  [L('SEO / AEO / GEO', 'SEO / AEO / GEO'), L('Basic structured facts and auto-generated metadata', 'ข้อมูลพื้นฐานและ Meta ที่สร้างอัตโนมัติ'), L('Custom SEO and contextual links · Enhanced product facts · Up to 10 FAQs · Detailed AIEO/GEO content', 'Custom SEO/ลิงก์ภายใน · ข้อมูลผลิตภัณฑ์ ขั้นสูง · FAQ สูงสุด 10 ข้อ · เนื้อหา AIEO/GEO แบบละเอียด')],
  [L('Evidence and freshness', 'หลักฐานและความสดใหม่'), L('Basic references · Standard review', 'แหล่งอ้างอิงพื้นฐาน · ตรวจตามรอบ'), L('Enhanced sources/references · Priority content-freshness review', 'แหล่งอ้างอิงแบบละเอียด · Priority review ด้านความสดใหม่ของข้อมูล')],
  [L('Pricing and comparison', 'ราคาและการเปรียบเทียบ'), L('Pricing model and starting price as text', 'แสดงรูปแบบราคาและราคาเริ่มต้น'), L('Pricing cards and plan-comparison section', 'Pricing cards และส่วนเปรียบเทียบแพ็กเกจ')],
  [L('Analytics', 'Analytics'), L('—', '—'), L('Profile views · CTA/outbound clicks · Monthly performance report', 'ยอดเข้าชมโปรไฟล์ · คลิก CTA/ออกนอกเว็บ · รายงานรายเดือน')],
  [L('Profile updates', 'การแก้ไขข้อมูล'), L('One basic edit with initial submission', 'แก้ไขพื้นฐานได้ 1 ครั้งเมื่อส่งข้อมูล'), L('Full profile editor · Up to 2 update requests during the year', 'ใช้ Profile Editor ได้ · ขอแก้ไขระหว่างปีได้สูงสุด 2 ครั้ง')],
];

const conditions: [T, T][] = [
  [L('Sponsored positions', 'ตำแหน่ง Sponsored'), L('Featured includes a Featured badge and eligibility for sponsored placements. Placement depends on available inventory and platform allocation.', 'แพ็กเกจ Featured มีสิทธิ์เข้าพื้นที่ Sponsored และได้รับ Featured badge ตำแหน่งแสดงผลขึ้นกับพื้นที่และการจัดสรรของแพลตฟอร์ม')],
  [L('Review before publishing', 'ตรวจสอบข้อมูลก่อนเผยแพร่'), L('Company and product information is reviewed for completeness and factual accuracy before publishing.', 'ข้อมูลบริษัทและผลิตภัณฑ์ต้องผ่านการตรวจสอบความครบถ้วนและข้อเท็จจริงก่อนเผยแพร่')],
  [L('Updates follow package limits', 'แก้ไขได้ตามแพ็กเกจ'), L('Basic includes one initial basic edit. Featured includes up to two update requests during the year, subject to review.', 'Basic แก้ไขพื้นฐานได้ 1 ครั้งตอนส่งข้อมูลครั้งแรก ส่วน Featured ขอแก้ไขระหว่างปีได้สูงสุด 2 ครั้ง ภายใต้การตรวจสอบ')],
  [L('Clear sponsor disclosure', 'แยกโฆษณาจากอันดับธรรมชาติ'), L('Sponsored placements are clearly labelled. Payment does not change editorial criteria or organic rankings.', 'ทุกตำแหน่งที่ได้รับการสนับสนุนจะติดป้ายชัดเจน การชำระเงินไม่เปลี่ยนเกณฑ์บรรณาธิการหรืออันดับ Organic')],
];

export default async function ForProvidersPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = (en: string, th: string) => pick(locale, en, th);
  const l = (x: T) => x[locale];
  return (
    <main className="route-main">
      <Breadcrumbs locale={locale} trail={[{ label: t('For Providers', 'สำหรับผู้ให้บริการ') }]} />
      <Eyebrow>{t('For MarTech providers', 'สำหรับผู้ให้บริการ')}</Eyebrow>
      <h1>{t('Choose the visibility that fits your goals', 'เลือกการมองเห็นที่เหมาะกับคุณ')}</h1>
      <p className="route-intro">{t('List your basic product information for free, or choose Featured for richer content, more visibility options, and performance insights.', 'ลงข้อมูลพื้นฐานได้ฟรี หรือเลือก Featured เพื่อแสดงรายละเอียดผลิตภัณฑ์ได้มากขึ้น พร้อมเครื่องมือเพิ่มการมองเห็นและติดตามผล')}</p>
      <div className="sponsor-tier-cards">
        <article className="sponsor-tier-card">
          <span className="eyebrow">BASIC</span>
          <h2>{t('Start for free', 'เริ่มต้นฟรี')}</h2>
          <p>{t('Help buyers discover your product with a standard profile.', 'ให้ผู้ซื้อค้นพบและรู้จักข้อมูลผลิตภัณฑ์พื้นฐาน')}</p>
          <ul data-package-benefits="basic">{basicBenefits.map((b) => <li key={b.en}>{l(b)}</li>)}</ul>
          <span className="sponsor-plan-price" data-package-value="basic.price">{t('Free', 'ฟรี')}</span>
          <div className="sponsor-meta">
            <span>{t('Duration: ', 'ระยะเวลา: ')}<b data-package-value="basic.duration">{t('Ongoing; review periodically', 'ต่อเนื่อง; ทบทวนข้อมูลเป็นระยะ')}</b></span>
            <span data-package-value="basic.slots">{t('Organic listing; no paid placement', 'แสดงผล Organic ไม่มีตำแหน่งชำระเงิน')}</span>
          </div>
        </article>
        <article className="sponsor-tier-card featured-tier">
          <span className="badge">FEATURED · PAID</span>
          <h2>{t('Featured profile', 'เพิ่มข้อมูล เพิ่มโอกาส')}</h2>
          <p>{t('A richer profile with stronger conversion tools, analytics, and sponsored visibility eligibility.', 'โปรไฟล์แบบ Rich Content พร้อม CTA, Analytics และสิทธิ์เข้าพื้นที่ Sponsored')}</p>
          <ul data-package-benefits="featured">{featuredBenefits.map((b) => <li key={b.en}>{l(b)}</li>)}</ul>
          <span className="sponsor-plan-price" data-package-value="featured.price">{t('Contact for pricing', 'สอบถามราคา')}</span>
          <div className="sponsor-meta">
            <span>{t('Duration: ', 'ระยะเวลา: ')}<b data-package-value="featured.duration">{t('Confirm in package agreement', 'ยืนยันในข้อเสนอหรือสัญญา')}</b></span>
            <span data-package-value="featured.slots">{t('Placement subject to inventory; not guaranteed', 'ตำแหน่งขึ้นกับพื้นที่และการจัดสรร ไม่รับประกัน')}</span>
          </div>
        </article>
      </div>
      <section className="sponsor-packages" id="sponsor-packages">
        <Eyebrow>{t('Package comparison', 'เปรียบเทียบแพ็กเกจ')}</Eyebrow>
        <h2>{t('What each package includes', 'รายละเอียดสิทธิประโยชน์')}</h2>
        <div className="sponsor-table-wrap">
          <table className="sponsor-package-table">
            <thead>
              <tr>
                <th>{t('What is included', 'สิ่งที่ได้รับ')}</th>
                <th>Basic <span>{t('Free', 'ฟรี')}</span></th>
                <th>Featured <span>{t('Paid package', 'แพ็กเกจชำระเงิน')}</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, basic, featured]) => (
                <tr key={label.en}><th>{l(label)}</th><td>{l(basic)}</td><td>{l(featured)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="sponsor-conditions">
        <Eyebrow>{t('Placement & content conditions', 'เงื่อนไขการแสดงผล')}</Eyebrow>
        <div className="sponsor-condition-grid">
          {conditions.map(([title, body]) => (
            <article key={title.en}><h3>{l(title)}</h3><p>{l(body)}</p></article>
          ))}
        </div>
        <p className="sponsor-note">{t('* The package sheet does not specify a price or guaranteed slot count. Pricing is shown as “contact the team,” and specific placements are not guaranteed.', '* ไฟล์แพ็กเกจไม่ได้ระบุราคาและจำนวนตำแหน่งที่รับประกัน จึงแสดงราคาเป็น “สอบถามทีมงาน” และไม่รับประกันการได้ตำแหน่ง Sponsor เฉพาะจุด')}</p>
      </section>
      <p className="disclosure">{t('This page is a prototype. Sponsor placements and analytics reports are not connected to live systems, and a Featured preview does not confirm a company purchase.', 'หน้านี้เป็น mockup ตัวอย่าง Sponsor และรายงาน Analytics ยังไม่เชื่อมระบบจริง การแสดง Featured ไม่ได้ยืนยันสถานะการซื้อแพ็กเกจของบริษัทใด')}</p>
    </main>
  );
}
