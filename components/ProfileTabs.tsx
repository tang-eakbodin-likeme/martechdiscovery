'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Section tabs for the profile bar: highlights the section under the sticky bar and slides an underline to it.
 * Clicking a tab scrolls smoothly (CSS scroll-behavior on the page, off when the user prefers reduced motion).
 */
export function ProfileTabs({ tabs, label }: { tabs: [string, string][]; label: string }) {
  const [active, setActive] = useState(tabs[0]?.[0]);
  const [ink, setInk] = useState<{ left: number; width: number } | null>(null);
  const nav = useRef<HTMLElement>(null);
  const lock = useRef(0); // while a click-scroll runs, keep the clicked tab instead of the ones scrolled past

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // Once the bar reaches the top, the section whose top has reached the bar's bottom edge is the one being read;
      // before that the overview is on screen.
      const bar = nav.current?.closest('.pf-bar')?.getBoundingClientRect();
      let current = tabs[0]?.[0];
      // within 64px of the top (the compact row's height) only a sliver of the overview is left
      if (bar && bar.top <= 64) {
        // the overview has gone behind the bar, so whatever sits under the bar is the next section
        const hero = document.getElementById(tabs[0]?.[0] ?? '');
        if (hero && hero.getBoundingClientRect().bottom <= bar.bottom && tabs[1]) current = tabs[1][0];
        for (const [id] of tabs.slice(1)) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= bar.bottom + 48) current = id;
        }
      }
      // at the very bottom the last short sections never reach the bar
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = tabs[tabs.length - 1]?.[0];
      if (Date.now() >= lock.current) setActive(current);
      // once the hero has scrolled away, the bar slides the compact overview in (Capterra-style)
      const hero = document.getElementById('overview');
      nav.current?.closest('.pf-bar')?.classList.toggle('is-stuck', !!hero && hero.getBoundingClientRect().bottom <= 0);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [tabs]);

  // The app router does not jump to hashes itself: handle a #section in the URL on load and any in-page #link click.
  useEffect(() => {
    const jump = (id: string, smooth: boolean) => {
      const target = id && document.getElementById(id);
      if (!target) return false;
      lock.current = Date.now() + 900;
      if (tabs.some(([t]) => t === id)) setActive(id);
      target.scrollIntoView({ behavior: smooth && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto', block: 'start' });
      return true;
    };
    // wait for the full load so fonts and images above the section are laid out before measuring
    const initial = decodeURIComponent(location.hash.slice(1));
    let timer = 0;
    const onLoad = () => { timer = window.setTimeout(() => jump(initial, false), 60); };
    if (initial) { if (document.readyState === 'complete') onLoad(); else window.addEventListener('load', onLoad, { once: true }); }
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]');
      if (!a || nav.current?.contains(a) || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
      const id = decodeURIComponent(a.getAttribute('href')!.slice(1));
      if (jump(id, true)) { e.preventDefault(); history.replaceState(null, '', `#${id}`); }
    };
    document.addEventListener('click', onClick);
    return () => { window.clearTimeout(timer); window.removeEventListener('load', onLoad); document.removeEventListener('click', onClick); };
  }, [tabs]);

  // move the underline under the active tab, and keep that tab visible when the strip scrolls sideways (phones)
  useLayoutEffect(() => {
    const el = nav.current?.querySelector<HTMLAnchorElement>(`a[href="#${active}"]`);
    if (!el || !nav.current) return;
    setInk({ left: el.offsetLeft, width: el.offsetWidth });
    const n = nav.current;
    if (el.offsetLeft < n.scrollLeft || el.offsetLeft + el.offsetWidth > n.scrollLeft + n.clientWidth) n.scrollTo({ left: el.offsetLeft - 16, behavior: 'smooth' });
  }, [active]);

  return (
    <nav className="pf-tabs" aria-label={label} ref={nav}>
      {tabs.map(([id, text]) => (
        <a key={id} href={`#${id}`} className={id === active ? 'is-on' : ''} aria-current={id === active ? 'location' : undefined}
          onClick={(e) => {
            const target = document.getElementById(id);
            if (!target) return;
            // scroll here rather than relying on the hash jump, which the app router can swallow on the first click
            e.preventDefault();
            lock.current = Date.now() + 900;
            setActive(id);
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
            history.replaceState(null, '', `#${id}`);
          }}>{text}</a>
      ))}
      {ink && <span className="pf-tabs-ink" style={{ transform: `translateX(${ink.left}px)`, width: ink.width }} aria-hidden="true" />}
    </nav>
  );
}
