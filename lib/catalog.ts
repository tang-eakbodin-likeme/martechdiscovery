// Vendor catalog for the Next.js app. data/catalog.json is written by scripts/export-catalog.mjs (via build.mjs).
import catalog from '@/data/catalog.json';
import type { Locale } from './i18n';

export type Category = { slug: string; name: string; description: string; group: string; nameTh: string; icon: string; descriptionTh: string };
export type Vendor = {
  slug: string; name: string; category: string; description: string; pricing: string; languages: string; fit: string;
  categories: string[]; descriptionTh: string; sponsored: boolean; hasOverride: boolean;
};

export const categories = catalog.categories as Category[];
export const vendors = catalog.vendors as Vendor[];
const logos = catalog.logos as Record<string, string>;

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const getVendor = (slug: string) => vendors.find((v) => v.slug === slug);
export const categoryName = (c: Category, locale: Locale) => (locale === 'th' ? c.nameTh : c.name);
export const categoryDescription = (c: Category, locale: Locale) => (locale === 'th' ? c.descriptionTh : c.description);
export const primaryCategory = (v: Vendor) => categories.find((c) => c.name === v.category) ?? categories.find((c) => v.categories.includes(c.slug)) ?? categories[0];
export const vendorsIn = (slug: string) => vendors.filter((v) => v.categories.includes(slug));
export const logoFile = (name: string): string | undefined => logos[name];

/** The vendor's own description, only when it was supplied (overridden vendors have one). */
export const vendorDescription = (v: Vendor, locale: Locale) => (v.hasOverride ? (locale === 'th' && v.descriptionTh ? v.descriptionTh : v.description) : '');

/** Initials for a vendor without a logo file. */
export const initials = (name: string) => {
  const clean = name.replace(/^(บริษัท|บจก\.?|หจก\.?|the)\s+/i, '').replace(/\s+(co\.?\s*,?\s*ltd\.?|limited|corporation|public company limited)$/i, '').trim();
  return clean.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => [...w][0]).join('').toLocaleUpperCase() || 'M';
};
