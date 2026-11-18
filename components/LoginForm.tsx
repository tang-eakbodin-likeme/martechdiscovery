'use client';

import { useEffect, useState } from 'react';
import { pick, type Locale } from '@/lib/i18n';

export default function LoginForm({ locale }: { locale: Locale }) {
  const [error, setError] = useState('');

  // An account still on its temporary password goes straight to the change-password page.
  useEffect(() => {
    fetch('/api/member/me', { credentials: 'same-origin' })
      .then((r) => (r.ok ? (r.json() as Promise<{ user?: { mustChangePassword?: boolean } }>) : null))
      .then((d) => { if (d?.user?.mustChangePassword) location.replace(`/${locale}/change-password/`); })
      .catch(() => {});
  }, [locale]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const body = { ...Object.fromEntries(new FormData(e.currentTarget)), locale };
    try {
      const r = await fetch('/api/auth/login', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const text = await r.text();
      let d: { error?: string; redirect?: string };
      try { d = JSON.parse(text); } catch { throw Error(`Server error (${r.status}). Please retry or contact the platform team.`); }
      if (!r.ok) throw Error(d.error || `Request failed (${r.status})`);
      location.href = d.redirect!;
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form id="login-form" onSubmit={onSubmit}>
      <label>Username<input name="username" autoComplete="username" required /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
      <p className="auth-error" id="login-error" role="alert">{error}</p>
      <button className="button" type="submit">{pick(locale, 'Sign in', 'เข้าสู่ระบบ →')}</button>
    </form>
  );
}
