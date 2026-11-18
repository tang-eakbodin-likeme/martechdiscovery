'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Columns3, Heart, Plus, Search } from 'lucide-react';
import { pick, type Locale } from '@/lib/i18n';

export type HomeVendor = {
  slug: string; name: string; categoryLabel: string; categories: string[]; text: string; pending: boolean;
  featured: boolean; logo?: string; initial: string; pricing: string; languages: string; fit: string;
};
type Filter = { slug: string; label: string };

const SEARCH_EVENT = 'mdp-home-search';
const STORAGE_KEY = 'mdp-shortlist';
const FEATURED_ON_LOAD = ['BUZZEBEES', 'AppsFlyer', 'Saifa AI', 'Wisesight', 'Sellsuki', 'Clicknext', 'Zoho Corporation', 'Pay Solutions', 'Anymind'];

/** Hero search: sends the query to the directory section below and scrolls to it. */
export function HeroSearch({ locale }: { locale: Locale }) {
  const [q, setQ] = useState('');
  return (
    <form id="search" className="search" onSubmit={(e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent(SEARCH_EVENT, { detail: q.trim() }));
      document.getElementById('directory')?.scrollIntoView();
    }}>
      <span><Search size={18} strokeWidth={1.5} /></span>
      <label className="sr-only" htmlFor="query">{pick(locale, 'Search the directory', 'ค้นหาในไดเรกทอรี')}</label>
      <input id="query" value={q} onChange={(e) => setQ(e.target.value)} placeholder={pick(locale, 'Search vendors or capabilities', 'ค้นหาผู้ให้บริการหรือความสามารถ')} />
      <button className="button">{pick(locale, 'Search', 'ค้นหา')}</button>
    </form>
  );
}

/** Homepage directory: filter chips, compare (up to 3), shortlist saved in this browser, and the brief demo. */
export function HomeDirectory({ vendors, filters, locale }: { vendors: HomeVendor[]; filters: Filter[]; locale: Locale }) {
  const t = (en: string, th: string) => pick(locale, en, th);
  const [active, setActive] = useState('all');
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState<string[]>([]);
  const [compared, setCompared] = useState<string[]>([]);
  const [modal, setModal] = useState<null | 'shortlist' | 'compare' | 'brief' | 'sent'>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch { /* storage blocked */ }
    const onSearch = (e: Event) => { setQuery(String((e as CustomEvent).detail || '')); setActive('all'); };
    window.addEventListener(SEARCH_EVENT, onSearch);
    return () => window.removeEventListener(SEARCH_EVENT, onSearch);
  }, []);
  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setModal(null);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [modal]);
  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

  const list = useMemo(() => {
    const q = query.toLocaleLowerCase();
    if (!q && active === 'all') return vendors.filter((v) => FEATURED_ON_LOAD.includes(v.name));
    return vendors.filter((v) => (active === 'all' || v.categories.includes(active)) && `${v.name} ${v.text} ${v.categoryLabel}`.toLocaleLowerCase().includes(q));
  }, [vendors, query, active]);

  const toggleSave = (slug: string) => {
    const next = saved.includes(slug) ? saved.filter((s) => s !== slug) : [...saved, slug];
    setSaved(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* storage blocked */ }
  };
  const toggleCompare = (slug: string) => {
    if (compared.includes(slug)) return setCompared(compared.filter((s) => s !== slug));
    if (compared.length >= 3) return flash(t('Compare up to three providers at a time.', 'เปรียบเทียบได้สูงสุดครั้งละสามราย'));
    setCompared([...compared, slug]);
  };
  const bySlug = (slugs: string[]) => vendors.filter((v) => slugs.includes(v.slug));
  const Logo = ({ v }: { v: HomeVendor }) => (
    <div className="logo-tile">{v.logo ? <img src={`/assets/vendor-logos/${encodeURIComponent(v.logo)}`} alt="" loading="lazy" /> : v.initial}</div>
  );

  return (
    <>
      <div className="filters">
        <button className={`filter${active === 'all' ? ' active' : ''}`} onClick={() => { setActive('all'); setQuery(''); }}>
          {t('All tools', 'เครื่องมือทั้งหมด')} <span>{vendors.length}</span>
        </button>
        {filters.map((f) => <button key={f.slug} className={`filter${active === f.slug ? ' active' : ''}`} onClick={() => setActive(f.slug)}>{f.label}</button>)}
      </div>
      {query && <p className="directory-summary">{list.length} {t(`results for “${query}”`, `ผลลัพธ์สำหรับ “${query}”`)}</p>}
      <div className="tool-grid" id="tools">
        {list.map((v) => (
          <article className="tool" key={v.slug}>
            <div className="tool-top"><Logo v={v} />{v.featured && <span className="badge">{t('Featured', 'แนะนำ')}</span>}</div>
            <h3>{v.name}</h3>
            <p className={v.pending ? 'is-pending' : ''}>{v.text}</p>
            <div className="tags"><span>{v.categoryLabel}</span></div>
            <div className="tool-bottom">
              <Link className="profile-link" href={`/${locale}/providers/${v.slug}/`}>{t('View profile', 'ดูโปรไฟล์')}</Link>
              <div>
                <button className={`compare-check${compared.includes(v.slug) ? ' selected' : ''}`} onClick={() => toggleCompare(v.slug)}>
                  <Plus size={16} strokeWidth={1.5} /> {t('Compare', 'เปรียบเทียบ')}
                </button>
                <button className={`save${saved.includes(v.slug) ? ' saved' : ''}`} onClick={() => toggleSave(v.slug)}
                  aria-label={saved.includes(v.slug) ? t(`Remove ${v.name} from shortlist`, `นำ ${v.name} ออกจาก shortlist`) : t(`Add ${v.name} to shortlist`, `เพิ่ม ${v.name} ใน shortlist`)}>
                  <Heart size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className={`shortlist-dock${saved.length || compared.length ? ' visible' : ''}`} id="shortlist-dock">
        <button onClick={() => setModal('shortlist')}><Heart size={16} strokeWidth={1.5} /> Shortlist <span id="shortlist-count">{saved.length}</span></button>
        <button onClick={() => (compared.length < 2 ? flash(t('Choose at least two providers to compare.', 'เลือกอย่างน้อยสองรายเพื่อเปรียบเทียบ')) : setModal('compare'))}>
          <Columns3 size={16} strokeWidth={1.5} /> {t('Compare', 'เปรียบเทียบ')} <span id="compare-count">{compared.length}/3</span>
        </button>
      </aside>

      {modal && (
        <div className="modal open" id="modal" aria-hidden="false">
          <div className="modal-backdrop" onClick={() => setModal(null)} />
          <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <button className="modal-close" onClick={() => setModal(null)} aria-label={t('Close', 'ปิด')}>×</button>
            {modal === 'shortlist' && (
              <>
                <div className="eyebrow"><i>/</i> {t('Your saved providers', 'ผู้ให้บริการที่บันทึกไว้')}</div>
                <h2 id="modal-title">Shortlist ({saved.length})</h2>
                {saved.length ? (
                  <>
                    <div className="shortlist-list">
                      {bySlug(saved).map((v) => <div key={v.slug}><Logo v={v} /><b>{v.name}</b><Link href={`/${locale}/providers/${v.slug}/`}>{t('View profile', 'ดูโปรไฟล์')}</Link></div>)}
                    </div>
                    <button className="button" onClick={() => setModal('brief')}>{t('Send a brief', 'ส่งบรีฟ')}</button>
                  </>
                ) : <p className="modal-lead">{t('Save providers from the directory and they will appear here.', 'บันทึกผู้ให้บริการจากไดเรกทอรีแล้วจะแสดงที่นี่')}</p>}
              </>
            )}
            {modal === 'compare' && (
              <>
                <div className="eyebrow"><i>/</i> {t('Side by side', 'เทียบกัน')}</div>
                <h2 id="modal-title">{t('Compare providers', 'เปรียบเทียบผู้ให้บริการ')}</h2>
                <div className="compare-table">
                  <div className="compare-row heading"><b>{t('Capability', 'ความสามารถ')}</b>{bySlug(compared).map((v) => <b key={v.slug}>{v.name}</b>)}</div>
                  {([[t('Category', 'หมวดหมู่'), 'categoryLabel'], [t('Pricing model', 'รูปแบบราคา'), 'pricing'], [t('Language support', 'ภาษาที่รองรับ'), 'languages'], [t('PDPA readiness', 'ความพร้อม PDPA'), null], [t('Company fit', 'ขนาดธุรกิจที่เหมาะ'), 'fit']] as const).map(([label, key]) => (
                    <div className="compare-row" key={label}><span>{label}</span>{bySlug(compared).map((v) => <b key={v.slug}>{key ? v[key] : t('Confirm with provider', 'ตรวจสอบกับผู้ให้บริการ')}</b>)}</div>
                  ))}
                </div>
                <p className="disclosure">{t('Editorial comparison based on available factual information. Featured status does not affect comparison criteria.', 'การเปรียบเทียบอิงข้อมูลข้อเท็จจริงที่มี สถานะแนะนำไม่มีผลต่อเกณฑ์การเปรียบเทียบ')}</p>
              </>
            )}
            {modal === 'brief' && (
              <>
                <div className="eyebrow"><i>/</i> {t('Connect with providers', 'ติดต่อผู้ให้บริการ')}</div>
                <h2 id="modal-title">{t('Send your brief', 'ส่งบรีฟของคุณ')}</h2>
                <p className="modal-lead">{t('Choose which providers may receive your request.', 'เลือกผู้ให้บริการที่จะได้รับคำขอของคุณ')}</p>
                <form className="lead-form" onSubmit={(e) => {
                  e.preventDefault();
                  if (!e.currentTarget.querySelectorAll('[name=provider]:checked').length) return flash(t('Select at least one provider to share your brief.', 'เลือกผู้ให้บริการอย่างน้อยหนึ่งราย'));
                  setModal('sent');
                }}>
                  <label>{t('Name', 'ชื่อ')}<input required placeholder={t('Your name', 'ชื่อของคุณ')} /></label>
                  <label>{t('Work email', 'อีเมลที่ทำงาน')}<input required type="email" placeholder="you@company.com" /></label>
                  <label>{t('Company', 'บริษัท')}<input required placeholder={t('Company name', 'ชื่อบริษัท')} /></label>
                  <label>{t('What are you looking for?', 'คุณกำลังมองหาอะไร')}<textarea required rows={3} placeholder={t('Share your goals, budget, and timeline', 'เป้าหมาย งบประมาณ และกรอบเวลา')} /></label>
                  <fieldset>
                    <legend>{t('Share this brief with these providers', 'แชร์บรีฟนี้กับผู้ให้บริการเหล่านี้')}</legend>
                    {bySlug(saved).map((v) => <label className="check" key={v.slug}><input type="checkbox" name="provider" value={v.slug} /> {t(`I agree to share my brief with ${v.name}`, `ยินยอมให้แชร์บรีฟกับ ${v.name}`)}</label>)}
                  </fieldset>
                  <button className="button">{t('Send brief', 'ส่งบรีฟ')}</button>
                </form>
              </>
            )}
            {modal === 'sent' && (
              <>
                <div className="eyebrow"><i>/</i> {t('Ready to go', 'พร้อมแล้ว')}</div>
                <h2 id="modal-title">{t('Brief prepared', 'เตรียมบรีฟแล้ว')}</h2>
                <p className="modal-lead">{t('Demo mode: no data was sent. Consent is recorded per selected provider in the real product.', 'โหมดสาธิต: ยังไม่มีการส่งข้อมูล ในระบบจริงจะบันทึกความยินยอมแยกตามผู้ให้บริการ')}</p>
              </>
            )}
          </section>
        </div>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
