'use client';

import { Children, useCallback, useEffect, useRef, useState } from 'react';
import type { Locale } from '@/lib/i18n';

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Product screenshots: one large slide at a time, arrows, a counter and a thumbnail strip. Swipe works through scroll-snap. */
export function ScreenshotCarousel({ shots, labels }: { shots: { src: string; thumb: string; alt: string }[]; labels: { prev: string; next: string; region: string; show: string } }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const go = useCallback((i: number) => {
    const t = track.current;
    if (!t) return;
    const n = (i + shots.length) % shots.length;
    t.scrollTo({ left: n * t.clientWidth, behavior: reduceMotion() ? 'auto' : 'smooth' });
    setIndex(n);
  }, [shots.length]);

  // keep the counter and thumbnails in step when the user swipes
  useEffect(() => {
    const t = track.current;
    if (!t) return;
    // React skips the render when the rounded index has not changed, so no frame throttling is needed
    const onScroll = () => setIndex(Math.round(t.scrollLeft / Math.max(1, t.clientWidth)));
    t.addEventListener('scroll', onScroll, { passive: true });
    return () => t.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="pf-carousel" role="region" aria-roledescription="carousel" aria-label={labels.region}
      onKeyDown={(e) => { if (e.key === 'ArrowLeft') go(index - 1); if (e.key === 'ArrowRight') go(index + 1); }}>
      <div className="pf-carousel-stage">
        <div className="pf-carousel-track" ref={track}>
          {shots.map((s, i) => (
            <div className="pf-carousel-slide" key={i} aria-roledescription="slide" aria-label={`${i + 1} / ${shots.length}`} aria-hidden={i !== index}>
              <img src={s.src} alt={s.alt} loading={i ? 'lazy' : 'eager'} />
            </div>
          ))}
        </div>
        {shots.length > 1 && (
          <>
            <button type="button" className="pf-carousel-arrow is-prev" onClick={() => go(index - 1)} aria-label={labels.prev}>‹</button>
            <button type="button" className="pf-carousel-arrow is-next" onClick={() => go(index + 1)} aria-label={labels.next}>›</button>
            <span className="pf-carousel-count" aria-live="polite">{index + 1} / {shots.length}</span>
          </>
        )}
      </div>
      {shots.length > 1 && (
        <div className="pf-carousel-thumbs">
          {shots.map((s, i) => (
            <button type="button" key={i} className={i === index ? 'is-on' : ''} aria-current={i === index} aria-label={`${labels.show} ${i + 1}`} onClick={() => go(i)}>
              <img src={s.thumb} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Testimonials that advance on their own every `interval` ms; hover/focus pauses, reduced motion stops them (dots still work). */
export function TestimonialRotator({ children, interval = 15000, label, show, locale }: { children: React.ReactNode; interval?: number; label: string; show: string; locale: Locale }) {
  const items = Children.toArray(children);
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [stopped, setStopped] = useState(false);
  const paused = hover || stopped;
  useEffect(() => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setStopped(true); }, []);

  useEffect(() => {
    if (items.length < 2 || paused) return;
    const id = window.setInterval(() => { if (!document.hidden) setIndex((i) => (i + 1) % items.length); }, interval);
    return () => window.clearInterval(id);
  }, [items.length, paused, interval, index]);

  if (items.length < 2) return <>{items}</>;
  return (
    <div className="pf-rotator" role="region" aria-roledescription="carousel" aria-label={label}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
      <div className="pf-rotator-stack">
        {items.map((item, i) => <div key={i} className={`pf-rotator-item${i === index ? ' is-on' : ''}`} aria-hidden={i !== index}>{item}</div>)}
      </div>
      <div className="pf-rotator-dots">
        {items.map((_, i) => (
          <button type="button" key={i} className={`car-dot${i === index ? ' is-on' : ''}`} aria-current={i === index} aria-label={`${show} ${i + 1}`} onClick={() => setIndex(i)}>
            {i === index && !paused && <i style={{ animationDuration: `${interval}ms` }} key={index} />}
          </button>
        ))}
      </div>
    </div>
  );
}

/** "View all N" in a section header: reveals the extra items in the same section. */
export function ShowAllToggle({ more, less }: { more: string; less: string }) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => { btn.current?.closest('section')?.toggleAttribute('data-all', open); }, [open]);
  return <button type="button" ref={btn} className="pf-showall" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{open ? less : more}</button>;
}
