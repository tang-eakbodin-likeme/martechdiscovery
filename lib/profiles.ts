// Vendor profile content (vendor-profiles.json) and the free / Featured tier rules from the profile spec.
import profiles from '@/vendor-profiles.json';
import { local, type Locale, type LocalText } from './i18n';
import { categories, getCategory, vendorDescription, type Category, type Vendor } from './catalog';

type Titled = { title: LocalText; text?: LocalText };
export type ProfileContent = {
  featured?: boolean; productName?: string; logo?: string; tagline?: LocalText; cta?: { title: LocalText; text?: LocalText }; website?: string; websiteSource?: 'public'; demoUrl?: string; trialUrl?: string; banner?: string; languages?: string;
  company?: { name?: string; country?: LocalText; website?: string; overview?: LocalText };
  categories?: string[]; description?: LocalText; overview?: { text?: LocalText; image?: string };
  benefits?: Titled[]; features?: Titled[]; audience?: LocalText[]; industries?: LocalText[]; useCases?: Titled[];
  /** One sentence on who the product is for, shown above the use cases. */
  audienceText?: LocalText;
  /** The overview paragraph at the top of the profile, written as one piece (replaces the built company and product sentences). */
  summary?: LocalText;
  screenshots?: string[]; videos?: { title: LocalText; url?: string; thumb?: string; duration?: string }[];
  pricing?: {
    summary?: LocalText;
    plans?: { name: LocalText; price: LocalText; period?: LocalText; text?: LocalText; popular?: boolean }[];
    /** Plan comparison rows; each value lines up with plans[i]. "yes" / "no" render as a tick or a dash. */
    compare?: { label: LocalText; values: (LocalText | 'yes' | 'no')[] }[];
  };
  integrations?: { name: string; text?: LocalText; color?: string }[]; customers?: (LocalText | { name: LocalText; logo?: string })[];
  testimonials?: { quote: LocalText; name: LocalText; role?: LocalText }[];
  caseStudies?: { customer: LocalText; problem: LocalText; solution: LocalText; result?: LocalText }[];
  awards?: (LocalText | { name: LocalText; image?: string; source?: LocalText })[]; faqs?: { q: LocalText; a: LocalText }[];
  promotion?: { text: LocalText; url?: string; label?: LocalText; detail?: LocalText }; imageCredits?: LocalText;
};

export const CAPS = {
  free: { categories: 2, overview: 200, description: 350, benefits: 3, features: 5, useCases: 2, screenshots: 1, videos: 0, integrations: 5, customers: 0, caseStudies: 0, testimonials: 0, faqs: 0 },
  featured: { categories: 6, overview: 500, description: 500, benefits: 10, features: 20, useCases: 10, screenshots: 10, videos: 3, integrations: 50, customers: 20, caseStudies: 5, testimonials: 5, faqs: 10 },
};

const data = profiles as { vendors: Record<string, ProfileContent>; samples: Record<string, ProfileContent> };
export const profileFor = (slug: string): ProfileContent | undefined => data.vendors[slug];
export const sampleProfile = (): ProfileContent | undefined => data.samples.sample;

export const SAMPLE_SLUGS = { featured: 'sample-featured', free: 'sample-free' } as const;

const FREE_SUMMARY: LocalText = {
  th: 'Sample Vendor พัฒนาซอฟต์แวร์ข้อมูลลูกค้าและระบบสะสมแต้มสำหรับแบรนด์ค้าปลีกในไทย ผลิตภัณฑ์หลักคือ Sample CRM ที่รวมแชต LINE OA แต้มสะสม และโปรไฟล์ลูกค้าไว้ในที่เดียว',
  en: 'Sample Vendor builds customer data and loyalty software for Thai retail brands. Its main product, Sample CRM, puts LINE OA chats, loyalty points and customer profiles in one place.',
};
const FREE_DESCRIPTION: LocalText = {
  th: 'Sample CRM ช่วยแบ่งกลุ่มลูกค้า ส่งแคมเปญ และดูว่าแคมเปญไหนทำให้เกิดการซื้อ สามารถเชื่อมต่อ LINE OA, POS และร้านค้าออนไลน์ มารวมข้อมูลเป็นโปรไฟล์เดียวต่อลูกค้าหนึ่งคน และสร้างกลุ่มเป้าหมายได้ในโปรไฟล์เดียวกัน',
  en: 'Sample CRM helps you segment customers, send campaigns and see which campaign led to a purchase. Connect LINE OA, POS and your online store to merge the data into one profile per customer, and build target audiences in that same profile.',
};
/** Content of a sample profile. The free one has a single description within the Basic limit instead of the Featured two paragraphs. */
export function sampleContent(featured: boolean): ProfileContent {
  const s = sampleProfile() ?? {};
  return featured ? { ...s, featured: true } : { ...s, featured: false, summary: FREE_SUMMARY, description: FREE_DESCRIPTION, overview: { ...s.overview, text: undefined } };
}

/** Characters of text, not counting spaces or line breaks: how the package limits are measured. */
export const textLength = (s: string) => s.replace(/\s/g, '').length;

/** Shortens s to n characters of text (spaces not counted), at a word break where there is one nearby. */
export const clip = (s: string, n: number) => {
  s = s.trim();
  if (textLength(s) <= n) return s;
  let end = 0;
  for (let count = 0; end < s.length && count < n; end++) if (!/\s/.test(s[end])) count++;
  const cut = s.slice(0, end);
  const space = cut.lastIndexOf(' ');
  // a cut that already ends on a word break stays; otherwise step back to the last space if it is close
  const atBreak = /\s/.test(s[end] ?? ' ');
  return (!atBreak && space > end - 20 ? cut.slice(0, space) : cut).trim() + '…';
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
