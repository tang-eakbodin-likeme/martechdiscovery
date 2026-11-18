'use client';

import { useEffect, useState } from 'react';
import { pick, type Locale } from '@/lib/i18n';

type Me = { user: { role: string; mustChangePassword?: boolean } };

export default function ChangePasswordForm({ locale }: { locale: Locale }) {
  const t = (en: string, th: string) => pick(locale, en, th);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const home = (role: string) => (role === 'member' ? `/${locale}/member/` : '/admin/');

  // Only signed-in accounts that still have a temporary password belong here.
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/member/me', { credentials: 'same-origin' });
        if (r.status === 401) { location.replace(`/${locale}/login/`); return; }
        const d = (await r.json()) as Me & { error?: string };
        if (!r.ok) throw Error(d.error || 'Could not verify account');
        if (!d.user.mustChangePassword) location.replace(home(d.user.role));
      } catch (e) {
        setStatus((e as Error).message);
      }
    })();
  }, [locale]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const body = { ...Object.fromEntries(new FormData(e.currentTarget)), locale };
    try {
      const r = await fetch('/api/auth/password', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const text = await r.text();
      let d: { error?: string };
      try { d = JSON.parse(text); } catch { throw Error(`Server error (${r.status}). Please retry.`); }
      if (!r.ok) throw Error(d.error || `Request failed (${r.status})`);
      const me: Me = await fetch('/api/member/me', { credentials: 'same-origin' }).then((res) => res.json());
      location.href = home(me.user.role);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <>
      <div id="status" aria-live="polite">{status}</div>
      <form id="change-form" onSubmit={onSubmit}>
        <label>{t('New password', 'รหัสผ่านใหม่')}<input name="password" type="password" autoComplete="new-password" required minLength={8} /></label>
        <label>{t('Confirm password', 'ยืนยันรหัสผ่าน')}<input name="confirm" type="password" autoComplete="new-password" required minLength={8} /></label>
        <p className="auth-error" id="change-error" role="alert">{error}</p>
        <button className="button" type="submit">{t('Save new password →', 'บันทึกรหัสผ่านใหม่ →')}</button>
      </form>
    </>
  );
}
