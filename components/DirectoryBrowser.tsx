'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { pick, type Locale } from '@/lib/i18n';
import { useScrollEdges } from './useScrollEdges';

type Item = { slug: string; name: string; company: string; categories: string[]; rank: number; card: React.ReactNode };
type Sort = 'rec' | 'az' | 'za';
const BATCH = 12;

/** Search, category filter, sort (recommended first by default) and "Load more" over server-rendered vendor cards. */
export function DirectoryBrowser({ items, categories, locale }: { items: Item[]; categories: { slug: string; label: string }[]; locale: Locale }) {
  const t = (en: string, th: string) => pick(locale, en, th);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<Sort>('rec');
  const [visible, setVisible] = useState(BATCH);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const q = p.get('q'); const c = p.get('category');
    if (q) setQuery(q);
    if (c && categories.some((x) => x.slug === c)) setCategory(c);
  }, [categories]);
  const labelOf = useMemo(() => new Map(categories.map((c) => [c.slug, c.label.toLocaleLowerCase()])), [categories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return items
      .filter((i) => (!q || i.company.includes(q) || i.name.toLocaleLowerCase().includes(q) || i.categories.some((c) => labelOf.get(c)?.includes(q))) && (category === 'all' || i.categories.includes(category)))
      .sort((a, b) => (sort === 'rec' ? b.rank - a.rank : 0) || a.name.localeCompare(b.name, locale, { sensitivity: 'base' }) * (sort === 'za' ? -1 : 1));
  }, [items, query, category, sort, locale, labelOf]);

  // keep the selected category tab in view (it can start off to the right, e.g. from a ?category= link)
  useEffect(() => { document.querySelector('.directory-cats .is-on')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }, [category]);

  // arrows for the category row: enabled only when the row can scroll further that way
  const { ref: row, edges, nudge } = useScrollEdges<HTMLDivElement>();
  const reset = () => { setQuery(''); setCategory('all'); setSort('rec'); setVisible(BATCH); };

  return (
    <>
      <section className="directory-controls" aria-label={t('Directory filters', 'ตัวกรองไดเรกทอรี')}>
        <label><span>{t('Search vendors or capabilities', 'ค้นหาผู้ให้บริการหรือความสามารถ')}</span>
          <input id="directory-search" type="search" placeholder={t('e.g. CRM, LINE, Clicknext', 'เช่น CRM, LINE, Clicknext')} autoComplete="off"
            value={query} onChange={(e) => { setQuery(e.target.value); setVisible(BATCH); }} />
        </label>
        <label className="directory-sort"><span>{t('Sort by', 'เรียงตาม')}</span>
          <select id="directory-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="rec">{t('Recommended', 'แนะนำ')}</option><option value="az">A–Z</option><option value="za">Z–A</option>
          </select>
        </label>
        <button type="button" id="directory-reset" onClick={reset}>{t('Reset filters', 'ล้างตัวกรอง')}</button>
        {/* category filter as tabs; categories with no vendors are left out */}
        <div className={`directory-cats-wrap${edges.start ? ' at-start' : ''}${edges.end ? ' at-end' : ''}`}>
        <button type="button" className="cats-arrow is-prev" onClick={() => nudge(-1)} disabled={edges.start} aria-label={t('Previous categories', 'หมวดหมู่ก่อนหน้า')}><ChevronLeft size={18} strokeWidth={1.75} /></button>
        <div className="directory-cats" role="group" aria-label={t('Category', 'หมวดหมู่')} ref={row}>
          {[{ slug: 'all', label: t('All categories', 'ทุกหมวดหมู่'), n: items.length }, ...categories.map((c) => ({ ...c, n: items.filter((i) => i.categories.includes(c.slug)).length })).filter((c) => c.n)].map((c) => (
            <button type="button" key={c.slug} className={category === c.slug ? 'is-on' : undefined} aria-pressed={category === c.slug}
              onClick={() => { setCategory(c.slug); setVisible(BATCH); }}>
              {c.label} <span>{c.n}</span>
            </button>
          ))}
        </div>
        <button type="button" className="cats-arrow is-next" onClick={() => nudge(1)} disabled={edges.end} aria-label={t('More categories', 'หมวดหมู่ถัดไป')}><ChevronRight size={18} strokeWidth={1.75} /></button>
        </div>
      </section>
      <div className="directory-summary">
        <span id="directory-count" aria-live="polite">
          {filtered.length} {t('companies', 'บริษัท')} · {Math.min(visible, filtered.length)} {t('shown', 'รายการที่แสดง')}
        </span>
        <span>{t('Suggested categories are pending verification', 'การจัดหมวดหมู่เป็นข้อเสนอที่รอตรวจสอบ')}</span>
      </div>
      <div className="route-grid directory-results" id="directory-results">
        {filtered.slice(0, visible).map((i) => <div key={i.slug} style={{ display: 'contents' }}>{i.card}</div>)}
      </div>
      {filtered.length > visible && (
        <button type="button" className="directory-more" id="directory-more" onClick={() => setVisible(visible + BATCH)}>{t('Load more', 'แสดงเพิ่ม')}</button>
      )}
      {filtered.length === 0 && <p className="empty-state" id="directory-empty">{t('No companies match these filters.', 'ไม่พบบริษัทที่ตรงกับตัวกรอง')}</p>}
    </>
  );
}
