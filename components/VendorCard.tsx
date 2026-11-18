import Link from 'next/link';
import { categoryName, getCategory, type Vendor } from '@/lib/catalog';
import { pick, type Locale } from '@/lib/i18n';
import { profileFor, profileModel, type ProfileContent } from '@/lib/profiles';
import { VendorLogo } from './VendorLogo';

export const featuredLabel = (locale: Locale) => pick(locale, 'Featured', 'แนะนำ');

/**
 * Free card: logo, name, up to 3 category tags, detail.
 * Featured card: logo, name + Featured, "by company" when a product name is set, main category, detail.
 */
export function VendorCard({ vendor, locale, content, href, sample = false }: { vendor: Vendor; locale: Locale; content?: ProfileContent; href?: string; sample?: boolean }) {
  const m = profileModel(vendor, content ?? profileFor(vendor.slug), locale);
  const cats = m.featured
    ? m.categories.slice(0, 1)
    : [...m.categories, ...vendor.categories.map(getCategory)].filter((c, i, a) => c && a.indexOf(c) === i).slice(0, 3);
  return (
    <Link
      className={`result-card vendor-card${m.featured ? ' is-featured' : ''}`}
      data-company={m.company.toLocaleLowerCase()}
      data-categories={vendor.categories.join(',')}
      href={href ?? `/${locale}/providers/${vendor.slug}/`}
    >
      <div className="vc-head">
        <VendorLogo name={m.company} sample={sample} />
        <div className="vc-id">
          <h2>
            {m.title}
            {m.featured && <span className="tier-badge">{featuredLabel(locale)}</span>}
          </h2>
          {m.featured && m.hasProduct && <span className="vc-by">{pick(locale, 'by', 'โดย')} {m.company}</span>}
          <div className="vc-tags">{cats.map((c) => c && <span className="vc-tag" key={c.slug}>{categoryName(c, locale)}</span>)}</div>
        </div>
      </div>
      <p className={m.description ? '' : 'is-pending'}>
        {m.description || pick(locale, 'Profile details not yet verified', 'รายละเอียดโปรไฟล์ยังไม่ได้รับการตรวจสอบ')}
      </p>
    </Link>
  );
}
