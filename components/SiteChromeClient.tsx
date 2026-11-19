'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CircleUser, Menu, Moon, Sun, X } from 'lucide-react';
import { pick, type Locale } from '@/lib/i18n';

type Me = { role?: string; name?: string; email?: string };

/** Fetches the signed-in account once per page. Signed-out visitors get null. */
export function useAccount() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    fetch('/api/member/me/', { credentials: 'same-origin' })
      .then((r) => (r.ok ? (r.json() as Promise<{ user?: Me }>) : null))
      .then((d) => alive && setMe(d?.user ?? null))
      .catch(() => alive && setMe(null));
    return () => { alive = false; };
  }, []);
  return me;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  // A language switch rebuilds the page shell on the client, where the inline theme script does not run again,
  // so reapply the saved theme here, before paint.
  useLayoutEffect(() => {
    let saved: string | null = null;
    try { saved = JSON.parse(localStorage.getItem('mdp-site-config-v1') || '{}').theme || localStorage.getItem('mdp-theme'); } catch { /* storage blocked */ }
    const next = (saved ?? document.documentElement.dataset.theme) === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    setTheme(next);
  }, []);
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('mdp-theme', next);
      const prefs = JSON.parse(localStorage.getItem('mdp-site-config-v1') || '{}');
      localStorage.setItem('mdp-site-config-v1', JSON.stringify({ ...prefs, theme: next }));
    } catch { /* storage blocked: theme still applies for this page */ }
    setTheme(next);
  };
  return (
    <button className="iconbtn" id="theme" type="button" aria-label="Switch theme" onClick={toggle}>
      {theme === 'dark' ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
    </button>
  );
}

const NAV = [
  { seg: 'categories', en: 'Categories', th: 'หมวดหมู่' },
  { seg: 'tools', en: 'Explore tools', th: 'สำรวจเครื่องมือ' },
  { seg: 'buyer-guide', en: 'Buyer Guide', th: 'คู่มือเลือกซื้อ' },
] as const;

/** Which top-level section a path belongs to; provider profiles sit under Categories, as their breadcrumb does. */
const sectionOf = (path: string, locale: Locale) => {
  const seg = path.replace(new RegExp(`^/${locale}/?`), '').split('/')[0];
  return seg === 'providers' ? 'categories' : seg;
};

/** Main menu with the current section marked. */
export function NavLinks({ locale, className = 'site-nav' }: { locale: Locale; className?: string }) {
  const current = sectionOf(usePathname() || '', locale);
  return (
    <nav className={className} aria-label={pick(locale, 'Main', 'เมนูหลัก')}>
      {NAV.map((n) => (
        <Link key={n.seg} href={`/${locale}/${n.seg}/`} className={n.seg === current ? 'is-on' : undefined} aria-current={n.seg === current ? 'page' : undefined}>
          {pick(locale, n.en, n.th)}
        </Link>
      ))}
    </nav>
  );
}

/** TH | EN: the current language is highlighted, the other links to the same page in that language. */
export function LanguageSwitch({ locale }: { locale: Locale }) {
  const path = usePathname() || `/${locale}/`;
  return (
    <span className="langswitch" role="group" aria-label={pick(locale, 'Language', 'ภาษา')}>
      {(['th', 'en'] as const).map((l) => l === locale
        ? <span key={l} className="is-on" aria-current="true">{l.toUpperCase()}</span>
        : <Link key={l} href={path.replace(new RegExp(`^/${locale}(?=/|$)`), `/${l}`)} lang={l} hrefLang={l}>{l.toUpperCase()}</Link>)}
    </span>
  );
}

/** Signed out: "Sign in". Signed in: one account button with Your account (and Admin for staff) in a menu. */
export function AccountMenu({ locale }: { locale: Locale }) {
  const me = useAccount();
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current?.open && !ref.current.contains(e.target as Node)) ref.current.open = false; };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);
  if (me === undefined) return <span className="account-slot" aria-hidden="true" />;
  if (!me) return <Link className="button small" href={`/${locale}/login/`}>{pick(locale, 'Sign in', 'เข้าสู่ระบบ')}</Link>;
  const staff = ['admin', 'super_admin'].includes(me.role ?? '');
  return (
    <details className="account-menu" ref={ref}>
      <summary className="iconbtn" aria-label={pick(locale, 'Account', 'บัญชี')}><CircleUser size={18} strokeWidth={1.5} /></summary>
      <div className="account-pop">
        {(me.name || me.email) && <span className="account-who">{me.name || me.email}</span>}
        <Link href={`/${locale}/member/`}>{pick(locale, 'Your account', 'บัญชีของคุณ')}</Link>
        {staff && <a href="/admin/">{pick(locale, 'Admin', 'หลังบ้าน')}</a>}
      </div>
    </details>
  );
}

/** Below 1100px: a menu button that opens the main links, language, For Providers and sign-in. */
export function MobileMenu({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const me = useAccount();
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  const staff = me && ['admin', 'super_admin'].includes(me.role ?? '');
  return (
    <>
      <button type="button" className="iconbtn menu-btn" aria-expanded={open} aria-controls="site-menu" aria-label={pick(locale, 'Menu', 'เมนู')} onClick={() => setOpen((o) => !o)}>
        {open ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
      </button>
      <div id="site-menu" className="menu-panel" hidden={!open}>
        <NavLinks locale={locale} className="menu-links" />
        <div className="menu-row">
          <LanguageSwitch locale={locale} />
          <Link className="signin-link" href={`/${locale}/for-providers/`}>{pick(locale, 'For Providers', 'สำหรับผู้ให้บริการ')}</Link>
          {staff && <a className="signin-link" href="/admin/">{pick(locale, 'Admin', 'หลังบ้าน')}</a>}
        </div>
        {me ? <Link className="button" href={`/${locale}/member/`}>{pick(locale, 'Your account', 'บัญชีของคุณ')}</Link>
          : <Link className="button" href={`/${locale}/login/`}>{pick(locale, 'Sign in', 'เข้าสู่ระบบ')}</Link>}
      </div>
    </>
  );
}
