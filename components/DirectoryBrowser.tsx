'use client';

import { useEffect, useMemo, useState } from 'react';
import { pick, type Locale } from '@/lib/i18n';

type Item = { slug: string; name: string; company: string; categories: string[]; card: React.ReactNode };
const BATCH = 12;

/** Search, category filter, A–Z sort and "Load more" over server-rendered vendor cards. */
export function DirectoryBrowser({ items, categories, locale }: { items: Item[]; categories: { slug: string; label: string }[]; locale: Locale }) {
  const t = (en: string, th: string) => pick(locale, en, th);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<'az' | 'za'>('az');
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
      .sort((a, b) => a.name.localeCompare(b.name, locale, { sensitivity: 'base' }) * (sort === 'za' ? -1 : 1));
  }, [items, query, category, sort, locale, labelOf]);

  const reset = () => { setQuery(''); setCategory('all'); setSort('az'); setVisible(BATCH); };

  return (
    <>
      <section className="directory-controls" aria-label={t('Directory filters', 'ตัวกรองไดเรกทอรี')}>
        <label><span>{t('Search vendors or capabilities', 'ค้นหาผู้ให้บริการหรือความสามารถ')}</span>
          <input id="directory-search" type="search" placeholder={t('e.g. CRM, LINE, Clicknext', 'เช่น CRM, LINE, Clicknext')} autoComplete="off"
            value={query} onChange={(e) => { setQuery(e.target.value); setVisible(BATCH); }} />
        </label>
        <label><span>{t('Category', 'หมวดหมู่')}</span>
          <select id="directory-category" value={category} onChange={(e) => { setCategory(e.target.value); setVisible(BATCH); }}>
            <option value="all">{t('All categories', 'ทุกหมวดหมู่')}</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
        </label>
        <label><span>{t('Sort by', 'เรียงตาม')}</span>
          <select id="directory-sort" value={sort} onChange={(e) => setSort(e.target.value as 'az' | 'za')}>
            <option value="az">A–Z</option><option value="za">Z–A</option>
          </select>
        </label>
        <button type="button" id="directory-reset" onClick={reset}>{t('Reset filters', 'ล้างตัวกรอง')}</button>
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
