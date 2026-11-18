'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { categories, categoryName, getVendor } from '@/lib/catalog';
import { pick, type Locale } from '@/lib/i18n';
import { VendorLogo } from './VendorLogo';

type User = { name?: string; email?: string; role?: string };
type Favorite = { slug: string; createdAt: string };
const ROLES: Record<string, string> = { member: 'Member', admin: 'Admin', super_admin: 'Super Admin' };

export function MemberShortlist({ locale }: { locale: Locale }) {
  const t = (en: string, th: string) => pick(locale, en, th);
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const me = await fetch('/api/member/me/', { credentials: 'same-origin' });
      if (!me.ok) { setUser(null); return; }
      setUser(((await me.json()) as { user?: User }).user ?? {});
      const f = (await fetch('/api/member/favorites/', { credentials: 'same-origin' }).then((r) => r.json()).catch(() => ({}))) as { favorites?: Favorite[] };
      setFavorites(f.favorites ?? []);
    } catch { setError(true); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const remove = async (slug: string) => {
    await fetch('/api/member/favorites/', { method: 'DELETE', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
    load();
  };
  const signOut = async () => {
    await fetch('/api/auth/logout/', { method: 'POST', credentials: 'same-origin' });
    router.push(`/${locale}/login/`);
  };

  const date = (iso: string) => new Date(iso).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <>
      <section className="member-head">
        <div>
          <h1>{t('Your shortlist', 'Shortlist ของคุณ')}</h1>
          <p className="member-muted">
            {error ? t('We could not check your account. Try again.', 'ไม่สามารถตรวจสอบบัญชีได้ ลองใหม่อีกครั้ง')
              : user === undefined ? t('Checking your account…', 'กำลังตรวจสอบบัญชี…')
              : user === null ? <>{t('Sign in to see your shortlist', 'เข้าสู่ระบบเพื่อดู shortlist ของคุณ')} · <Link href={`/${locale}/login/`}>{t('Sign in', 'เข้าสู่ระบบ')}</Link></>
              : [user.name, user.email].filter(Boolean).join(' · ')}
          </p>
        </div>
        {user && <div className="member-actions"><button className="quiet" type="button" onClick={signOut}>{t('Sign out', 'ออกจากระบบ')}</button></div>}
      </section>

      <ul className="member-list" id="favorites">
        {user === null && <li className="member-empty">{t('Your saved vendors appear here after you sign in', 'Shortlist จะแสดงที่นี่หลังจากเข้าสู่ระบบ')}</li>}
        {user && favorites.length === 0 && (
          <li className="member-empty">{t('No saved vendors yet · ', 'ยังไม่มีผู้ให้บริการที่บันทึกไว้ · ')}<Link href={`/${locale}/tools/`}>{t('Explore MarTech', 'ค้นหา MarTech')}</Link></li>
        )}
        {user && favorites.map((f) => {
          const v = getVendor(f.slug);
          const cat = v ? categories.find((c) => c.name === v.category) : undefined;
          return (
            <li className="member-item" key={f.slug}>
              <VendorLogo name={v?.name ?? f.slug} />
              <div style={{ minWidth: 0 }}>
                <Link href={`/${locale}/providers/${encodeURIComponent(f.slug)}/`}>{v?.name ?? f.slug}</Link>
                <small>{cat ? categoryName(cat, locale) : v?.category}</small>
              </div>
              <time>{t('Saved', 'บันทึก')} {date(f.createdAt)}</time>
              <button type="button" onClick={() => remove(f.slug)}>{t('Remove', 'นำออก')}</button>
            </li>
          );
        })}
      </ul>
      {user?.role && <p className="member-role">{t('Account role', 'สิทธิ์บัญชี')}: <b>{ROLES[user.role] ?? user.role}</b></p>}
    </>
  );
}
