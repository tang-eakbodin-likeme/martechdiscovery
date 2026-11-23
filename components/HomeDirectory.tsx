'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useScrollEdges } from './useScrollEdges';
import { pick, type Locale } from '@/lib/i18n';

/** A vendor on the home list: what the tabs filter on, plus its card, rendered on the server like the search page's. */
export type HomeVendor = { slug: string; name: string; categories: string[]; card: React.ReactNode };
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
      <label htmlFor="query"><Search size={18} strokeWidth={1.5} aria-hidden="true" /><span className="sr-only">{pick(locale, 'Search the directory', 'ค้นหาในไดเรกทอรี')}</span></label>
      <input id="query" name="q" type="search" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} placeholder={pick(locale, 'Search vendors or capabilities', 'ค้นหาผู้ให้บริการหรือความสามารถ')} />
      <button className="button">{pick(locale, 'Search', 'ค้นหา')}</button>
    </form>
  );
}

/** Homepage directory: category tabs over a few featured vendors, each linking to its profile. */
export function HomeDirectory({ vendors, filters, locale }: { vendors: HomeVendor[]; filters: Filter[]; locale: Locale }) {
  const t = (en: string, th: string) => pick(locale, en, th);
  const [active, setActive] = useState('all');


  const list = useMemo(
    () => (active === 'all' ? vendors.filter((v) => FEATURED_ON_LOAD.includes(v.name)) : vendors.filter((v) => v.categories.includes(active))),
    [vendors, active],
  );

  const tabs = useScrollEdges<HTMLDivElement>();

  return (
    <>
      <div className={`filters-wrap${tabs.edges.start ? ' at-start' : ''}${tabs.edges.end ? ' at-end' : ''}`}>
      <button type="button" className="cats-arrow is-prev" onClick={() => tabs.nudge(-1)} disabled={tabs.edges.start} aria-label={t('Previous categories', 'หมวดหมู่ก่อนหน้า')}><ChevronLeft size={18} strokeWidth={1.75} /></button>
      <div className="filters" ref={tabs.ref}>
        <button className={`filter${active === 'all' ? ' active' : ''}`} onClick={() => setActive('all')}>
          {t('All tools', 'เครื่องมือทั้งหมด')} <span>{vendors.length}</span>
        </button>
        {filters.map((f) => (
          <button key={f.slug} className={`filter${active === f.slug ? ' active' : ''}`} onClick={() => setActive(f.slug)}>
            {f.label} <span>{f.count}</span>
          </button>
        ))}
      </div>
      <button type="button" className="cats-arrow is-next" onClick={() => tabs.nudge(1)} disabled={tabs.edges.end} aria-label={t('More categories', 'หมวดหมู่ถัดไป')}><ChevronRight size={18} strokeWidth={1.75} /></button>
      </div>
      <div className="tool-grid" id="tools" key={active}>
        {list.map((v, i) => (
          <div className="tool-cell" key={v.slug} style={{ '--i': i } as React.CSSProperties}>{v.card}</div>
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
    // stagger by position within its own row (left to right), not by position in the page-wide list
    els.forEach((el) => { el.classList.add('reveal'); el.style.setProperty('--d', `${([...el.parentElement!.children].indexOf(el) % 3) * 70}ms`); io.observe(el); });
    return () => io.disconnect();
  }, []);
  return null;
}

/** Sponsored spotlight: one placement at a time, moving on every 6 s while it is on screen and the hero's typing
 *  preview is not (so only one thing moves at once). Hover/focus pauses; reduced motion stops it (arrows and dots still work). */
export function SponsorCarousel({ children, label, show, locale }: { children: React.ReactNode[]; label: string; show: string; locale: Locale }) {
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [quiet, setQuiet] = useState(false); // carousel on screen and hero preview mostly off screen
  const box = useRef<HTMLElement>(null);
  const n = children.length;
  const t = (en: string, th: string) => pick(locale, en, th);

  useEffect(() => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setStopped(true); }, []);
  useEffect(() => {
    const el = box.current;
    const hero = document.querySelector('.hero-preview');
    if (!el || !('IntersectionObserver' in window)) return setQuiet(true);
    let mine = false, heroOn = !!hero;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.target === el) mine = e.isIntersecting; else heroOn = e.intersectionRatio >= 0.5; });
      setQuiet(mine && !heroOn);
    }, { threshold: [0, 0.5] });
    io.observe(el);
    if (hero) io.observe(hero);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (n < 2 || hover || stopped || !quiet) return;
    const id = window.setInterval(() => { if (!document.hidden) setI((x) => (x + 1) % n); }, 6000);
    return () => window.clearInterval(id);
  }, [n, hover, stopped, quiet, i]);

  return (
    <section className="spot-carousel wrap" role="region" aria-roledescription="carousel" aria-label={label} ref={box}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
      <div className="spot-stack">
        {children.map((c, k) => <div key={k} className={`spot-slide${k === i ? ' is-on' : ''}`} aria-hidden={k !== i} inert={k !== i}>{c}</div>)}
      </div>
      {n > 1 && (
        <div className="spot-dots">
          <button type="button" className="car-btn" onClick={() => setI((x) => (x + n - 1) % n)} aria-label={t('Previous sponsor', 'ผู้สนับสนุนก่อนหน้า')}><ChevronLeft size={16} strokeWidth={1.75} /></button>
          {children.map((_, k) => <button type="button" key={k} className={`car-dot${k === i ? ' is-on' : ''}`} aria-current={k === i} aria-label={`${show} ${k + 1}`} onClick={() => setI(k)} />)}
          <button type="button" className="car-btn" onClick={() => setI((x) => (x + 1) % n)} aria-label={t('Next sponsor', 'ผู้สนับสนุนถัดไป')}><ChevronRight size={16} strokeWidth={1.75} /></button>
        </div>
      )}
    </section>
  );
}
