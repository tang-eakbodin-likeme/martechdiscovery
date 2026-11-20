'use client';

import { pick, type Locale } from '@/lib/i18n';
import { demoSignIn, demoSlug, type DemoPlan } from '@/lib/demoVendor';

/** Prototype: sign in as the owner of a sample profile, then land on that profile. */
export default function DemoVendorLogin({ locale }: { locale: Locale }) {
  const go = (plan: DemoPlan) => { demoSignIn(plan); location.href = `/${locale}/providers/${demoSlug(plan)}/`; };
  return (
    <div className="demo-vendor">
      <p>{pick(locale, 'Vendor demo (prototype): try the owner view of a sample profile.', 'ทดลองมุมมองเจ้าของโปรไฟล์ (ต้นแบบ) ด้วยโปรไฟล์ตัวอย่าง')}</p>
      <div className="demo-vendor-buttons">
        <button type="button" className="button secondary" onClick={() => go('free')}>{pick(locale, 'Try as a Basic profile', 'ลองเข้าใช้แบบ Profile Basic')}</button>
        <button type="button" className="button secondary" onClick={() => go('featured')}>{pick(locale, 'Try as a Featured profile', 'ลองเข้าใช้แบบ Profile Featured')}</button>
      </div>
    </div>
  );
}
