import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { Breadcrumbs } from '@/components/SiteChrome';
import { ProfilePage } from '@/components/ProfilePage';
import { VendorCard } from '@/components/VendorCard';
import { categoryName, getCategory, getVendor, vendors, type Vendor } from '@/lib/catalog';
import { isLocale, pick, type Locale } from '@/lib/i18n';
import { profileFor, SAMPLE_SLUGS, sampleContent, sampleVendor, type ProfileContent } from '@/lib/profiles';

// Rendered per request so vendor edits published from the admin console (vendor_overrides in D1) show up.
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ locale: string; slug: string }> };
const sampleKind = (slug: string) => (slug === SAMPLE_SLUGS.featured ? 'featured' : slug === SAMPLE_SLUGS.free ? 'free' : null);

/** Admin-published override (same rules as the old functions/_middleware.js): only rows marked Published apply. */
async function publishedOverride(slug: string): Promise<Record<string, string> | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const row = await env.DB.prepare('SELECT name,data_json AS dataJson FROM vendor_overrides WHERE slug=?').bind(slug).first<{ name: string; dataJson: string }>();
    if (!row) return null;
    const data = JSON.parse(row.dataJson || '{}');
    return data.status === 'Published' ? { ...data, name: row.name } : null;
  } catch { return null; }
}

async function load(locale: Locale, slug: string): Promise<{ vendor: Vendor; content?: ProfileContent; sample: boolean } | null> {
  const kind = sampleKind(slug);
  if (kind) return { vendor: sampleVendor(kind === 'featured'), content: sampleContent(kind === 'featured'), sample: true };
  const base = getVendor(slug);
  if (!base) return null;
  const o = await publishedOverride(slug);
  const vendor: Vendor = o ? {
    ...base, name: o.name || base.name,
    description: o.descriptionEn || base.description, descriptionTh: o.descriptionTh || base.descriptionTh,
    hasOverride: base.hasOverride || !!(o.descriptionEn || o.descriptionTh),
    pricing: o.pricingModel || base.pricing, languages: o.supportedLanguages || base.languages,
  } : base;
  return { vendor, content: profileFor(slug), sample: false };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const data = await load(locale, slug);
  if (!data) return {};
  const name = data.content?.productName || data.vendor.name;
  return {
    title: pick(locale, `${name} — MarTech provider profile`, `${name} — ผู้ให้บริการ MarTech`),
    description: `${name}, ${data.vendor.category}`,
    robots: data.sample ? { index: false } : undefined,
  };
}

export default async function ProviderPage({ params }: Params) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const data = await load(locale, slug);
  if (!data) notFound();
  const { vendor, content, sample } = data;
  const t = (en: string, th: string) => pick(locale, en, th);

  const main = sample ? 'crm-marketing-automation' : vendor.categories[0];
  const pool = vendors.filter((o) => o.slug !== vendor.slug && o.categories.includes(main));
  const related = [...pool.filter((o) => o.sponsored).slice(0, 2), ...pool.filter((o) => !o.sponsored)]
    .slice(0, 4)
    .map((o) => <VendorCard key={o.slug} vendor={o} locale={locale} level="h3" />);

  const kind = sampleKind(slug);
  const notice = sample ? (
    <div className="pf-notice">
      {t('Sample content for reviewing the layout. Not a real company.', 'เนื้อหาตัวอย่างสำหรับตรวจเลย์เอาต์ ไม่ใช่บริษัทจริง')} ·{' '}
      <Link href={`/${locale}/providers/${kind === 'featured' ? SAMPLE_SLUGS.free : SAMPLE_SLUGS.featured}/`}>
        {kind === 'featured' ? t('See the free version', 'ดูเวอร์ชันฟรี') : t('See the Featured version', 'ดูเวอร์ชันแนะนำ')}
      </Link>
    </div>
  ) : undefined;

  // Featured banner spans the full page width, so it sits between the breadcrumb and the content column.
  const featured = content?.featured ?? vendor.sponsored;
  const banner = featured && content?.banner;
  // Home › main category › product, like the hi-fi; the directory is the fallback when the category is unknown
  const cat = getCategory((content?.categories ?? vendor.categories)[0] ?? main);
  const crumbs = (
    <div className="pf-crumbs">
      <div className="pf-crumbs-in">
      <Breadcrumbs locale={locale} trail={[cat ? { label: categoryName(cat, locale), href: `/${locale}/categories/${cat.slug}/` } : { label: t('Directory', 'ไดเรกทอรี'), href: `/${locale}/tools/` }, { label: content?.productName || vendor.name }]} />
      {notice}
      </div>
    </div>
  );
  const hasVideo = !!content?.videos?.length;

  return banner ? (
    <>
      {crumbs}
      {/* the vendor's banner image as supplied: its text is part of the picture, so it does not change with the language */}
      <div className="pf-banner">
        {hasVideo
          ? <a href="#showcase" aria-label={t('Watch the demo videos', 'ดูวิดีโอสาธิต')}><img src={banner} alt="" /></a>
          : <img src={banner} alt="" />}
      </div>
      <main id="main" className="route-main pf-main">
        <ProfilePage vendor={vendor} content={content} locale={locale} related={related} sample={sample} />
      </main>
    </>
  ) : (
    <>
    {crumbs}
    <main id="main" className="route-main pf-main">
      <ProfilePage vendor={vendor} content={content} locale={locale} related={related} sample={sample} />
    </main>
    </>
  );
}
