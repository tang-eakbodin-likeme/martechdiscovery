'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { pick, type Locale } from '@/lib/i18n';

export type HomeVendor = {
  slug: string; name: string; categoryLabel: string; categories: string[]; text: string; pending: boolean;
  featured: boolean; logo?: string; initial: string;
};
type Filter = { slug: string; label: string; count: number };

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

/** Homepage directory: category tabs over a few featured vendors, each linking to its profile. */
export function HomeDirectory({ vendors, filters, locale }: { vendors: HomeVendor[]; filters: Filter[]; locale: Locale }) {
  const t = (en: string, th: string) => pick(locale, en, th);
  const [active, setActive] = useState('all');
  const [morphing, setMorphing] = useState(false);

  // A plain click on a "Browse by category" card morphs that card into its tab here and filters the list.
  // New-tab clicks, missing View Transitions support and reduced motion keep the card's normal link / an instant switch.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const card = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[data-cat]');
      if (!card || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const slug = card.dataset.cat!;
      if (!filters.some((f) => f.slug === slug)) return;
      e.preventDefault();
      const go = () => { setActive(slug); document.getElementById('directory')?.scrollIntoView({ block: 'start', behavior: 'instant' }); }; // instant: the new snapshot must already show the tab
      const vt = (document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }).startViewTransition;
      if (!vt || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return go();
      card.style.viewTransitionName = 'cat-morph';
      const transition = vt.call(document, () => {
        card.style.viewTransitionName = '';
        flushSync(() => { setMorphing(true); go(); });
      });
      transition.finished.finally(() => setMorphing(false));
    };
    // capture phase: runs before the Next.js Link handler, which would otherwise navigate to the category page
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [filters]);

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
        {filters.map((f) => (
          <button key={f.slug} className={`filter${active === f.slug ? ' active' : ''}`} onClick={() => setActive(f.slug)}
            style={morphing && active === f.slug ? { viewTransitionName: 'cat-morph' } : undefined}>
            {f.label} <span>{f.count}</span>
          </button>
        ))}
      </div>
      <div className="tool-grid" id="tools" key={active}>
        {list.map((v, i) => (
          <article className="tool" key={v.slug} style={{ '--i': i } as React.CSSProperties}>
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

/** Fades home sections up as they scroll into view. Content stays visible without JavaScript or with reduced motion. */
export function HomeReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const els = [...document.querySelectorAll<HTMLElement>('.home :is(.section-head, .cat-card, .sponsor-spotlight, .filters, .steps li, .audience)')]
      .filter((el) => el.getBoundingClientRect().top > window.innerHeight); // already on screen: leave as is
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      io.unobserve(en.target);
    }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach((el, i) => { el.classList.add('reveal'); el.style.setProperty('--d', `${(i % 3) * 70}ms`); io.observe(el); });
    return () => io.disconnect();
  }, []);
  return null;
}
