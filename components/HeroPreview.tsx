'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Search } from 'lucide-react';

/** One example search: the typed query, the directory category it maps to, and real directory cards for it. */
export type PreviewSet = { query: string; slug: string; category: string; count: number; cards: { slug: string; card: React.ReactNode }[] };

const TYPE_MS = 75;
const ERASE_MS = 35;
const HOLD_MS = 5000;

/**
 * Hero preview built like the directory page: search field, category filter, count, and the same vendor cards.
 * Types each example query, shows its results, holds, erases and moves on. Pauses while hovered or focused;
 * with reduced motion it shows the first search and does not cycle.
 */
export function HeroPreview({ sets, categories, locale, labels }: {
  sets: PreviewSet[];
  categories: { slug: string; label: string }[];
  locale: string;
  labels: { region: string; companies: string; shown: string; seeAll: string; category: string };
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(sets[0]?.query ?? '');
  const [phase, setPhase] = useState<'hold' | 'erase' | 'type'>('hold');
  // results (category, count, cards) change only once the typing has finished; until then the previous ones stay
  const [shownIndex, setShownIndex] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (sets.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const query = sets[index].query;
    let id = 0;
    const later = (fn: () => void, ms: number) => { id = window.setTimeout(() => (paused.current || document.hidden ? later(fn, 400) : fn()), ms); };
    if (phase === 'hold') later(() => setPhase('erase'), HOLD_MS);
    else if (phase === 'erase') {
      if (typed.length) later(() => setTyped(typed.slice(0, -1)), ERASE_MS);
      else later(() => { setIndex((index + 1) % sets.length); setPhase('type'); }, 250);
    } else if (typed.length < query.length) later(() => setTyped(query.slice(0, typed.length + 1)), TYPE_MS);
    else later(() => { setShownIndex(index); setPhase('hold'); }, 350);
    return () => window.clearTimeout(id);
  }, [phase, typed, index, sets]);

  const set = sets[shownIndex];
  const showing = phase === 'hold';
  const directory = `/${locale}/tools/?category=${set.slug}`;
  return (
    <div className="hero-preview" aria-label={labels.region}
      onMouseEnter={() => { paused.current = true; }} onMouseLeave={() => { paused.current = false; }}
      onFocus={() => { paused.current = true; }} onBlur={() => { paused.current = false; }}>
      {/* same controls as the directory page: the search types the example, the category list follows it and is a real filter */}
      <div className="hp-controls">
        <Link className="hp-field hp-search" href={directory} aria-label={`${sets[index].query} · ${labels.seeAll}`}><Search size={15} strokeWidth={1.5} /><span className="hp-typed">{typed}</span><i className={`hp-caret${showing ? '' : ' is-typing'}`} aria-hidden="true" /></Link>
        <label className="hp-field hp-select">
          <span className="sr-only">{labels.category}</span>
          <select value={set.slug} onChange={(e) => router.push(`/${locale}/tools/?category=${e.target.value}`)}>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
          <ChevronDown size={15} strokeWidth={1.5} aria-hidden="true" />
        </label>
      </div>
      <div className="hp-summary">{set.count} {labels.companies} · {set.cards.length} {labels.shown}</div>
      <div className={`hp-cards${showing ? '' : ' is-searching'}`} key={showing ? set.query : 'searching'} inert={!showing}>
        {set.cards.map((c, i) => <div key={c.slug} style={{ '--i': i } as React.CSSProperties}>{c.card}</div>)}
      </div>
      <div className="hp-foot"><Link className="hp-cta" href={directory}>{labels.seeAll} {showing ? set.count : ''} →</Link></div>
    </div>
  );
}
