import Link from 'next/link';
import { categoryName, getCategory, type Vendor } from '@/lib/catalog';
import { pick, type Locale } from '@/lib/i18n';
import { profileFor, profileModel, type ProfileContent } from '@/lib/profiles';
import { VendorLogo } from './VendorLogo';

export const featuredLabel = (locale: Locale) => pick(locale, 'Featured', 'แนะนำ');

/**
 * Card: logo, name (+ Featured), "by company" when a Featured product name is set, the main category with a "+N" count of the others, detail.
 */
export function VendorCard({ vendor, locale, content, href, sample = false, level = 'h2' }: { vendor: Vendor; locale: Locale; content?: ProfileContent; href?: string; sample?: boolean; level?: 'h2' | 'h3' }) {
  const H = level;
  const m = profileModel(vendor, content ?? profileFor(vendor.slug), locale);
  // one category tag on every card (so all cards line up), the rest as a "+N" count
  const cats = [...m.categories, ...vendor.categories.map(getCategory)].filter((c, i, a) => c && a.indexOf(c) === i);
  const more = cats.slice(1).map((c) => c && categoryName(c, locale));
  return (
    <Link
      className={`result-card vendor-card${m.featured ? ' is-featured' : ''}`}
      data-company={m.company.toLocaleLowerCase()}
      data-categories={vendor.categories.join(',')}
      data-cta={pick(locale, 'View profile →', 'ดูโปรไฟล์ →')}
      href={href ?? `/${locale}/providers/${vendor.slug}/`}
    >
      <div className="vc-head">
        <VendorLogo name={m.company} sample={sample} />
        <div className="vc-id">
          <H>
            {m.title}
            {m.featured && <span className="tier-badge">{featuredLabel(locale)}</span>}
          </H>
          {m.featured && m.hasProduct && <span className="vc-by">{pick(locale, 'by', 'โดย')} {m.company}</span>}
          <div className="vc-tags">
            {cats[0] && <span className="vc-tag">{categoryName(cats[0], locale)}</span>}
            {more.length > 0 && <span className="vc-tag vc-more" title={more.join(', ')}><span aria-hidden="true">+{more.length}</span><span className="sr-only">{pick(locale, `and ${more.length} more: `, `และอีก ${more.length} หมวด: `)}{more.join(', ')}</span></span>}
          </div>
        </div>
      </div>
      <p className={m.description ? '' : 'is-pending'}>
        {m.description || pick(locale, 'Profile details not yet verified', 'รายละเอียดโปรไฟล์ยังไม่ได้รับการตรวจสอบ')}
      </p>
    </Link>
  );
}
