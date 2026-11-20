'use client';

import Link from 'next/link';
import { pick, type Locale } from '@/lib/i18n';
import { demoSlug, resetProfile, useDemoVendor } from '@/lib/demoVendor';
import { PARTS } from '@/lib/editParts';

/** Shown only to the signed-in owner of this profile: package, pending items and the edit button. Buyers never see it. */
export function OwnerBar({ slug, locale }: { slug: string; locale: Locale }) {
  const demo = useDemoVendor();
  if (!demo?.plan || demoSlug(demo.plan) !== slug) return null;
  const t = (en: string, th: string) => pick(locale, en, th);
  const F = demo.plan === 'featured';
  // Featured edits publish straight away, so only Basic has requests waiting for review
  const pending = F ? [] : demo.requests.filter((r) => r.slug === slug);
  const date = (iso: string) => new Date(iso).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const part = (k: string) => { const p = PARTS.find((x) => x.key === k); return p ? pick(locale, p.en, p.th) : k; };
  return (
    <section className="owner-bar" aria-label={t('Your profile', 'โปรไฟล์ของคุณ')}>
      <div className="owner-bar-row">
        <div className="owner-bar-who">
          <b>{t('You manage this profile', 'คุณเป็นเจ้าของโปรไฟล์นี้')}</b>
          <span className={`owner-plan ${F ? 'is-featured' : ''}`}>{F ? 'Featured' : 'Basic'}</span>
          <span className="owner-bar-sub">{F ? t('Edit anytime; changes go live straight away.', 'แก้ไขได้เองตลอด เผยแพร่ทันที') : t('Send edit requests; our team reviews them before publishing.', 'ส่งคำขอแก้ไขได้ ทีมงานตรวจสอบก่อนเผยแพร่')}</span>
        </div>
        {F && demo.live[slug] && <button type="button" className="button secondary small" onClick={() => resetProfile(slug)}>{t('Restore the sample', 'คืนค่าตัวอย่างเดิม')}</button>}
        <Link className="button small" href={`/${locale}/vendor/edit/`}>{F ? t('Edit profile', 'แก้ไขโปรไฟล์') : t('Request an edit', 'ขอแก้ไขข้อมูล')}</Link>
      </div>
      {pending.length > 0 && (
        <details className="owner-pending">
          <summary>{t(`${pending.length} pending review`, `รอตรวจสอบ ${pending.length} รายการ`)}</summary>
          <ul>
            {pending.map((r) => (
              <li key={r.id}><span className="owner-status">{t('Pending review', 'รอตรวจสอบ')}</span> {date(r.at)} {r.parts.map(part).join(', ')}</li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
