'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { pick, type Locale } from '@/lib/i18n';

export type HomeVendor = {
  slug: string; name: string; categoryLabel: string; categories: string[]; text: string; pending: boolean;
  featured: boolean; logo?: string; initial: string;
};
type Filter = { slug: string; label: string };

const FEATURED_ON_LOAD = ['BUZZEBEES', 'AppsFlyer', 'Saifa AI', 'Wisesight', 'Sellsuki', 'Clicknext', 'Zoho Corporation', 'Pay Solutions', 'Anymind'];

/** Hero search: opens the directory page with the query (an empty search opens the full directory). */
export function HeroSearch({ locale }: { locale: Locale }) {
  const [q, setQ] = useState('');
  const router = useRouter();
  return (
    <form id="search" className="search" role="search" action={`/${locale}/tools/`} onSubmit={(e) => {
      e.preventDefault();
      const term = q.trim();
      router.push(`/${locale}/tools/${term ? `?q=${encodeURIComponent(term)}` : ''}`);
    }}>
      <span><Search size={18} strokeWidth={1.5} /></span>
      <label className="sr-only" htmlFor="query">{pick(locale, 'Search the directory', 'ค้นหาในไดเรกทอรี')}</label>
      <input id="query" name="q" type="search" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} placeholder={pick(locale, 'Search vendors or capabilities', 'ค้นหาผู้ให้บริการหรือความสามารถ')} />
      <button className="button">{pick(locale, 'Search', 'ค้นหา')}</button>
    </form>
  );
}

/** Homepage directory: filter chips over a few featured vendors, each linking to its profile. */
export function HomeDirectory({ vendors, filters, locale }: { vendors: HomeVendor[]; filters: Filter[]; locale: Locale }) {
  const t = (en: string, th: string) => pick(locale, en, th);
  const [active, setActive] = useState('all');

  const list = useMemo(
    () => (active === 'all' ? vendors.filter((v) => FEATURED_ON_LOAD.includes(v.name)) : vendors.filter((v) => v.categories.includes(active))),
    [vendors, active],
  );

  return (
    <>
      <div className="filters">
        <button className={`filter${active === 'all' ? ' active' : ''}`} onClick={() => setActive('all')}>
          {t('All tools', 'เครื่องมือทั้งหมด')} <span>{vendors.length}</span>
        </button>
        {filters.map((f) => <button key={f.slug} className={`filter${active === f.slug ? ' active' : ''}`} onClick={() => setActive(f.slug)}>{f.label}</button>)}
      </div>
      <div className="tool-grid" id="tools">
        {list.map((v) => (
          <article className="tool" key={v.slug}>
            <div className="tool-top">
              <div className="logo-tile">{v.logo ? <img src={`/assets/vendor-logos/${encodeURIComponent(v.logo)}`} alt="" loading="lazy" /> : v.initial}</div>
              {v.featured && <span className="badge">{t('Featured', 'แนะนำ')}</span>}
            </div>
            <h3>{v.name}</h3>
            <p className={v.pending ? 'is-pending' : ''}>{v.text}</p>
            <div className="tags"><span>{v.categoryLabel}</span></div>
            <div className="tool-bottom">
              <Link className="profile-link" href={`/${locale}/providers/${v.slug}/`}>{t('View profile', 'ดูโปรไฟล์')}</Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
