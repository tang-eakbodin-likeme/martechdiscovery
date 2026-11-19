import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs, Eyebrow } from '@/components/SiteChrome';
import { Check, Minus } from 'lucide-react';
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

// Comparison rows, grouped. A cell leads with its key fact (k) and adds detail (n); null = not included, true = included.
type Cell = { k: T; n?: T } | true | null;
const C = (k: T, n?: T): Cell => ({ k, n });
const groups: { title: T; rows: [T, Cell, Cell][] }[] = [
  { title: L('Profile content', 'โปรไฟล์และเนื้อหา'), rows: [
    [L('Description', 'คำอธิบาย'), C(L('Up to 200 characters', 'สูงสุด 200 ตัวอักษร'), L('Name, logo and short description', 'ชื่อ โลโก้ และคำอธิบายโดยย่อ')), C(L('Up to 500 characters', 'สูงสุด 500 ตัวอักษร'), L('Plus full product details', 'พร้อมรายละเอียดผลิตภัณฑ์ฉบับเต็ม'))],
    [L('Categories and tags', 'หมวดหมู่และแท็ก'), C(L('1 primary and 1 secondary category', 'หมวดหมู่หลัก 1 และหมวดหมู่รอง 1'), L('Up to 5 feature tags', 'แท็กคุณสมบัติสูงสุด 5 รายการ')), C(L('1 primary and up to 5 secondary categories', 'หมวดหมู่หลัก 1 และหมวดหมู่รองสูงสุด 5'), L('Up to 20 feature tags', 'แท็กคุณสมบัติสูงสุด 20 รายการ'))],
    [L('Benefits and use cases', 'ประโยชน์และกรณีการใช้งาน'), C(L('3 benefits · 2 use cases', 'ประโยชน์ 3 รายการ · กรณีการใช้งาน 2 รายการ')), C(L('10 benefits · 10 use cases', 'ประโยชน์ 10 รายการ · กรณีการใช้งาน 10 รายการ'), L('Shown as cards', 'แสดงในรูปแบบการ์ด'))],
    [L('Target audience', 'กลุ่มเป้าหมาย'), C(L('Basic audience', 'กลุ่มเป้าหมายระดับพื้นฐาน')), C(L('Detailed industry and audience', 'ระบุอุตสาหกรรมและกลุ่มเป้าหมายโดยละเอียด'))],
    [L('Images and video', 'ภาพและวิดีโอ'), C(L('1 image', 'ภาพ 1 ภาพ'), L('Video not included', 'ไม่รวมวิดีโอ')), C(L('Up to 10 images · up to 3 videos', 'ภาพสูงสุด 10 ภาพ · วิดีโอสูงสุด 3 รายการ'))],
    [L('Integrations', 'การเชื่อมต่อระบบ'), C(L('5 shown', 'แสดง 5 รายการ')), C(L('All shown', 'แสดงทั้งหมด'))],
  ] },
  { title: L('Proof and trust', 'หลักฐานและความน่าเชื่อถือ'), rows: [
    [L('Case studies and customer logos', 'กรณีศึกษาและโลโก้ลูกค้า'), null, C(L('Up to 5 case studies', 'กรณีศึกษาสูงสุด 5 รายการ'), L('Up to 20 customer logos', 'โลโก้ลูกค้าสูงสุด 20 รายการ'))],
    [L('Testimonials and awards', 'คำรับรองและรางวัล'), null, C(L('Up to 5 customer testimonials', 'คำรับรองจากลูกค้าสูงสุด 5 รายการ'), L('Plus awards and certifications', 'พร้อมรางวัลและใบรับรอง'))],
    [L('Sources and data freshness', 'แหล่งอ้างอิงและความเป็นปัจจุบันของข้อมูล'), C(L('Standard review cycle', 'ตรวจสอบตามรอบปกติ'), L('Basic references', 'แหล่งอ้างอิงพื้นฐาน')), C(L('Priority review', 'ตรวจสอบเป็นลำดับแรก'), L('Detailed references', 'แหล่งอ้างอิงโดยละเอียด'))],
  ] },
  { title: L('Leads and actions', 'ปุ่มและการติดต่อ'), rows: [
    [L('Contact buttons', 'ปุ่มติดต่อ'), C(L('Website button', 'ปุ่มไปยังเว็บไซต์')), C(L('Up to 3 action buttons', 'ปุ่มดำเนินการสูงสุด 3 ปุ่ม'), L('Website, book a demo and free trial', 'เว็บไซต์ นัดสาธิต และทดลองใช้งาน'))],
    [L('Promotion banner', 'แบนเนอร์โปรโมชัน'), null, true],
    [L('Pricing', 'การแสดงราคา'), C(L('Starting price', 'ราคาเริ่มต้น'), L('Pricing model shown as text', 'แสดงรูปแบบราคาเป็นข้อความ')), C(L('Pricing plan cards and comparison table', 'การ์ดแพ็กเกจราคาและตารางเปรียบเทียบ'))],
  ] },
  { title: L('Visibility and reporting', 'การมองเห็นและรายงาน'), rows: [
    [L('Visibility', 'การมองเห็น'), C(L('Organic listing', 'แสดงผลแบบปกติ (Organic)'), L('In search results and categories', 'ในผลการค้นหาและหมวดหมู่')), C(L('Featured badge', 'ป้ายแนะนำ (Featured)'), L('Eligible for sponsored placements*', 'มีสิทธิ์เข้าพื้นที่ผู้สนับสนุน*'))],
    [L('SEO / AEO / GEO', 'SEO / AEO / GEO'), C(L('Automatically generated metadata', 'ข้อมูลเมตาที่สร้างโดยอัตโนมัติ'), L('Basic structured data', 'ข้อมูลเชิงโครงสร้างพื้นฐาน')), C(L('Custom SEO and up to 10 FAQs', 'ปรับแต่ง SEO และคำถามที่พบบ่อยสูงสุด 10 ข้อ'), L('Internal links and detailed AIEO/GEO content', 'ลิงก์ภายในและเนื้อหา AIEO/GEO โดยละเอียด'))],
    [L('Performance reports', 'รายงานผลการดำเนินงาน'), null, C(L('Monthly report', 'รายงานประจำเดือน'), L('Profile views and button clicks', 'ยอดเข้าชมโปรไฟล์และจำนวนการคลิกปุ่ม'))],
    [L('Profile updates', 'การแก้ไขข้อมูล'), C(L('1 edit', 'แก้ไขได้ 1 ครั้ง'), L('At first submission', 'เมื่อส่งข้อมูลครั้งแรก')), C(L('Profile editor access', 'แก้ไขผ่านเครื่องมือจัดการโปรไฟล์'), L('Plus up to 2 update requests per year', 'และขอแก้ไขเพิ่มเติมได้ 2 ครั้งต่อปี'))],
  ] },
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
  const cell = (c: Cell) => c === null ? <span className="pk-no"><Minus size={16} strokeWidth={1.75} aria-hidden="true" /><span className="sr-only">{t('Not included', 'ไม่มี')}</span></span>
    : c === true ? <span className="pk-yes"><Check size={16} strokeWidth={2} aria-hidden="true" /><span className="sr-only">{t('Included', 'มี')}</span></span>
    : <><b>{l(c.k)}</b>{c.n && <small>{l(c.n)}</small>}</>;
  return (
    <main id="main" className="route-main">
      <Breadcrumbs locale={locale} trail={[{ label: t('For Providers', 'สำหรับผู้ให้บริการ') }]} />
      <Eyebrow>{t('Free or Featured listing', 'ลงฟรี หรือเลือกแพ็กเกจแนะนำ')}</Eyebrow>
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
          <span className="eyebrow">FEATURED · PAID</span>
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
                <th scope="col">{t('What is included', 'สิ่งที่ได้รับ')}</th>
                <th scope="col">Basic <span>{t('Free', 'ฟรี')}</span></th>
                <th scope="col" className="is-featured">Featured <em>{t('Recommended', 'แนะนำ')}</em> <span>{t('Paid package', 'แพ็กเกจชำระเงิน')}</span></th>
              </tr>
            </thead>
            {groups.map((g) => (
              <tbody key={g.title.en}>
                <tr className="pk-group"><th scope="rowgroup" colSpan={3}>{l(g.title)}</th></tr>
                {g.rows.map(([label, basic, featured]) => (
                  <tr key={label.en}><th scope="row">{l(label)}</th><td>{cell(basic)}</td><td className="is-featured">{cell(featured)}</td></tr>
                ))}
              </tbody>
            ))}
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
