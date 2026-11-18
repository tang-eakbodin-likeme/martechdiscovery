// Vendor profile content (vendor-profiles.json) and the free / Featured tier rules from the profile spec.
import profiles from '@/vendor-profiles.json';
import { local, type Locale, type LocalText } from './i18n';
import { categories, getCategory, vendorDescription, type Category, type Vendor } from './catalog';

type Titled = { title: LocalText; text?: LocalText };
export type ProfileContent = {
  featured?: boolean; productName?: string; website?: string; demoUrl?: string; trialUrl?: string; banner?: string; languages?: string;
  company?: { name?: string; country?: LocalText; website?: string; overview?: LocalText };
  categories?: string[]; description?: LocalText; overview?: { text?: LocalText; image?: string };
  benefits?: Titled[]; features?: Titled[]; audience?: LocalText[]; industries?: LocalText[]; useCases?: Titled[];
  screenshots?: string[]; videos?: { title: LocalText; url?: string }[];
  pricing?: {
    summary?: LocalText;
    plans?: { name: LocalText; price: LocalText; period?: LocalText; text?: LocalText; popular?: boolean }[];
    /** Plan comparison rows; each value lines up with plans[i]. "yes" / "no" render as a tick or a dash. */
    compare?: { label: LocalText; values: (LocalText | 'yes' | 'no')[] }[];
  };
  integrations?: { name: string; text?: LocalText }[]; customers?: LocalText[];
  testimonials?: { quote: LocalText; name: LocalText; role?: LocalText }[];
  caseStudies?: { customer: LocalText; problem: LocalText; solution: LocalText }[];
  awards?: LocalText[]; faqs?: { q: LocalText; a: LocalText }[];
  promotion?: { text: LocalText; url?: string }; imageCredits?: LocalText;
};

export const CAPS = {
  free: { categories: 2, description: 200, benefits: 3, features: 5, useCases: 2, screenshots: 1, videos: 0, integrations: 5, customers: 0, caseStudies: 0, testimonials: 0, faqs: 0 },
  featured: { categories: 6, description: 500, benefits: 10, features: 20, useCases: 10, screenshots: 10, videos: 3, integrations: 50, customers: 20, caseStudies: 5, testimonials: 5, faqs: 10 },
};

const data = profiles as { vendors: Record<string, ProfileContent>; samples: Record<string, ProfileContent> };
export const profileFor = (slug: string): ProfileContent | undefined => data.vendors[slug];
export const sampleProfile = (): ProfileContent | undefined => data.samples.sample;

export const SAMPLE_SLUGS = { featured: 'sample-featured', free: 'sample-free' } as const;

export const clip = (s: string, n: number) => {
  s = s.trim();
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), n - 20)).trim() + '…';
};

export type ProfileModel = {
  vendor: Vendor; content: ProfileContent; featured: boolean; cap: (typeof CAPS)['free'];
  company: string; title: string; hasProduct: boolean; categories: Category[]; description: string; website: string;
};

/** Joins a catalog vendor with its profile content and applies the tier caps. */
export function profileModel(vendor: Vendor, content: ProfileContent | undefined, locale: Locale): ProfileModel {
  const c = content ?? {};
  const featured = c.featured ?? vendor.sponsored;
  const cap = featured ? CAPS.featured : CAPS.free;
  const company = c.company?.name || vendor.name;
  const slugs = c.categories?.length ? c.categories : vendor.categories;
  const description = local(c.description, locale) || vendorDescription(vendor, locale);
  return {
    vendor, content: c, featured, cap, company, title: c.productName || company, hasProduct: !!c.productName,
    categories: slugs.map((s) => getCategory(s)).filter((x): x is Category => !!x).slice(0, cap.categories),
    description: clip(description, cap.description), website: c.website || c.company?.website || '',
  };
}

/** A catalog-shaped record for the sample profiles, which are not real vendors. */
export function sampleVendor(featured: boolean): Vendor {
  const s = sampleProfile();
  return {
    slug: featured ? SAMPLE_SLUGS.featured : SAMPLE_SLUGS.free, name: s?.company?.name ?? 'Sample Vendor', category: categories[0].name,
    description: '', pricing: 'Not yet verified', languages: 'Not yet verified', fit: 'Not yet verified',
    categories: s?.categories ?? [], descriptionTh: '', sponsored: featured, hasOverride: false,
  };
}
