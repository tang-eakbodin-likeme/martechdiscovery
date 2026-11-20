'use client';

import { useDemoVendor } from '@/lib/demoVendor';

/** The Featured banner across the top of a profile; a vendor's published edits (prototype, this browser) can replace or remove it. */
export function ProfileBanner({ slug, banner, videoLabel }: { slug: string; banner?: string; videoLabel?: string }) {
  const live = useDemoVendor()?.live[slug];
  const src = live ? live.banner : banner;
  if (!src) return null;
  const hasVideo = !!(live ? live.videos?.length : videoLabel);
  // the banner image as supplied: its text is part of the picture, so it does not change with the language
  return (
    <div className="pf-banner">
      {hasVideo ? <a href="#showcase" aria-label={videoLabel}><img src={src} alt="" /></a> : <img src={src} alt="" />}
    </div>
  );
}
