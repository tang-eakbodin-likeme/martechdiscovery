import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CategoryIcon } from '@/components/CategoryIcon';
import { HeroSearch, HomeDirectory, type HomeVendor } from '@/components/HomeDirectory';
import { HeroPreview, type PreviewSet } from '@/components/HeroPreview';
import { VendorLogo } from '@/components/VendorLogo';
import { categories, categoryName, getCategory, initials, logoFile, primaryCategory, vendorDescription, vendors, vendorsIn } from '@/lib/catalog';
import { isLocale, localeParams, pick } from '@/lib/i18n';

export const generateStaticParams = localeParams;
export const dynamicParams = false;
type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: { absolute: pick(locale, 'MarTech Discovery Platform | MarTech tools and vendors in Thailand', 'MarTech Discovery Platform | เทคโนโลยีการตลาดในไทย') },
    alternates: { languages: { th: '/th/', en: '/en/', 'x-default': '/th/' } },
  };
}

const HOME_FILTERS = ['crm-marketing-automation', 'marketing-analytics-tracking-attribution', 'advertising-technology'];

export default async function HomePage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = (en: string, th: string) => pick(locale, en, th);

  // Hero preview: example searches typed one after another, each showing real vendors from its closest category
  // (Featured first, then vendors with a logo). Queries stay in English in both languages, like "LINE CRM" did.
  const PREVIEW = [['AI & Automation', 'crm-marketing-automation'], ['Customer Data', 'customer-data-platform'], ['Growth tools', 'conversion-rate-optimization-personalization']] as const;
  const previewSets: PreviewSet[] = PREVIEW.map(([query, slug]) => {
    const list = vendorsIn(slug);
    return {
      query, count: list.length, category: categoryName(getCategory(slug)!, locale),
      rows: [...list].sort((a, b) => Number(b.sponsored) - Number(a.sponsored) || Number(!!logoFile(b.name)) - Number(!!logoFile(a.name))).slice(0, 4)
        .map((v) => ({ slug: v.slug, name: v.name, featured: v.sponsored, mark: logoFile(v.name) ? <VendorLogo name={v.name} /> : <span className="hp-initial">{[...v.name.trim()][0]}</span> })),
    };
  });
  const spot = vendors.find((v) => v.name === 'BUZZEBEES');
  const topCategories = [...categories].sort((a, b) => vendorsIn(b.slug).length - vendorsIn(a.slug).length).slice(0, 9);

  const homeVendors: HomeVendor[] = vendors.map((v) => {
    const text = vendorDescription(v, locale);
    return {
      slug: v.slug, name: v.name, categoryLabel: categoryName(primaryCategory(v), locale), categories: v.categories,
      text: text || t('Profile details not yet verified', 'รายละเอียดโปรไฟล์ยังไม่ได้รับการตรวจสอบ'), pending: !text,
      featured: v.sponsored, logo: logoFile(v.name), initial: initials(v.name), pricing: v.pricing, languages: v.languages, fit: v.fit,
    };
  });

  return (
    <div className="home">
      <link rel="stylesheet" href={`/home.css?v=${process.env.NODE_ENV === 'development' ? Date.now() : process.env.CSS_VERSION}`} precedence="page" />
      <main>
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <div className="eyebrow"><i>/</i> MarTech Expo 2027 · {t('Thailand', 'ประเทศไทย')}</div>
              <h1>{t('Find and compare MarTech vendors in Thailand and Southeast Asia', 'ค้นหาและเปรียบเทียบผู้ให้บริการ MarTech ในไทยและเอเชียตะวันออกเฉียงใต้')}</h1>
              <p className="intro">{t('An independent directory of MarTech providers, organized by capability. Search, compare up to three side by side, and keep a shortlist.', 'ไดเรกทอรีผู้ให้บริการ MarTech ที่เป็นอิสระ จัดหมวดตามความสามารถ ค้นหา เปรียบเทียบได้สูงสุดสามรายแบบเคียงข้างกัน และบันทึก shortlist ของคุณ')}</p>
              <HeroSearch locale={locale} />
            </div>
            <HeroPreview sets={previewSets} locale={locale} labels={{
              region: t('Example search results', 'ตัวอย่างผลการค้นหา'), vendors: t('vendors', 'ราย'), vendor: t('Vendor', 'ผู้ให้บริการ'), listing: t('Listing', 'สถานะ'),
              featured: t('Featured', 'แนะนำ'), pending: t('Profile pending', 'รอตรวจสอบโปรไฟล์'), compare: t('Compare', 'เปรียบเทียบ'), compareSelected: t('Compare selected', 'เปรียบเทียบที่เลือก'),
            }} />
          </div>
        </section>

        {spot && (
          <section className="sponsor-spotlight wrap">
            <VendorLogo name={spot.name} />
            <div className="spot-body">
              <span className="spot-label">{t('Featured · Sponsored', 'แนะนำ · ได้รับการสนับสนุน')} · <Link href={`/${locale}/editorial-policy/`}>{t('Why', 'ทำไม')}</Link></span>
              <h2>{spot.name}</h2>
              <p>{vendorDescription(spot, locale)}</p>
            </div>
            <Link className="spot-link" href={`/${locale}/providers/${spot.slug}/`}>{t('View profile', 'ดูโปรไฟล์')}</Link>
          </section>
        )}

        <section className="wrap categories" id="categories">
          <div className="section-head"><div><h2><i>/</i> {t('Browse by category', 'เลือกดูตามหมวดหมู่')}</h2></div><Link className="arrowlink" href={`/${locale}/categories/`}>{t('All 18 categories', 'ดูทั้ง 18 หมวดหมู่')}</Link></div>
          <div className="cat-grid">
            {topCategories.map((c) => (
              <Link key={c.slug} className="cat-card" href={`/${locale}/categories/${c.slug}/`}>
                <span className="cat-icon"><CategoryIcon name={c.icon} /></span>
                <span><b>{categoryName(c, locale)}</b><small>{c.group}</small></span>
                <span className="cat-count">{vendorsIn(c.slug).length}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="featured" id="directory">
          <div className="wrap">
            <div className="section-head"><div><h2><i>/</i> {t('Vendors in the directory', 'ผู้ให้บริการในไดเรกทอรี')}</h2></div><Link className="arrowlink view-all-link" href={`/${locale}/tools/`}>{t('View all vendors', 'ดูผู้ให้บริการทั้งหมด')}</Link></div>
            <HomeDirectory locale={locale} vendors={homeVendors} filters={HOME_FILTERS.map((s) => ({ slug: s, label: categoryName(getCategory(s)!, locale) }))} />
          </div>
        </section>

        <section className="wrap how" id="buyers">
          <div className="section-head"><div><h2><i>/</i> {t('How it works', 'วิธีใช้งาน')}</h2></div></div>
          <ol className="steps">
            {[
              [t('Search', 'ค้นหา'), t('Find vendors by capability, market and fit', 'ค้นหาผู้ให้บริการตามความสามารถ ตลาด และความเหมาะสม')],
              [t('Compare', 'เปรียบเทียบ'), t('Put up to three side by side', 'วางเทียบกันได้สูงสุดสามราย')],
              ['Shortlist', t('Save the vendors worth a closer look', 'บันทึกผู้ให้บริการที่น่าสนใจไว้ดูต่อ')],
              [t('Connect', 'ติดต่อ'), t('Send one brief to the vendors you choose', 'ส่งบรีฟเดียวถึงผู้ให้บริการที่คุณเลือก')],
            ].map(([title, text], i) => <li key={i}><b>{i + 1}</b><strong>{title}</strong><small>{text}</small></li>)}
          </ol>
          <div className="audience">
            <span>{t("Who it's for", 'เหมาะสำหรับ')}</span>
            <b>{t('CMOs and marketing directors', 'CMO และผู้อำนวยการฝ่ายการตลาด')}</b>
            <b>{t('IT and digital leaders', 'ผู้นำด้าน IT และดิจิทัล')}</b>
            <b>{t('Business owners', 'เจ้าของธุรกิจ')}</b>
            <b>{t('Agencies and consultants', 'เอเจนซีและที่ปรึกษา')}</b>
          </div>
        </section>

        <section className="guide" id="guide">
          <div className="wrap guide-inner">
            <div className="book">
              <div className="book-cover">
                <small>{t('2027 edition', 'ฉบับปี 2027')}</small>
                <span>MarTech<br /><b>Buyer’s</b><br />Guide</span>
                <i>Thailand &amp; Southeast Asia</i>
                <div className="book-stamp"><img src="/assets/platform-discovery-mark.png" alt="" /></div>
              </div>
            </div>
            <div className="guide-copy">
              <h2><i>/</i> {t('MarTech Buyer’s Guide 2027', 'คู่มือเลือกซื้อ MarTech 2027')}</h2>
              <p>{t('Get the practical guide to evaluating tools, asking better questions, and building a stack that works for your team.', 'คู่มือประเมินเครื่องมือ ตั้งคำถามให้ตรงจุด และสร้าง MarTech stack ที่เหมาะกับทีม')}</p>
              <Link className="button" href={`/${locale}/buyer-guide/`}>{t('Get the Buyer’s Guide', 'รับคู่มือเลือกซื้อ')}</Link>
              <small>{t('Free download · Written for Thailand and Southeast Asia', 'ดาวน์โหลดฟรี · เขียนสำหรับตลาดไทยและเอเชียตะวันออกเฉียงใต้')}</small>
            </div>
          </div>
        </section>

        <section className="join" id="providers">
          <div>
            <h2>{t('List your company in the MarTech Expo 2027 directory', 'ลงรายชื่อบริษัทของคุณในไดเรกทอรี MarTech Expo 2027')}</h2>
            <p>{t('Make your product easier to find for the marketing teams looking for it', 'ช่วยให้ทีมการตลาดที่กำลังมองหา ค้นพบผลิตภัณฑ์ของคุณได้ง่ายขึ้น')}</p>
          </div>
          <Link className="join-link" href={`/${locale}/for-providers/`}>{t('For providers', 'สำหรับผู้ให้บริการ')}</Link>
        </section>
      </main>
    </div>
  );
}
