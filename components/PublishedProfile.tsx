'use client';

import type { Vendor } from '@/lib/catalog';
import type { Locale } from '@/lib/i18n';
import { useDemoVendor } from '@/lib/demoVendor';
import { ProfilePage } from './ProfilePage';

/** Shows a Featured vendor's published edits (prototype: stored in this browser) in place of the built profile. */
export function PublishedProfile({ vendor, locale, related, sample, children }: {
  vendor: Vendor; locale: Locale; related: React.ReactNode[]; sample: boolean; children: React.ReactNode;
}) {
  const live = useDemoVendor()?.live[vendor.slug];
  return live ? <ProfilePage vendor={vendor} content={live} locale={locale} related={related} sample={sample} /> : <>{children}</>;
}
