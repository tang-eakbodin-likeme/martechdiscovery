'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
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

export function AccountLinks({ locale }: { locale: Locale }) {
  const me = useAccount();
  const staff = me && ['admin', 'super_admin'].includes(me.role ?? '');
  return (
    <>
      {me ? (
        <Link className="signin-link" href={`/${locale}/member/`}>{pick(locale, 'Your account', 'บัญชีของคุณ')}</Link>
      ) : (
        <Link className="signin-link" href={`/${locale}/login/`}>{pick(locale, 'Sign in', 'เข้าสู่ระบบ')}</Link>
      )}
      {staff && <a className="admin-demo-link" href="/admin/">{pick(locale, 'Admin', 'หลังบ้าน')}</a>}
    </>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  useEffect(() => { setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'); }, []);
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

/** Same page in the other language. */
export function LanguageLink({ locale, target }: { locale: Locale; target: Locale }) {
  const path = usePathname() || `/${locale}/`;
  const href = path.replace(new RegExp(`^/${locale}(?=/|$)`), `/${target}`);
  return <Link className="textbtn" href={href}>{target.toUpperCase()} <i>↔</i></Link>;
}
