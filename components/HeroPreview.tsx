'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CheckSquare, Heart, Search, Square } from 'lucide-react';

export type PreviewRow = { slug: string; name: string; mark: React.ReactNode; featured: boolean };
export type PreviewSet = { query: string; count: number; category: string; rows: PreviewRow[] };

const TYPE_MS = 75;
const ERASE_MS = 35;
const HOLD_MS = 3800;

/**
 * Hero search preview: types each example query, then shows that search's results, holds, erases and moves on.
 * Pauses while hovered or focused; with reduced motion it shows the first search and does not cycle.
 */
export function HeroPreview({ sets, locale, labels }: {
  sets: PreviewSet[];
  locale: string;
  labels: { region: string; vendors: string; vendor: string; listing: string; featured: string; pending: string; compare: string; compareSelected: string };
}) {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(sets[0]?.query ?? '');
  const [phase, setPhase] = useState<'hold' | 'erase' | 'type'>('hold');
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
    else later(() => setPhase('hold'), 350);
    return () => window.clearTimeout(id);
  }, [phase, typed, index, sets]);

  const set = sets[index];
  const showing = phase === 'hold';
  return (
    <div className="hero-preview" aria-label={labels.region}
      onMouseEnter={() => { paused.current = true; }} onMouseLeave={() => { paused.current = false; }}
      onFocus={() => { paused.current = true; }} onBlur={() => { paused.current = false; }}>
      <div className="hp-bar">
        <div className="hp-query"><Search size={16} strokeWidth={1.5} /><span className="hp-typed">{typed}</span><i className={`hp-caret${showing ? '' : ' is-typing'}`} aria-hidden="true" /></div>
        <span className="hp-count">{showing ? `${set.count} ${labels.vendors}` : '…'}</span>
      </div>
      <div className="hp-head"><span>{labels.vendor}</span><span>{labels.listing}</span><span /></div>
      <ol className={`hp-list${showing ? '' : ' is-searching'}`} key={showing ? set.query : 'searching'}>
        {set.rows.map((v, i) => (
          <li key={v.slug} style={{ '--i': i } as React.CSSProperties}>
            <Link className={`hp-row${i < 2 ? ' is-selected' : ''}`} href={`/${locale}/providers/${v.slug}/`} tabIndex={showing ? undefined : -1}>
              <span className="hp-vendor">
                {v.mark}
                <span style={{ minWidth: 0 }}><span className="hp-name">{v.name}</span><span className="hp-cat">{set.category}</span></span>
              </span>
              <span className={`hp-status${v.featured ? ' is-sponsored' : ''}`}>{v.featured ? labels.featured : labels.pending}</span>
              <span className="hp-actions">{i < 2 ? <CheckSquare className="is-on" size={16} strokeWidth={1.5} /> : <Square size={16} strokeWidth={1.5} />}<Heart size={16} strokeWidth={1.5} /></span>
            </Link>
          </li>
        ))}
      </ol>
      <div className="hp-foot"><span>{labels.compare} <b>2/3</b></span><span className="hp-cta">{labels.compareSelected}</span></div>
    </div>
  );
}
